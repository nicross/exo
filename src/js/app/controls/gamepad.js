app.controls.gamepad = {
  game: function () {
    const state = {}

    if (engine.input.gamepad.hasAxis(2)) {
      state.rotate = engine.input.gamepad.getAxis(2, true)
      state.x = engine.input.gamepad.getAxis(0)
      state.y = engine.input.gamepad.getAxis(1, true)
    } else {
      state.rotate = engine.input.gamepad.getAxis(0, true)
      state.x = 0
      state.y = engine.input.gamepad.getAxis(1, true)
    }

    if (engine.input.gamepad.isDigital(5)) {
      state.z = 1
    }

    if (engine.input.gamepad.isDigital(10) && !app.settings.computed.toggleTurbo) {
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

    if (engine.input.gamepad.isDigital(10) && app.settings.computed.toggleTurbo) {
      state.turbo = true
    }

    if (engine.input.gamepad.isDigital(11)) {
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
