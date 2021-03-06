app.state.game = engine.utility.machine.create({
  state: 'initial',
  transition: {
    initial: {
      activate: function () {
        this.change('none')
      },
    },
    none: {
      load: function () {
        this.change('running')
      },
      new: function () {
        this.change('running')
      },
      plus: function () {
        this.change('running')
      },
    },
    paused: {
      exit: function () {
        this.change('none')
      },
      resume: function () {
        this.change('running')
      },
    },
    running: {
      pause: function () {
        this.change('paused')
      },
    },
  },
})

engine.ready(() => {
  // Initial mix
  engine.audio.mixer.master.param.gain.value = engine.const.zeroGain

  // Game state changes
  app.state.screen.on('before-game-pause', () => app.state.game.dispatch('pause'))
  app.state.screen.on('before-gameMenu-mainMenu', () => app.state.game.dispatch('exit'))
  app.state.screen.on('before-gameMenu-resume', () => app.state.game.dispatch('resume'))
  app.state.screen.on('before-mainMenu-continue', () => app.state.game.dispatch('load'))
  app.state.screen.on('before-newGame-new', () => app.state.game.dispatch('new'))
  app.state.screen.on('before-newGame-plus', () => app.state.game.dispatch('plus'))

  app.state.game.dispatch('activate')
})

app.state.game.on('before-none-load', () => {
  engine.state.import(
    app.storage.getGame()
  )
})

app.state.game.on('before-none-new', () => {
  app.storage.clearGame()

  engine.state.import({
    position: {
      quaternion: engine.utility.quaternion.identity(),
      x: 0,
      y: 0,
      z: 0,
    },
    seed: Math.random(),
  })

  // Start on terrain
  engine.position.setVector({
    ...engine.position.getVector(),
    z: content.terrain.current(),
  })

  app.autosave.trigger()
})

app.state.game.on('before-none-plus', () => {
  const previous = app.storage.getGame()

  app.storage.clearGame()

  engine.state.import({
    position: {
      quaternion: engine.utility.quaternion.identity(),
      x: 0,
      y: 0,
      z: 0,
    },
    seed: Math.random(),
    upgrades: previous.upgrades,
  })

  // Start on terrain
  engine.position.setVector({
    ...engine.position.getVector(),
    z: content.terrain.current(),
  })

  app.autosave.trigger()
})

app.state.game.on('enter-paused', () => {
  const gain = engine.const.zeroGain
  engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, gain, 0.5)

  app.autosave.disable().trigger()
  engine.loop.pause()
})

app.state.game.on('enter-running', () => {
  const gain = app.settings.computed.mainVolume
  engine.audio.ramp.linear(engine.audio.mixer.master.param.gain, gain, 0.5)

  app.autosave.enable()
  engine.loop.resume()
})
