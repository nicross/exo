content.environment = (() => {
  const mass = 8.3226 * (10 ** 22),
    radius = 1666 * 1000,
    troposphere = 5 * 1000

  const maxGravity = getGravity(0)
  const maxGravitationalVelocity = maxGravity * Math.sqrt(2 * troposphere / maxGravity)

  let atmosphere = 0,
    gravity = 0

  function getAtmosphere(z = 0) {
    const value = 1 - engine.utility.clamp(z / troposphere, 0, 1)
    return smooth(value)
  }

  function getGravity(z = 0) {
    return content.const.g * mass / ((radius + z) ** 2)
  }

  function recalculate() {
    const {z} = engine.position.getVector()

    atmosphere = getAtmosphere(z)
    gravity = getGravity(z)
  }

  function smooth(value) {
    // generalized logistic function
    const smoothed = 1 / (1 + (Math.E ** (-5 * (value - 0.5))))

    if (value > 7/8) {
      const scalar = engine.utility.scale(value, 7/8, 1, 0, 1)
      return engine.utility.lerp(smoothed, 1, scalar)
    }

    if (value < 1/8) {
      const scalar = engine.utility.scale(value, 0, 1/8, 0, 1)
      return engine.utility.lerp(0, smoothed, scalar)
    }

    return smoothed
  }

  return {
    atmosphere: () => atmosphere,
    getAtmosphere,
    getGravity,
    gravity: () => gravity,
    import: function () {
      recalculate()
      return this
    },
    maxGravity: () => maxGravity,
    maxGravitationalVelocity: () => maxGravitationalVelocity,
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
