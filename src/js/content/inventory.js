content.inventory = (() => {
  let cargo = {}

  function calculateCapacity() {
    // TODO: upgrades
    return 5
  }

  return {
    capacity: () => calculateCapacity(),
    canCollect: (key) => !cargo[key] || cargo[key] < calculateCapacity(),
    export: () => ({...cargo}),
    get: (key) => cargo[key] || 0,
    import: function (data) {
      cargo = {...data}
      return this
    },
    onCollect: function (prop) {
      const key = prop.type.key

      if (cargo[key]) {
        cargo[key] += 1
      } else {
        cargo[key] = 1
      }

      return this
    },
    reset: function () {
      cargo = {}
      return this
    },
  }
})()

engine.ready(() => {
  content.materials.on('collect', (...args) => content.inventory.onCollect(...args))
})

engine.state.on('export', (data) => data.inventory = content.inventory.export())
engine.state.on('import', ({inventory}) => content.inventory.import(inventory))
engine.state.on('reset', () => content.inventory.reset())
