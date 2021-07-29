content.time = (() => {
  const yearDuration = 22 * 60

  let relative = 0,
    time = 0

  function getRelativity() {
    // Sinusoidal scaling of z from [0, maxAltitude] to [1, 0]
    const maxAltitude = 10000 // double toposphere
    const {z} = engine.position.getVector()
    const linear = engine.utility.clamp(z / maxAltitude, 0, 1)
    return Math.cos(Math.PI/2 * (linear ** 0.5))
  }

  return {
    export: () => ({
      relative,
      time,
    }),
    import: function (data = {}) {
      relative = data.relative || data.time || 0
      time = data.time || 0
      return this
    },
    increment: function (value) {
      relative += value * getRelativity()
      time += value
      return this
    },
    relative: () => relative,
    relativity: getRelativity,
    year: () => (time / yearDuration) % 1,
    value: () => time,
  }
})()

engine.loop.on('frame', ({delta, paused}) => {
  if (paused) {
    return
  }

  content.time.increment(delta)
})

engine.state.on('import', ({time}) => content.time.import(time))
engine.state.on('export', (data) => data.time = content.time.export())
