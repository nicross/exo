content.movement = (() => {
  const modelLerpProperties = [
    'angularAcceleration',
    'angularDeceleration',
    'angularVelocity',
    'depth',
    'height',
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
    surfaceGlueThreshold = 1/8,
    transitionRate = 1

  let intendedMode = 0,
    intendedModel = {},
    intendedTurbo = 0,
    isGrounded = false,
    mode = 0,
    model = {},
    turbo = 0,
    slope

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
      return
    }

    const delta = engine.loop.delta(),
      velocity = engine.position.getVelocity()

    velocity.z -= engine.const.gravity * delta

    engine.position.setVelocity(velocity)
  }

  function applyLateralThrust(controls = {}) {
    // TODO: The model might allow some thrusting mid-flight
    if (!isGrounded) {
      return
    }

    const thrust = engine.utility.vector3d.create({
      x: controls.y * model.xScale,
      y: -controls.x * model.yScale,
    }).scale(model.lateralVelocity).rotateQuaternion(engine.position.getQuaternion())

    const rate = thrust.distance() > engine.position.getVelocity().distance()
      ? model.lateralAcceleration
      : model.lateralDeceleration

    const currentVelocity = engine.position.getVelocity()

    const velocity = content.utility.accelerate.vector(
      currentVelocity,
      thrust,
      rate
    )

    // Preserve z velocity
    velocity.z = currentVelocity.z

    engine.position.setVelocity(velocity)
  }

  function applyVerticalThrust(zThrust) {
    if (!zThrust) {
      return
    }

    if (model.jumpForce && isGrounded) {
      return jump()
    }

    // TODO: Jets
  }

  function calculateIntendedModel() {
    if (intendedMode == 0 && intendedTurbo == 0) {
      return content.movementModel.bipedalSlow.calculate()
    }

    if (intendedMode == 0 && intendedTurbo == 1) {
      return content.movementModel.bipedalFast.calculate()
    }

    if (intendedMode == 1 && intendedTurbo == 0) {
      return content.movementModel.wheeledSlow.calculate()
    }

    if (intendedMode == 1 && intendedTurbo == 1) {
      return content.movementModel.wheeledFast.calculate()
    }

    return {}
  }

  function calculateIsGrounded() {
    const {z} = engine.position.getVector()
    const surface = content.surface.current()
    return z - surface <= surfaceGlueThreshold
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

    back.z = content.surface.value(back.x, back.y)
    front.z = content.surface.value(front.x, front.y)
    left.z = content.surface.value(left.x, left.y)
    right.z = content.surface.value(right.x, right.y)

    const frontToBack = back.subtract(front),
      leftToRight = right.subtract(left)

    return engine.utility.euler.create({
      pitch: Math.acos(frontToBack.z / model.depth) - halfPi,
      roll: Math.acos(leftToRight.z / model.width) - halfPi,
    })
  }

  function jump() {
    // TODO: jump cooldown
    // TODO: emit jump event

    engine.position.setVelocity(
      engine.position.getVelocity().add({
        z: model.jumpForce,
      })
    )
  }

  function lerpModel(a, b, value) {
    const model = {}

    for (const property of modelLerpProperties) {
      model[property] = engine.utility.lerp(a[property], b[property], value)
    }

    // TODO: modelLerpMethods which compose methods and lerp the result

    return model
  }

  return {
    export: () => ({
      mode: intendedMode,
    }),
    import: function (data = {}) {
      intendedMode = data.mode || 0
      intendedTurbo = 0

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
    isWheeled: () => intendedMode == 1,
    mode: () => mode,
    model: () => ({...model}),
    reset: function () {
      intendedMode = 0
      intendedModel = {}
      intendedTurbo = 0
      isGrounded = true
      model = {}
      mode = 0
      slope = undefined
      turbo = 0
      return this
    },
    slope: () => slope,
    toggleMode: function () {
      intendedMode = intendedMode ? 0 : 1
      intendedModel = calculateIntendedModel()
      // TODO: emit modeSwitch event
      return this
    },
    turbo: () => turbo,
    update: function (controls = {}) {
      if (Number(controls.turbo) != intendedTurbo) {
        intendedTurbo = Number(controls.turbo)
        intendedModel = calculateIntendedModel()
        // TODO: emit turboSwitch event
      }

      if (mode != intendedMode) {
        mode = content.utility.accelerate.value(mode, intendedMode, transitionRate)
      }

      if (turbo != intendedTurbo) {
        turbo = content.utility.accelerate.value(turbo, intendedTurbo, transitionRate)
      }

      if (mode != intendedMode || turbo != intendedTurbo) {
        model = calculateModel()
      }

      // TODO: Collision detection
      // TODO: Glue to surface / match slope

      isGrounded = calculateIsGrounded()

      applyAngularThrust(controls.rotate)
      applyLateralThrust(controls)
      applyVerticalThrust(controls.z)
      applyGravity()

      if (isGrounded) {
        slope = calculateSlope()
      }

      return this
    },
  }
})()

engine.state.on('export', (data = {}) => data.movement = content.movement.export())
engine.state.on('import', ({movement = {}}) => content.movement.import(movement))
engine.state.on('reset', () => content.movement.reset())
