app.stats.materials = (() => {
  let collectedCount = 0,
    collectedTypes = {},
    consumedCount = 0,
    consumedTypes = {},
    recycledCount = 0,
    recycledTypes = {}

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
      recycled: {
        count: recycledCount,
        type: {...recycledTypes},
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
    onRecycle: function (prop) {
      const key = prop.type.key

      recycledCount += 1

      if (recycledTypes[key]) {
        recycledTypes[key] += 1
      } else {
        recycledTypes[key] = 1
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
    recycledCount: () => recycledCount,
    recycledTypes: () => ({...recycledTypes}),
    set: function ({
      collected = {},
      consumed = {},
      recycled = {},
    } = {}) {
      collectedCount = collected.count || 0
      collectedTypes = collected.type ? {...collected.type} : {}
      consumedCount = consumed.count || 0
      consumedTypes = consumed.type ? {...consumed.type} : {}
      recycledCount = recycled.count || 0
      recycledTypes = recycled.type ? {...recycled.type} : {}
      return this
    },
  })
})()

content.materials.on('collect', (...args) => app.stats.materials.onCollect(...args))
content.materials.on('recycle', (...args) => app.stats.materials.onRecycle(...args))
content.upgrades.on('upgrade', (...args) => app.stats.materials.onUpgrade(...args))
