content.audio.music.amod = (() => {
  const depthField = engine.utility.perlin2d.create('music', 'amod', 'depth'),
    depthScale = 120,
    frequencyField = engine.utility.perlin2d.create('music', 'amod', 'frequency'),
    frequencyScale = 90

  content.utility.ephemeralNoise
    .manage(depthField)
    .manage(frequencyField)

  return {
    depth: function (index) {
      const scale = content.time.relativity(),
        time = content.time.relative() / depthScale,
        value = depthField.value(time, index + 0.5)

      return engine.utility.lerp(0, 0.5, value) * scale
    },
    frequency: function (index) {
      const scale = content.time.relativity(),
        time = content.time.relative() / frequencyScale,
        value = frequencyField.value(time, index + 0.5)

      return engine.utility.lerp(1/4, 4, value) * scale
    },
  }
})()
