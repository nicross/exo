app.stats.idleTime = (() => {
  let time = 0

  return app.stats.invent('idleTime', {
    get: () => time,
    increment: function (value) {
      time += value
      return this
    },
    set: function (value) {
      time = Number(value) || 0
      return this
    },
  })
})()

engine.loop.on('frame', ({delta, paused}) => {
  if (paused || !app.state.game.is('running') || !content.idle.is()) {
    return
  }

  app.stats.idleTime.increment(delta)
})
