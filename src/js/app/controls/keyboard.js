app.controls.keyboard = {
  game: () => {
    const keys = engine.input.keyboard.get(),
      state = {}

    const jump = keys.Numpad0 || keys.Space,
      moveBackward = keys.ArrowDown || keys.KeyS || keys.Numpad5,
      moveForward = keys.ArrowUp || keys.KeyW || keys.Numpad8,
      strafeLeft = keys.KeyA || keys.Numpad4,
      strafeRight = keys.KeyD || keys.Numpad6,
      turbo = keys.ShiftLeft || keys.ShiftRight,
      turnLeft = keys.ArrowLeft || keys.KeyQ || keys.Numpad7,
      turnRight = keys.ArrowRight || keys.KeyE || keys.Numpad9

    if (moveBackward && !moveForward) {
      state.y = -1
    } else if (moveForward && !moveBackward) {
      state.y = 1
    }

    if (strafeLeft && !strafeRight) {
      state.x = -1
    } else if (strafeRight && !strafeLeft) {
      state.x = 1
    }

    if (turnLeft && !turnRight) {
      state.rotate = 1
    } else if (turnRight && !turnLeft) {
      state.rotate = -1
    }

    if (jump) {
      state.z = 1
    }

    if (turbo && !app.settings.computed.toggleTurbo) {
      state.turbo = true
    }

    return state
  },
  ui: () => {
    const keys = engine.input.keyboard.get(),
      state = {}

    if (keys.Backspace) {
      state.backspace = true
    }

    if (keys.Enter || keys.NumpadEnter) {
      state.enter = true
    }

    if (keys.Escape) {
      state.escape = true
    }

    if (keys.Space) {
      state.space = true
    }

    if (keys.ArrowDown || keys.KeyS || keys.Numpad5) {
      state.down = true
    }

    if (keys.ArrowLeft || keys.KeyA || keys.Numpad4) {
      state.left = true
    }

    if (keys.ArrowRight || keys.KeyD || keys.Numpad6) {
      state.right = true
    }

    if (keys.ArrowUp || keys.KeyW || keys.Numpad8) {
      state.up = true
    }

    if ((keys.ShiftLeft || keys.ShiftRight) && app.settings.computed.toggleTurbo) {
      state.turbo = true
    }

    if (keys.KeyF) {
      state.scan = true
    }

    if (keys.KeyR || keys.KeyV) {
      state.mode = true
    }

    if (keys.Digit1) {
      state.focus = 0
    } else if (keys.Digit2) {
      state.focus = 1
    } else if (keys.Digit3) {
      state.focus = 2
    } else if (keys.Digit4) {
      state.focus = 3
    } else if (keys.Digit5) {
      state.focus = 4
    } else if (keys.Digit6) {
      state.focus = 5
    } else if (keys.Digit7) {
      state.focus = 6
    } else if (keys.Digit8) {
      state.focus = 7
    } else if (keys.Digit9) {
      state.focus = 8
    } else if (keys.Digit0) {
      state.focus = 9
    }

    return state
  },
}
