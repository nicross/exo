app.controls = (() => {
  const gameDefaults = {
    rotate: 0,
    x: 0,
    y: 0,
  }

  let uiCache = {},
    uiDelta = {}

  let gameCache = {...gameDefaults}

  function updateGame() {
    gameCache = {
      ...gameDefaults,
      ...app.controls.gamepad.game(),
      ...app.controls.keyboard.game(),
      ...app.controls.mouse.game(),
    }
  }

  function updateUi() {
    const values = {
      ...app.controls.gamepad.ui(),
      ...app.controls.keyboard.ui(),
      ...app.controls.mouse.ui(),
    }

    uiDelta = {}

    for (const key in values) {
      if (!(key in uiCache)) {
        uiDelta[key] = values[key]
      }
    }

    uiCache = values
  }

  return {
    game: () => ({...gameCache}),
    ui: () => ({...uiDelta}),
    reset: function () {
      gameCache = {}
      uiCache = {}
      uiDelta = {}
      return this
    },
    update: function () {
      updateGame()
      updateUi()
      return this
    },
  }
})()

engine.loop.on('frame', () => app.controls.update())
