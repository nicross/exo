app.stats.materials = (() => {
  let collectedCount = 0,
    collectedTypes = {}

  return app.stats.invent('materials', {
    collectedCount: () => collectedCount,
    collectedTypes: () => ({...collectedTypes}),
    get: () => ({
      collected: {
        collectedCount,
        type: {...collectedTypes},
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
    set: function ({
      collected = {},
    } = {}) {
      collectedCount = collected.count || 0
      collectedTypes = collected.type ? {...collected.type} : {}
      return this
    },
  })
})()

content.materials.on('collect', (...args) => app.stats.materials.onCollect(...args))
