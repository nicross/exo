content.terrain = (() => {
  let current

  function cacheCurrent() {
    const position = engine.position.getVector()
    current = getValue(position.x, position.y)
  }

  function getValue(x, y) {
    return Math.cos(y / 10) * 4
  }

  return {
    current: function () {
      if (current === undefined) {
        cacheCurrent()
      }

      return current
    },
    import: function () {
      cacheCurrent()
      return this
    },
    reset: function () {
      current = undefined
      return this
    },
    update: function () {
      cacheCurrent()
      return this
    },
    value: function (x, y) {
      return getValue(x, y)
    },
  }
})()

engine.loop.on('frame', () => content.terrain.update())
engine.state.on('import', () => content.terrain.import())
engine.state.on('reset', () => content.terrain.reset())
