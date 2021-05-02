app.screen.status = (() => {
  let root

  engine.ready(() => {
    root = document.querySelector('.a-status')

    app.state.screen.on('enter-status', onEnter)
    app.state.screen.on('exit-status', onExit)

    root.querySelector('.a-status--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)
    app.utility.input.preventScrolling(root.querySelector('.a-status--data'))
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
    updateStatus()
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function updateStatus() {
    const {x, y, z} = engine.position.getVector()

    const coordinates = {x, y},
      terrain = content.terrain.current(),
      time = content.time.value(),
      velocity = engine.position.getVelocity(),
      yaw = engine.position.getEuler().yaw

    root.querySelector('.a-status--metric-altitude').innerHTML = app.utility.format.number(z)
    root.querySelector('.a-status--metric-coordinates').innerHTML = app.utility.format.coordinates(coordinates)
    root.querySelector('.a-status--metric-heading').innerHTML = app.utility.format.angle(yaw)
    root.querySelector('.a-status--metric-height').innerHTML = app.utility.format.number(Math.max(z - terrain, 0))
    root.querySelector('.a-status--metric-time').innerHTML = app.utility.format.time(time)
    root.querySelector('.a-status--metric-velocity').innerHTML = app.utility.format.velocity(velocity)
  }

  return {}
})()
