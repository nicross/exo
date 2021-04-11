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
    glueThreshold = -1/8,
    groundThreshold = 1/128,
    reflectionRate = 1/2,
    transitionRate = 1

  let gravity = 0,
    intendedMode = 0,
    intendedModel = {},
    intendedTurbo = 0,
    isGrounded = false,
    jetDelta = 0,
    jumpCooldown = true,
    mode = 0,
    model = {},
    normalThrust = engine.utility.vector3d.create(),
    turbo = 0,
    slope = engine.utility.euler.create(),
    thrust = engine.utility.vector3d.create()

  function alignToSlope() {
    if (!isGrounded) {
      return
    }

    // TODO: Optimize with quaternions

    const {yaw} = engine.position.getEuler()

    engine.position.setEuler({
      ...slope,
      yaw,
    })
  }

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

    thrust = normalThrust.scale(model.lateralVelocity).rotateQuaternion(engine.position.getQuaternion())

    // TODO: rework so rate isn't influenced by gravity
    const rate = thrust.distance() > engine.position.getVelocity().distance()
      ? model.lateralAcceleration
      : model.lateralDeceleration

    // TODO: rework so this preserves gravity on steep slopes
    const velocity = content.utility.accelerate.vector(
      engine.position.getVelocity(),
      thrust,
      rate
    )

    engine.position.setVelocity(velocity)
  }

  function applyVerticalThrust(zThrust) {
    const delta = engine.loop.delta()

    if (!zThrust) {
      jetDelta = Math.max(jetDelta - delta, 0)
      jumpCooldown = false
      return
    }

    if (model.jumpForce && isGrounded) {
      jumpCooldown = true
      return jump()
    }

    if (jumpCooldown || jetDelta >= model.jetCapacity) {
      return
    }

    jets()
    jetDelta += delta
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

    const depth = engine.utility.vector3d.create({x: model.depth / 2}).rotateQuaternion(quaternion),
      width = engine.utility.vector3d.create({y: model.width / 2}).rotateQuaternion(quaternion)

    const back = position.subtract(depth),
      front = position.add(depth),
      left = position.subtract(width),
      right = position.add(width)

    back.z = content.terrain.value(back.x, back.y)
    front.z = content.terrain.value(front.x, front.y)
    left.z = content.terrain.value(left.x, left.y)
    right.z = content.terrain.value(right.x, right.y)

    const backToFront = front.subtract(back),
      leftToRight = right.subtract(left)

    return engine.utility.euler.create({
      pitch: Math.acos(backToFront.z / model.depth) - halfPi,
      roll: Math.acos(leftToRight.z / model.width) - halfPi,
    })
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
    // TODO: use slope.up(), understand why it always bounces to left

    const perpendicular = engine.utility.vector3d.unitZ(),
      velocity = engine.position.getVelocity()

    const reflection = perpendicular
      .scale(-2 * velocity.dotProduct(perpendicular))
      .add(velocity)
      .scale(reflectionRate)

    // Emit collision event before setting velocity so true velocity is accessible
    pubsub.emit('collision')

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
      slope = calculateSlope()

      return this
    },
    intendedMode: () => intendedMode,
    intendedModel: () => ({...intendedModel}),
    intendedTurbo: () => intendedTurbo,
    isBipedal: () => intendedMode == 0,
    isFast: () => intendedTurbo == 1,
    isGrounded: () => isGrounded,
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
      thrust = engine.utility.vector3d.create()
      turbo = 0
      return this
    },
    slope: () => slope,
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
        slope = calculateSlope()
        alignToSlope()
      }

      applyAngularThrust(controls.rotate)
      applyLateralThrust(controls)
      applyVerticalThrust(controls.z)

      if (isGrounded) {
        if (gravity < glueThreshold) {
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
