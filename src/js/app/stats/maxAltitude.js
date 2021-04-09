app.stats.maxAltitude = (() => {
  let max = 0

  return app.stats.invent('maxAltitude', {
    get: () => max,
    set: function (value) {
      max = Number(value) || 0
      return this
    },
    update: function () {
      const altitude = engine.position.getVector().z

      if (altitude > max) {
        max = altitude
      }

      return this
    },
  })
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  app.stats.maxAltitude.update()
})
