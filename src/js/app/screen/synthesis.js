app.screen.synthesis = (() => {
  const components = []

  let root,
    upgradesList

  engine.ready(() => {
    root = document.querySelector('.a-synthesis')
    upgradesList = root.querySelector('.a-synthesis--upgrades')

    app.state.screen.on('enter-synthesis', onEnter)
    app.state.screen.on('exit-synthesis', onExit)

    root.querySelector('.a-synthesis--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)
    app.utility.input.preventScrolling(upgradesList)
  })

  function getUpgrades() {
    const upgrades = [
      ...content.upgrades.getAvailable(),
      ...content.upgrades.getApplied(),
      ...content.upgrades.getPending(),
    ].sort((a, b) => {
      if (a.canUpgrade() != b.canUpgrade()) {
        return a.canUpgrade() ? -1 : 1
      }

      return a.name.localeCompare(b.name)
    })

    return Array.from(new Set(upgrades))
  }

  function handleControls() {
    const ui = app.controls.ui()

    if (ui.backspace || ui.cancel || ui.escape) {
      return onBackClick()
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

  function onBackClick() {
    app.state.screen.dispatch('back')
  }

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    updateComponents()
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function onUpgradeClick() {
    // XXX: this is current component
    app.state.screen.dispatch('upgrade', this.upgrade)
  }

  function updateComponents() {
    const upgrades = getUpgrades()

    for (const component of components) {
      component.destroy()
    }

    components.length = 0

    for (const upgrade of upgrades) {
      const component = app.component.upgrade.create(upgrade)
        .attach(upgradesList)

      component.on('click', onUpgradeClick.bind(component))
      components.push(component)
    }
  }

  return {}
})()
