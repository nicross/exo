app.stats.materials = (() => {
  let collectedCount = 0,
    collectedTypes = {},
    consumedCount = 0,
    consumedTypes = {}

  return app.stats.invent('materials', {
    collectedCount: () => collectedCount,
    collectedTypes: () => ({...collectedTypes}),
    consumedCount: () => consumedCount,
    consumedTypes: () => ({...consumedTypes}),
    get: () => ({
      collected: {
        count: collectedCount,
        type: {...collectedTypes},
      },
      consumed: {
        count: consumedCount,
        type: {...consumedTypes},
      },
    }),
    onCollect: function (prop) {
      const key = prop.type.key

      collectedCount += 1

      if (collectedTypes[key]) {
        collectedTypes[key] += 1
      } else {
        collectedTypes[key] = 1
      }

      return this
    },
    onUpgrade: function (upgrade) {
      const hash = upgrade.getCost()

      for (const [key, count] of Object.entries(hash)) {
        consumedCount += count

        if (consumedTypes[key]) {
          consumedTypes[key] += count
        } else {
          consumedTypes[key] = count
        }
      }

      return this
    },
    set: function ({
      collected = {},
      consumed = {},
    } = {}) {
      collectedCount = collected.count || 0
      collectedTypes = collected.type ? {...collected.type} : {}
      consumedCount = consumed.count || 0
      consumedTypes = consumed.type ? {...consumed.type} : {}
      return this
    },
  })
})()

content.materials.on('collect', (...args) => app.stats.materials.onCollect(...args))
content.upgrades.on('upgrade', (...args) => app.stats.materials.onUpgrade(...args))
