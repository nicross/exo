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
    'width',
    'xScale',
    'yScale',
  ]

  const halfPi = Math.PI / 2,
    groundThreshold = 1/64,
    reflectionRate = 1/2,
    transitionRate = 1

  let gravity = 0,
    intendedMode = 0,
    intendedModel = {},
    intendedTurbo = 0,
    isGrounded = false,
    isJetActive,
    jetDelta = 0,
    jumpCooldown = true,
    mode = 0,
    model = {},
    normalThrust = engine.utility.vector3d.create(),
    slope = engine.utility.euler.create(),
    slopeNormal = 0,
    thrust = engine.utility.vector3d.create(),
    turbo = 0

  function applyAngularThrust(rotate) {
    // TODO: The model might allow some thrusting mid-flight
    if (!isGrounded) {
      return
    }

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

    if (isGrounded) {
      // Reset z-velocity due to gravity
      gravity = 0
      return
    }

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
  }

  function applyLateralThrust(controls = {}) {
    // TODO: The model might allow some thrusting mid-flight
    if (!isGrounded) {
      return
    }

    normalThrust = engine.utility.vector3d.create({
      x: controls.y * model.xScale,
      y: -controls.x * model.yScale,
    })

    thrust = normalThrust.scale(model.lateralVelocity).rotateQuaternion(
      engine.utility.quaternion.fromEuler({
        pitch: slope.pitch,
        roll: slope.roll,
        yaw: engine.position.getEuler().yaw,
      })
    )

    // Adjust thrust based on slope
    const slopeAngle = engine.utility.normalizeAngle(Math.atan2(-slope.roll, -slope.pitch)),
      thrustAngle = engine.utility.normalizeAngle(Math.atan2(normalThrust.y, normalThrust.x))

    // TODO: expose for sound design (angle of thrust relative to slope)
    const deltaAngle = Math.abs(engine.utility.normalizeAngleSigned(slopeAngle - thrustAngle))

    const deltaAngleFactor = deltaAngle > Math.PI/4
      ? 1
      : (deltaAngle / (Math.PI/4)) ** 4

    // TODO: slopeFactor inclines a function of model?
    const slopeFactor = slopeNormal < 0.25
      ? 1
      : engine.utility.clamp(engine.utility.scale(slopeNormal, 0.25, 0.5, 1, 0), 0, 1) ** 4

    const scaleFactor = engine.utility.lerp(slopeFactor, 1, deltaAngleFactor)
    const appliedThrust = thrust.scale(scaleFactor)

    // Accelerate to next velocity
    const rate = appliedThrust.distance() > (engine.position.getVelocity().distance() - gravity)
      ? model.lateralAcceleration
      : model.lateralDeceleration

    const velocity = content.utility.accelerate.vector(
      engine.position.getVelocity(),
      appliedThrust,
      rate
    )

    engine.position.setVelocity(velocity)
  }

  function applyVerticalThrust(zThrust) {
    const delta = engine.loop.delta()

    if (!zThrust) {
      isJetActive = false
      jetDelta = Math.max(jetDelta - delta, 0)
      jumpCooldown = false
      return
    }

    if (model.jumpForce && isGrounded) {
      jumpCooldown = true
      return jump()
    }

    if (jumpCooldown || jetDelta >= model.jetCapacity) {
      isJetActive = false
      return
    }

    jets()

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

  function calculateIsGrounded() {
    const {z} = engine.position.getVector()
    const terrain = content.terrain.current()
    return z - terrain <= groundThreshold
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
    const position = engine.position.getVector(),
      quaternion = engine.position.getQuaternion()

    const depth = quaternion.forward().scale(model.depth / 2),
      width = quaternion.right().scale(model.width / 2)

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
      pitch: Math.acos(backToFront.z / model.depth) - halfPi,
      roll: Math.acos(rightToLeft.z / model.width) - halfPi,
    })
  }

  function calculateSlopeNormal() {
    const distance = engine.utility.distance({
      x: slope.pitch,
      y: slope.yaw,
    })

    return engine.utility.clamp(distance / (Math.PI / 2), 0, 1)
  }

  function glueToSurface() {
    const position = engine.position.getVector(),
      terrain = content.terrain.current()

    if (position.z > terrain) {
      return
    }

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

    glueToSurface()
    isGrounded = false
    gravity = 0

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

      isGrounded = calculateIsGrounded()

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
    isJetActive: () => isJetActive,
    isSlow: () => intendedTurbo == 0,
    isWheeled: () => intendedMode == 1,
    jetDelta: () => jetDelta,
    jetProgress: () => jetDelta / model.jetCapacity,
    jumpCooldown: () => jumpCooldown,
    mode: () => mode,
    model: () => ({...model}),
    normalThrust: () => normalThrust,
    reset: function () {
      gravity = 0
      intendedMode = 0
      intendedModel = {}
      intendedTurbo = 0
      isGrounded = true
      jetDelta = 0
      jumpCooldown = false
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
      pubsub.emit('mode')
      pubsub.emit('mode-' + intendedModel.type)
      pubsub.emit('mode-' + intendedModel.id)
      return this
    },
    thrust: () => thrust,
    turbo: () => turbo,
    update: function (controls = {}) {
      if (Number(controls.turbo) != intendedTurbo) {
        intendedTurbo = Number(controls.turbo)
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

      isGrounded = calculateIsGrounded()

      if (isGrounded) {
        cacheSlope()
      }

      // TODO: collision detection and reflection, e.g. flying headfirst into a mountain

      applyAngularThrust(controls.rotate)
      applyLateralThrust(controls)
      applyVerticalThrust(controls.z)

      if (isGrounded) {
        if (gravity < -engine.const.gravity) {
          reflect()
        } else {
          glueToSurface()
        }
      }

      applyGravity()

      return this
    },
  }, pubsub)
})()

engine.state.on('export', (data = {}) => data.movement = content.movement.export())
engine.state.on('import', ({movement = {}}) => content.movement.import(movement))
engine.state.on('reset', () => content.movement.reset())
