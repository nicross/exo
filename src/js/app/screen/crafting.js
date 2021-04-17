app.screen.crafting = (() => {
  let root

  engine.ready(() => {
    root = document.querySelector('.a-crafting')

    app.state.screen.on('enter-crafting', onEnter)
    app.state.screen.on('exit-crafting', onExit)

    Object.entries({
      back: root.querySelector('.a-crafting--back'),
      inventory: root.querySelector('.a-crafting--inventory'),
      upgrades: root.querySelector('.a-crafting--upgrades'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.state.screen.dispatch(event))
    })

    app.utility.focus.trap(root)
  })

  function handleControls() {
    const ui = app.controls.ui()

    if (ui.backspace || ui.cancel || ui.escape) {
      return app.state.screen.dispatch('back')
    }

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

  function hasInventory() {
    return content.inventory.total() > 0
  }

  function hasUpgrades() {
    // TODO
    return false
  }

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    root.querySelector('.a-crafting--action-inventory').hidden = !hasInventory()
    root.querySelector('.a-crafting--action-upgrades').hidden = !hasUpgrades()

    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  return {
    hasOptions: () => hasInventory() || hasUpgrades(),
  }
})()