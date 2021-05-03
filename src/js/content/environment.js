content.environment = (() => {
  const mass = 8.3226 * (10 ** 22),
    radius = 1666 * 1000,
    troposphere = 10 * 1000

  let atmosphere = 0,
    gravity = 0

  function recalculate() {
    const {z} = engine.position.getVector()

    atmosphere = 1 - (engine.utility.clamp(z / troposphere, 0, 1) ** 0.75)
    gravity = content.const.g * mass / ((radius + z) ** 2)
  }

  return {
    atmosphere: () => atmosphere,
    gravity: () => gravity,
    import: function () {
      recalculate()
      return this
    },
    reset: function () {
      atmosphere = 0
      gravity = 0
      return this
    },
    update: function () {
      recalculate()
      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.environment.update()
})

engine.state.on('import', () => content.environment.import())
engine.state.on('reset', () => content.environment.reset())
