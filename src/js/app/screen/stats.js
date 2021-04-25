app.screen.stats = (() => {
  let root

  engine.ready(() => {
    root = document.querySelector('.a-stats')

    app.state.screen.on('enter-stats', onEnter)
    app.state.screen.on('exit-stats', onExit)

    root.querySelector('.a-stats--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)
    app.utility.input.preventScrolling(root.querySelector('.a-stats--data'))
  })

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
    updateStats()
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function updateStats() {
    const materialsCollected = app.stats.materials.collectedCount(),
      materialsConsumed = app.stats.materials.consumedCount(),
      maxAltitude = app.stats.maxAltitude.get(),
      maxDistance = app.stats.maxDistance.get(),
      totalDistance = app.stats.totalDistance.get(),
      totalTime = app.stats.totalTime.get(),
      upgrades = app.stats.upgrades.count()

    root.querySelector('.a-stats--metric-maxAltitude').innerHTML = app.utility.format.number(maxAltitude)
    root.querySelector('.a-stats--metric-maxDistance').innerHTML = app.utility.format.number(maxDistance)
    root.querySelector('.a-stats--metric-totalDistance').innerHTML = app.utility.format.number(totalDistance)
    root.querySelector('.a-stats--metric-materialsCollected').innerHTML = app.utility.format.number(materialsCollected)
    root.querySelector('.a-stats--metric-materialsConsumed').innerHTML = app.utility.format.number(materialsConsumed)
    root.querySelector('.a-stats--metric-totalTime').innerHTML = app.utility.format.time(totalTime)
    root.querySelector('.a-stats--metric-upgrades').innerHTML = app.utility.format.number(upgrades)
  }

  return {}
})()
