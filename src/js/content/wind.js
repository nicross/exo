content.wind = (() => {
  const amplitude = 1,
    field = engine.utility.createPerlinWithOctaves(engine.utility.perlin1d, 'wind', 4),
    timeScale = 1/2

  content.utility.ephemeralNoise.manage(field)

  return {
    reset: function () {
      return this
    },
    value: function () {
      const x = content.time.value() / timeScale
      return field.value(x) * amplitude
    },
  }
})()

engine.state.on('reset', () => content.wind.reset())
