content.time = (() => {
  const yearDuration = 30 * 60

  let relative = 0,
    time = 0

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
      relative += value * this.relativeSpeed()
      time += value
      return this
    },
    relative: () => relative,
    relativeSpeed: () => content.environment.atmosphere(),
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
