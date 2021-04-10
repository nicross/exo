content.movement = (() => {
  const transitionRate = 1

  let intendedMode = 0,
    intendedModel = {},
    intendedTurbo = 0,
    mode = 0,
    model = {},
    turbo = 0

  function applyAngularThrust(rotate) {
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

  function applyLateralThrust(controls = {}) {
    const thrust = engine.utility.vector3d.create({
      x: controls.y * model.xScale,
      y: -controls.x * model.yScale,
    }).scale(model.lateralVelocity).rotateQuaternion(engine.position.getQuaternion())

    const rate = thrust.distance() > engine.position.getVelocity().distance()
      ? model.lateralAcceleration
      : model.lateralDeceleration

    engine.position.setVelocity(
      content.utility.accelerate.vector(
        engine.position.getVelocity(),
        thrust,
        rate
      )
    )
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

  function lerpModel(a, b, value) {
    return {
      angularAcceleration: engine.utility.lerp(a.angularAcceleration, b.angularAcceleration, value),
      angularDeceleration: engine.utility.lerp(a.angularDeceleration, b.angularDeceleration, value),
      angularVelocity: engine.utility.lerp(a.angularVelocity, b.angularVelocity, value),
      lateralAcceleration: engine.utility.lerp(a.lateralAcceleration, b.lateralAcceleration, value),
      lateralDeceleration: engine.utility.lerp(a.lateralDeceleration, b.lateralDeceleration, value),
      lateralVelocity: engine.utility.lerp(a.lateralVelocity, b.lateralVelocity, value),
      rotateScale: engine.utility.lerp(a.rotateScale, b.rotateScale, value),
      xScale: engine.utility.lerp(a.xScale, b.xScale, value),
      yScale: engine.utility.lerp(a.yScale, b.yScale, value),
    }
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
      model = {}
      mode = 0
      turbo = 0
      return this
    },
    thrust: () => thrust,
    toggleMode: function () {
      intendedMode = intendedMode ? 0 : 1
      intendedModel = calculateIntendedModel()
      // TODO: emit event
      return this
    },
    turbo: () => turbo,
    update: function (controls = {}) {
      if (Number(controls.turbo) != intendedTurbo) {
        intendedTurbo = Number(controls.turbo)
        intendedModel = calculateIntendedModel()
        // TODO: emit event
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

      // TODO: Jumping
      // TODO: Jump jets
      // TODO: Apply gravity
      // TODO: Collision detection
      // TODO: Glue to surface

      applyAngularThrust(controls.rotate)
      applyLateralThrust(controls)

      return this
    },
  }
})()

engine.state.on('export', (data = {}) => data.movement = content.movement.export())
engine.state.on('import', ({movement = {}}) => content.movement.import(movement))
engine.state.on('reset', () => content.movement.reset())
