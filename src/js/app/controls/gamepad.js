app.controls.gamepad = {
  game: function () {
    const state = {}

    let rotate = 0,
      x = 0,
      y = 0

    if (engine.input.gamepad.hasAxis(2)) {
      rotate = engine.input.gamepad.getAxis(2, true)
      x = engine.input.gamepad.getAxis(0)
      y = engine.input.gamepad.getAxis(1, true)
    } else {
      rotate = engine.input.gamepad.getAxis(0, true)
      y = engine.input.gamepad.getAxis(1, true)
    }

    y -= engine.input.gamepad.getAnalog(6)
    y += engine.input.gamepad.getAnalog(7)

    if (engine.input.gamepad.isDigital(12)) {
      y = 1
    }

    if (engine.input.gamepad.isDigital(13)) {
      y = -1
    }

    if (engine.input.gamepad.isDigital(14)) {
      rotate = 1
    }

    if (engine.input.gamepad.isDigital(15)) {
      rotate = -1
    }

    if (engine.input.gamepad.isDigital(0) || engine.input.gamepad.isDigital(5)) {
      state.z = 1
    }

    rotate = engine.utility.clamp(rotate, -1, 1) || 0
    x = engine.utility.clamp(x, -1, 1) || 0
    y = engine.utility.clamp(y, -1, 1) || 0

    if (rotate) {
      state.rotate = rotate
    }

    if (x) {
      state.x = x
    }

    if (y) {
      state.y = y
    }

    if (!app.settings.computed.toggleTurbo && (engine.input.gamepad.isDigital(1) || engine.input.gamepad.isDigital(10))) {
      state.turbo = true
    }

    return state
  },
  ui: function () {
    const state = {}

    let x = engine.input.gamepad.getAxis(0),
      y = engine.input.gamepad.getAxis(1, true)

    if (engine.input.gamepad.isDigital(0)) {
      state.confirm = true
    }

    if (engine.input.gamepad.isDigital(1)) {
      state.cancel = true
    }

    if (engine.input.gamepad.isDigital(2) || engine.input.gamepad.isDigital(4)) {
      state.scan = true
    }

    if (engine.input.gamepad.isDigital(8)) {
      state.select = true
    }

    if (engine.input.gamepad.isDigital(9)) {
      state.start = true
    }

    if (engine.input.gamepad.isDigital(12)) {
      y = 1
    }

    if (engine.input.gamepad.isDigital(13)) {
      y = -1
    }

    if (engine.input.gamepad.isDigital(14)) {
      x = -1
    }

    if (engine.input.gamepad.isDigital(15)) {
      x = 1
    }

    if (app.settings.computed.toggleTurbo && (engine.input.gamepad.isDigital(1) || engine.input.gamepad.isDigital(10))) {
      state.turbo = true
    }

    if (engine.input.gamepad.isDigital(3) || engine.input.gamepad.isDigital(11)) {
      state.mode = true
    }

    const absX = Math.abs(x),
      absY = Math.abs(y)

    if (absX - absY >= 0.125) {
      if (x < 0) {
        state.left = true
      } else {
        state.right = true
      }
    } else if (absY - absX >= 0.125) {
      if (y < 0) {
        state.down = true
      } else {
        state.up = true
      }
    }

    return state
  },
}
