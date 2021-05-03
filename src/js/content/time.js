content.time = (() => {
  const yearDuration = 30 * 60

  let time = 0

  return {
    export: () => ({
      time,
    }),
    import: function (data = {}) {
      time = data.time || 0
      return this
    },
    increment: function (value) {
      time += value
      return this
    },
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
