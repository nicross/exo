content.upgrades = (() => {
  const available = new Set(),
    pubsub = engine.utility.pubsub.create(),
    registry = new Map()

  function calculateAvailable() {
    return Array.from(registry.values()).filter((upgrade) => upgrade.canUpgrade())
  }

  function resetAvailable() {
    const upgrades = calculateAvailable()

    available.clear()

    for (const upgrade of upgrades) {
      available.add(upgrade)
    }
  }

  function toSlug(value) {
    return value.toLowerCase().replace(/\W/g, '-')
  }

  return engine.utility.pubsub.decorate({
    all: () => Array.from(registry.values()),
    downgrade: function (key) {
      const upgrade = registry.get(key)

      if (upgrade && upgrade.canDowngrade()) {
        upgrade.level -= 1
        pubsub.emit('downgrade', upgrade)
        resetAvailable()
      }

      return this
    },
    debug: () => {
      const costs = Array.from(registry.values()).reduce((costs, upgrade) => {
        for (const level of upgrade.levels) {
          for (const [key, value] of Object.entries(level.cost)) {
            if (!costs[key]) {
              costs[key] = 0
            }

            costs[key] += value
          }
        }

        return costs
      }, {})

      const costsByType = Array.from(registry.values()).reduce((costs, upgrade) => {
        for (const level of upgrade.levels) {
          for (let [key, value] of Object.entries(level.cost)) {
            key = key.split('/')[0]

            if (!costs[key]) {
              costs[key] = 0
            }

            costs[key] += value
          }
        }

        return costs
      }, {})

      const totalCost = Array.from(registry.values()).reduce((total, upgrade) => {
        for (const level of upgrade.levels) {
          for (const [key, value] of Object.entries(level.cost)) {
            total += value
          }
        }

        return total
      }, 0)

      const weights = Array.from(Object.entries(costs)).reduce((weights, [key, value]) => {
        weights[key] = value / totalCost
        return weights
      }, {})

      const weightsByType = Array.from(Object.entries(costsByType)).reduce((weights, [key, value]) => {
        weights[key] = value / totalCost
        return weights
      }, {})

      return {
        costs,
        costsByType,
        totalCost,
        weights,
        weightsByType,
      }
    },
    export: () => {
      const data = {}

      for (const upgrade of registry.values()) {
        data[upgrade.key] = upgrade.level
      }

      return data
    },
    get: (key) => registry.get(key),
    getApplied: () => Array.from(registry.values()).filter((upgrade) => upgrade.level),
    getAvailable: () => Array.from(available),
    getPending: () => Array.from(registry.values()).filter((upgrade) => {
      for (const key of Object.keys(upgrade.getNextCost())) {
        if (content.inventory.get(key)) {
          return true
        }
      }

      return false
    }),
    giveAll: function () {
      for (const upgrade of registry.values()) {
        upgrade.level = upgrade.levels.length - 1
      }

      content.movement.recalculate()
      resetAvailable()

      return this
    },
    import: function (data = {}) {
      for (const upgrade of registry.values()) {
        upgrade.level = data[upgrade.key] || 0
      }

      // XXX: setTimeout solves race condition with inventory system
      setTimeout(resetAvailable, 0)

      return this
    },
    invent: (definition = {}) => {
      const upgrade = Object.setPrototypeOf({...definition}, content.upgrades.base)

      upgrade.key = toSlug(upgrade.name)
      upgrade.levels.unshift({
        bonus: 0,
        cost: {},
      })

      registry.set(upgrade.key, upgrade)

      return upgrade
    },
    onCollect: function () {
      const upgrades = calculateAvailable()

      for (const upgrade of upgrades) {
        if (!available.has(upgrade)) {
          pubsub.emit('available', upgrade)
          available.add(upgrade)
        }
      }

      return this
    },
    reset: function () {
      for (const upgrade of registry.values()) {
        upgrade.level = 0
      }

      available.clear()

      return this
    },
    upgrade: function (key) {
      const upgrade = registry.get(key)

      if (upgrade && upgrade.canUpgrade()) {
        upgrade.level += 1
        pubsub.emit('upgrade', upgrade)
        resetAvailable()
      }

      return this
    },
  }, pubsub)
})()

engine.ready(() => {
  content.materials.on('collect', () => content.upgrades.onCollect())
})

engine.state.on('export', (data = {}) => data.upgrades = content.upgrades.export())
engine.state.on('import', ({upgrades}) => content.upgrades.import(upgrades))
engine.state.on('reset', () => content.upgrades.reset())
