app.screen.audio = (() => {
  const sliders = []

  let root

  engine.ready(() => {
    root = document.querySelector('.a-audio')

    app.state.screen.on('enter-audio', onEnter)
    app.state.screen.on('exit-audio', onExit)

    root.querySelector('.a-audio--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)

    hydrateSliders()
    hydrateToggles()
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

    if (ui.left) {
      for (const slider of sliders) {
        if (app.utility.focus.isWithin(slider.rootElement)) {
          return slider.decrement()
        }
      }
    }

    if (ui.right) {
      for (const slider of sliders) {
        if (app.utility.focus.isWithin(slider.rootElement)) {
          return slider.increment()
        }
      }
    }
  }

  function hydrateSliders() {
    [
      ['.a-audio--mainVolume', app.settings.raw.mainVolume, app.settings.setMainVolume],
      ['.a-audio--musicVolume', app.settings.raw.musicVolume, app.settings.setMusicVolume],
      ['.a-audio--streamerLimit', app.settings.raw.streamerLimit, app.settings.setStreamerLimit],
      ['.a-audio--streamerRadius', app.settings.raw.streamerRadius, app.settings.setStreamerRadius],
    ].forEach(([selector, initialValue, setter]) => {
      const component = app.component.slider.hydrate(root.querySelector(selector), initialValue)
      component.on('change', () => setter(component.getValueAsFloat()))
      sliders.push(component)
    })
  }

  function hydrateToggles() {
    [
      ['.a-audio--reverbOn', app.settings.raw.reverbOn, app.settings.setReverbOn],
    ].forEach(([selector, initialValue, setter]) => {
      const component = app.component.toggle.hydrate(root.querySelector(selector), initialValue)
      component.on('change', () => setter(component.getValue()))
    })
  }

  function onBackClick() {
    app.state.screen.dispatch('back')
  }

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
    app.settings.save()
  }

  return {}
})()
