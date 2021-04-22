content.upgrades = (() => {
  const pubsub = engine.utility.pubsub.create(),
    registry = new Map()

  function toSlug(value) {
    return value.toLowerCase().replace(/\W/g, '-')
  }

  return engine.utility.pubsub.decorate({
    all: () => Array.from(registry.values()),
    export: () => {
      const data = {}

      for (const upgrade of registry.values()) {
        data[upgrade.key] = upgrade.level
      }

      return data
    },
    get: (key) => registry.get(key),
    getApplied: () => Array.from(registry.values()).filter((upgrade) => upgrade.level),
    getAvailable: () => Array.from(registry.values()).filter((upgrade) => upgrade.canUpgrade()),
    import: function (data = {}) {
      for (const upgrade of registry.values()) {
        upgrade.level = data[upgrade.key] || 0
      }

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
    reset: function () {
      for (const upgrade of registry.values()) {
        upgrade.level = 0
      }

      return this
    },
  }, pubsub)
})()

engine.state.on('export', (data = {}) => data.upgrades = content.upgrades.export())
engine.state.on('import', ({upgrades}) => content.upgrades.import(upgrades))
engine.state.on('reset', () => content.upgrades.reset())
