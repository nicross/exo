app.screen.newGame = (() => {
  let root

  engine.ready(() => {
    root = document.querySelector('.a-newGame')

    app.state.screen.on('enter-newGame', onEnter)
    app.state.screen.on('exit-newGame', onExit)

    Object.entries({
      back: root.querySelector('.a-newGame--back'),
      new: root.querySelector('.a-newGame--new'),
      plus: root.querySelector('.a-newGame--plus'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.state.screen.dispatch(event))
    })

    app.utility.focus.trap(root)
  })

  function handleControls() {
    const ui = app.controls.ui()

    if (ui.confirm) {
      const focused = app.utility.focus.get(root)

      if (focused) {
        return focused.click()
      }
    }

    if ('focus' in ui) {
      const toFocus = app.utility.focus.selectFocusable(root)[ui.focus]

      if (toFocus) {
        if (app.utility.focus.is(toFocus)) {
          return toFocus.click()
        }

        return app.utility.focus.set(toFocus)
      }
    }

    if (ui.up) {
      return app.utility.focus.setPreviousFocusable(root)
    }

    if (ui.down) {
      return app.utility.focus.setNextFocusable(root)
    }
  }

  function hasNewGamePlus() {
    const game = app.storage.getGame()

    if (!game.upgrades) {
      return false
    }

    for (const level of Object.values(game.upgrades)) {
      if (level > 0) {
        return true
      }
    }

    return false
  }

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    // XXX: Skip screen if no game to overwrite
    if (!app.storage.hasGame()) {
      window.requestAnimationFrame(() => {
        app.state.screen.dispatch('new')
      })

      return
    }

    root.querySelector('.a-newGame--action-plus').hidden = !hasNewGamePlus()

    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  return {}
})()
