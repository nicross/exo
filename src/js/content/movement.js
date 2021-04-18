content.movement = (() => {
  const pubsub = engine.utility.pubsub.create()

  const modelLerpProperties = [
    'angularAcceleration',
    'angularDeceleration',
    'angularVelocity',
    'depth',
    'height',
    'jetAcceleration',
    'jetCapacity',
    'jetVelocity',
    'jumpForce',
    'lateralAcceleration',
    'lateralDeceleration',
    'lateralVelocity',
    'rotateScale',
    'strideLength',
    'width',
    'xScale',
    'yScale',
  ]

  const groundLeeway = 1/16,
    reflectionRate = 1/4,
    transitionRate = 1

  let gravity = 0,
    intendedMode = 0,
    intendedModel = {},
    intendedTurbo = 0,
    isGrounded = false,
    isGroundedEnough = false,
    isJetActive = false,
    isJumpActive = false,
    isJumpCooldown = false,
    jetDelta = 0,
    mode = 0,
    model = {},
    normalThrust = engine.utility.vector3d.create(),
    slope = engine.utility.euler.create(),
    slopeNormal = 0,
    thrust = engine.utility.vector3d.create(),
    turbo = 0

  function applyAngularThrust(rotate = 0) {
    // TODO: The model might allow some thrusting mid-flight
    // TODO: Should wheeled only rotate when velocity nonzero?
    const {yaw} = engine.position.getAngularVelocityEuler()

    if (!rotate) {
      return engine.position.setAngularVelocityEuler({
        yaw: content.utility.accelerate.value(
          yaw,
          0,
          model.angularDeceleration
        ),
      })
    }

    engine.position.setAngularVelocityEuler({
      yaw: content.utility.accelerate.value(
        yaw,
        rotate * model.rotateScale * model.angularVelocity,
        model.angularAcceleration
      ),
    })
  }

  function applyGravity() {
    // TODO: apply slippage on steep slopes when wheeled

    const deltaGravity = engine.const.gravity * engine.loop.delta(),
      velocity = engine.position.getVelocity()

    // Only track when gravity results in negative z-velocity
    if (velocity.z <= 0) {
      gravity -= deltaGravity
    } else if (velocity.z < deltaGravity) {
      gravity -= deltaGravity - velocity.z
    }

    velocity.z -= deltaGravity
    engine.position.setVelocity(velocity)

    if (gravity < 0) {
      isJumpCooldown = false
    }
  }

  function applyLateralThrust({
    x: controlsX = 0,
    y: controlsY = 0,
  } = {}) {
    // TODO: The model might allow some thrusting mid-flight
    normalThrust = engine.utility.vector3d.create({
      x: controlsY * model.xScale,
      y: -controlsX * model.yScale,
    })

    thrust = normalThrust.scale(model.lateralVelocity)

    // Adjust thrust based on slope
    const slopeAngle = engine.utility.normalizeAngle(Math.atan2(-slope.roll, -slope.pitch)),
      thrustAngle = engine.utility.normalizeAngle(Math.atan2(normalThrust.y, normalThrust.x))

    const deltaAngle = Math.abs(engine.utility.normalizeAngleSigned(slopeAngle - thrustAngle)),
      deltaAngleFactor = Math.abs(Math.sin(deltaAngle / 2)) ** 4

    // TODO: slopeFactor inclines a function of model?
    const slopeFactor = slopeNormal < 0.5
      ? 1
      : engine.utility.clamp(engine.utility.scale(slopeNormal, 0.5, 1, 1, 0), 0, 1)

    // TODO: expose this for actuators
    const scaleFactor = engine.utility.lerp(1, slopeFactor, deltaAngleFactor)

    const appliedThrust = thrust.scale(scaleFactor).rotateQuaternion(
      engine.utility.quaternion.fromEuler({
        pitch: slope.pitch,
        roll: slope.roll,
        yaw: engine.position.getEuler().yaw,
      })
    )

    // Accelerate to next velocity, ignorning gravity
    const current = engine.position.getVelocity().subtract({z: gravity})

    const rate = appliedThrust.distance() > current.distance()
      ? model.lateralAcceleration
      : model.lateralDeceleration

    const next = content.utility.accelerate.vector(
      current,
      appliedThrust,
      rate
    ).add({z: gravity})

    engine.position.setVelocity(next)
  }

  function applyVerticalThrust(zThrust = 0) {
    const delta = engine.loop.delta()

    if (!zThrust) {
      isJetActive = false
      isJumpActive = false
      isJumpCooldown = false
      jetDelta = Math.max(jetDelta - delta, 0)
      return
    }

    if (model.jumpForce && isGrounded && !isJetActive && !isJumpCooldown) {
      isGrounded = false
      isJumpActive = true
      isJumpCooldown = true
      return jump()
    }

    if (isJumpActive) {
      return
    }

    if (jetDelta >= model.jetCapacity) {
      isJetActive = false
      return
    }

    jets()

    isGrounded = false
    isJetActive = true
    jetDelta += delta
  }

  function cacheSlope() {
    slope = calculateSlope()
    slopeNormal = calculateSlopeNormal()
  }

  function calculateIntendedModel() {
    let nextModel = content.movementModel.null

    if (intendedMode == 0 && intendedTurbo == 0) {
      nextModel = content.movementModel.bipedalSlow
    } else if (intendedMode == 0 && intendedTurbo == 1) {
      nextModel = content.movementModel.bipedalFast
    } else if (intendedMode == 1 && intendedTurbo == 0) {
      nextModel = content.movementModel.wheeledSlow
    } else if (intendedMode == 1 && intendedTurbo == 1) {
      nextModel = content.movementModel.wheeledFast
    }

    return {
      ...nextModel.calculate(),
      id: nextModel.id,
      reference: nextModel,
      type: nextModel.type,
    }
  }

  function calculateModel() {
    return lerpModel(
      lerpModel(
        content.movementModel.bipedalSlow.calculate(),
        content.movementModel.bipedalFast.calculate(),
        turbo
      ),
      lerpModel(
        content.movementModel.wheeledSlow.calculate(),
        content.movementModel.wheeledFast.calculate(),
        turbo
      ),
      mode
    )
  }

  function calculateSlope() {
    const delta = 1 / 1000,
      position = engine.position.getVector(),
      quaternion = engine.position.getQuaternion()

    const depth = quaternion.forward().scale(delta),
      width = quaternion.right().scale(delta)

    const back = position.subtract(depth),
      front = position.add(depth),
      left = position.subtract(width),
      right = position.add(width)

    back.z = content.terrain.value(back.x, back.y)
    front.z = content.terrain.value(front.x, front.y)
    left.z = content.terrain.value(left.x, left.y)
    right.z = content.terrain.value(right.x, right.y)

    const backToFront = front.subtract(back),
      rightToLeft = left.subtract(right)

    backToFront.z = engine.utility.clamp(backToFront.z, -1, 1)
    rightToLeft.z = engine.utility.clamp(rightToLeft.z, -1, 1)

    return engine.utility.euler.create({
      pitch: Math.atan(backToFront.z / (delta * 2)),
      roll: Math.atan(rightToLeft.z / (delta * 2)),
    })
  }

  function calculateSlopeNormal() {
    const distance = engine.utility.distance({
      x: slope.pitch,
      y: slope.roll,
    })

    return engine.utility.clamp(distance / (Math.PI / 2), 0, 1)
  }

  function glueVelocity() {
    let velocity = engine.position.getVelocity()

    if (gravity) {
      velocity = velocity.add(
        slope.forward().scale(Math.abs(gravity) * reflectionRate)
      ).subtract({
        z: gravity,
      })
    }

    // TODO: Rotate velocity toward slope.forward()

    engine.position.setVelocity(velocity)
  }

  function glueZ() {
    const position = engine.position.getVector(),
      terrain = content.terrain.current()

    engine.position.setVector({
      ...position,
      z: terrain,
    })
  }

  function jets() {
    const velocity = engine.position.getVelocity()

    engine.position.setVelocity({
      ...velocity,
      z: content.utility.accelerate.value(velocity.z, model.jetVelocity, model.jetAcceleration),
    })
  }

  function jump() {
    const velocity = engine.position.getVelocity()

    engine.position.setVelocity({
      ...velocity,
      z: model.jumpForce,
    })

    pubsub.emit('jump')
  }

  function lerpModel(a, b, value) {
    const model = {}

    for (const property of modelLerpProperties) {
      model[property] = engine.utility.lerp(a[property], b[property], value)
    }

    // TODO: modelLerpMethods which compose methods and lerp the result

    return model
  }

  function reflect() {
    const normal = slope.up(),
      velocity = engine.position.getVelocity()

    const reflection = velocity
      .subtract(normal.scale(2 * velocity.dotProduct(normal)))
      .scale(reflectionRate)

    // Emit event before setting velocity so true velocity is accessible
    pubsub.emit('reflect')

    engine.position.setVelocity(reflection)
  }

  function shouldGlue() {
    const velocity = engine.position.getVelocity()
    const distance = velocity.distance()

    // Glue on low velocities
    if (engine.utility.round(distance, 1) == 0) {
      return true
    }

    // Glue on low angles
    const dot = velocity.dotProduct(slope.up())
    const theta = Math.acos(dot / distance)

    return gravity
      ? engine.utility.between(theta, Math.PI/2*8/9, Math.PI/2*10/9)
      : engine.utility.between(theta, Math.PI/2*4.5/9, Math.PI/2*13.5/9)
  }

  return engine.utility.pubsub.decorate({
    export: () => ({
      jetDelta,
      mode: intendedMode,
    }),
    gravity: () => gravity,
    import: function (data = {}) {
      gravity = 0

      intendedMode = data.mode || 0
      intendedTurbo = 0

      jetDelta = data.jetDelta || 0

      mode = intendedMode
      turbo = intendedTurbo

      intendedModel = calculateIntendedModel()
      model = {...intendedModel}

      const {z} = engine.position.getVector()
      const terrain = content.terrain.current()

      isGrounded = z <= terrain
      isGroundedEnough = isGrounded

      if (isGrounded) {
        cacheSlope()
      }

      return this
    },
    intendedMode: () => intendedMode,
    intendedModel: () => ({...intendedModel}),
    intendedTurbo: () => intendedTurbo,
    isBipedal: () => intendedMode == 0,
    isFast: () => intendedTurbo == 1,
    isGrounded: () => isGrounded,
    isGroundedEnough: () => isGroundedEnough,
    isJetActive: () => isJetActive,
    isSlow: () => intendedTurbo == 0,
    isWheeled: () => intendedMode == 1,
    jetDelta: () => jetDelta,
    jetProgress: () => jetDelta / model.jetCapacity,
    mode: () => mode,
    model: () => ({...model}),
    normalThrust: () => normalThrust,
    reset: function () {
      gravity = 0
      intendedMode = 0
      intendedModel = {}
      intendedTurbo = 0
      isGrounded = true
      isGroundedEnough = true
      isJetActive = false
      isJumpActive = false
      isJumpCooldown = false
      jetDelta = 0
      model = {}
      mode = 0
      normalThrust = engine.utility.vector3d.create()
      slope = engine.utility.euler.create()
      slopeNormal = 0
      thrust = engine.utility.vector3d.create()
      turbo = 0
      return this
    },
    slope: () => slope,
    slopeNormal: () => slopeNormal,
    toggleMode: function () {
      intendedMode = intendedMode ? 0 : 1
      intendedModel = calculateIntendedModel()

      isJumpActive = false
      isJumpCooldown = false

      pubsub.emit('mode')
      pubsub.emit('mode-' + intendedModel.type)
      pubsub.emit('mode-' + intendedModel.id)

      return this
    },
    thrust: () => thrust,
    turbo: () => turbo,
    update: function (controls = {}) {
      if (Number(controls.turbo) != intendedTurbo) {
        intendedTurbo = Number(controls.turbo) || 0
        intendedModel = calculateIntendedModel()
        pubsub.emit('turbo')
        pubsub.emit('turbo-' + intendedModel.type)
        pubsub.emit('turbo-' + intendedModel.id)
      }

      const shouldRecalculateModel = mode != intendedMode || turbo != intendedTurbo

      if (mode != intendedMode) {
        mode = content.utility.accelerate.value(mode, intendedMode, transitionRate)
      }

      if (turbo != intendedTurbo) {
        turbo = content.utility.accelerate.value(turbo, intendedTurbo, transitionRate)
      }

      if (shouldRecalculateModel) {
        model = calculateModel()
      }

      const {z} = engine.position.getVector()
      const terrain = content.terrain.current()

      isGrounded = z <= terrain

      if (isGrounded) {
        glueZ()
      }

      applyVerticalThrust(controls.z)

      isGroundedEnough = z <= terrain + groundLeeway && !isJetActive && !isJumpCooldown

      if (isGroundedEnough) {
        cacheSlope()
        applyAngularThrust(controls.rotate)
        applyLateralThrust(controls)
      }

      if (isGrounded) {
        if (shouldGlue()) {
          // TODO: sound when sticking a landing
          glueVelocity()
        } else {
          reflect()
        }
      }

      if (!isGroundedEnough) {
        applyGravity()
      } else {
        gravity = 0
        isJumpCooldown = false
      }

      return this
    },
  }, pubsub)
})()

engine.state.on('export', (data = {}) => data.movement = content.movement.export())
engine.state.on('import', ({movement = {}}) => content.movement.import(movement))
engine.state.on('reset', () => content.movement.reset())
