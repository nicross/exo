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

  const gravityLeeway = 1/128,
    groundLeeway = 1/16,
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
    // TODO: rcs thrusters

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

  function applyLateralThrust() {
    engine.position.setVelocity(
      calculateNextLateralVelocity()
    )
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

    // TODO: vectoring

    const {z} = engine.position.getVector()
    const terrain = content.terrain.current()
    const tempIsGroundedEnough = z <= terrain + groundLeeway && !isJetActive && !isJumpCooldown

    if (model.jumpForce && tempIsGroundedEnough) {
      // XXX: prevent gravity from accumulating between jumps
      gravity = 0
      isGrounded = false

      isJumpActive = true
      isJumpCooldown = true
      return jump()
    }

    if (isJumpActive) {
      return
    }

    // Kill jets if out of fuel or close to ground
    if (isJetActive && jetDelta >= model.jetCapacity) {
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

    const calculated = nextModel.calculate()

    calculated.lateralAcceleration *= 1 + content.upgrades.aerodynamics.getBonus()
    calculated.lateralDeceleration *= 1 + content.upgrades.brakes.getBonus()
    calculated.jetCapacity *= 1 + content.upgrades.heatSinks.getBonus()
    calculated.jetVelocity *= 1 + content.upgrades.combustors.getBonus()
    calculated.jumpForce *= 1 + content.upgrades.pneumatics.getBonus()

    return {
      ...calculated,
      id: nextModel.id,
      reference: nextModel,
      type: nextModel.type,
    }
  }

  function calculateLateralThrust({
    x = 0,
    y = 0,
  }) {
    normalThrust = engine.utility.vector3d.create({
      x: y * model.xScale,
      y: -x * model.yScale,
    })

    thrust = normalThrust.scale(model.lateralVelocity)
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

  function calculateNextLateralVelocity() {
    // TODO: only scale if slope is against normalThrust
    const dot = normalThrust.dotProduct(slope.forward())
    const scaleFactor = (Math.abs(dot / normalThrust.distance()) || 0) ** 2

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

    return content.utility.accelerate.vector(
      current,
      appliedThrust,
      rate
    ).add({z: gravity})
  }

  function calculateSlope() {
    // Use predicted thrust using last frame's values to approximate vertices for slope calculations
    const delta = engine.loop.delta(),
      position = engine.position.getVector(),
      predictedThrust = calculateNextLateralVelocity().scale(delta),
      quaternion = engine.position.getQuaternion()

    // Rotate back and forth to isolate X and Y components of predicted thrust
    const isolated = predictedThrust.rotateQuaternion(quaternion.conjugate()),
      isolatedX = engine.utility.vector3d.create({x: isolated.x}).rotateQuaternion(quaternion),
      isolatedY = engine.utility.vector3d.create({y: isolated.y}).rotateQuaternion(quaternion)

    // Force depth and width to be at least delta in magnitude
    const depth = isolatedX.distance() > delta
      ? isolatedX
      : quaternion.forward().scale(delta)

    const width = isolatedY.distance() > delta
      ? isolatedY
      : quaternion.right().scale(delta)

    // Calculate vertices for slope calculation
    const back = position.subtract(depth),
      front = position.add(depth),
      left = position.subtract(width),
      right = position.add(width)

    // Resolve z-coordinates of vertices
    back.z = content.terrain.value(back.x, back.y)
    front.z = content.terrain.value(front.x, front.y)
    left.z = content.terrain.value(left.x, left.y)
    right.z = content.terrain.value(right.x, right.y)

    // Calculate slopes along axes defined by vertices
    const frontToBack = back.subtract(front),
      rightToLeft = left.subtract(right)

    // Clamp values so atan2() returns sensible values
    frontToBack.z = engine.utility.clamp(frontToBack.z, -1, 1)
    rightToLeft.z = engine.utility.clamp(rightToLeft.z, -1, 1)

    // Return slope as Euler angle
    return engine.utility.euler.create({
      pitch: Math.atan(frontToBack.z / (depth.distance() * 2)),
      roll: Math.atan(rightToLeft.z / (width.distance() * 2)),
    })
  }

  function calculateSlopeNormal() {
    const distance = engine.utility.distance({
      x: slope.pitch,
      y: slope.roll,
    })

    return engine.utility.clamp(distance / (Math.PI / 2), 0, 1)
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

  function land() {
    engine.position.setVelocity(
      engine.position.getVelocity().subtract({
        z: gravity,
      })
    )

    pubsub.emit('land')
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

  function shouldReflect() {
    const velocity = engine.position.getVelocity()
    const distance = velocity.distance()

    // Glue on low velocities
    if (distance <= 1) {
      return false
    }

    // Glue on low angles
    const dot = velocity.dotProduct(slope.up()),
      theta = Math.acos(dot / distance)

    const range = engine.utility.clamp(engine.utility.scale(distance, 0, content.const.maxWheeledVelocity, Math.PI/3, Math.PI/6), 0, Math.PI/2)
    return !engine.utility.between(theta, Math.PI/2 - range, Math.PI/2 + range)
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
    recalculate: function () {
      intendedModel = calculateIntendedModel()
      model = calculateModel()
      return this
    },
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
    slopeNormal: () => slopeNormal, // TODO: rename to slopeMagnitude
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
        calculateLateralThrust(controls)
        cacheSlope()
        applyAngularThrust(controls.rotate)
        applyLateralThrust()
      }

      if (isGrounded) {
        if (shouldReflect()) {
          reflect()
        } else if (gravity) {
          land()
        }

        gravity = 0
        isJumpCooldown = false
      }

      // Apply gravity only when far enough from ground
      let isGravityApplied = z > terrain + gravityLeeway

      if (isGravityApplied) {
        applyGravity()
      }

      return this
    },
  }, pubsub)
})()

engine.ready(() => {
  content.upgrades.on('upgrade', () => content.movement.recalculate())
})

engine.state.on('export', (data = {}) => data.movement = content.movement.export())
engine.state.on('import', ({movement = {}}) => content.movement.import(movement))
engine.state.on('reset', () => content.movement.reset())
