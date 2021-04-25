app.stats.upgrades = (() => {
  let count = 0,
    types = {}

  return app.stats.invent('upgrades', {
    count: () => count,
    get: () => ({
      count: count,
      type: {...types},
    }),
    onUpgrade: function (upgrade) {
      const key = upgrade.key

      count +=1

      if (types[key]) {
        types[key] += 1
      } else {
        types[key] = 1
      }

      return this
    },
    set: function (data = {}) {
      count = data.count || 0
      types = data.type ? {...data.type} : {}
      return this
    },
    types: () => ({...types}),
  })
})()

content.upgrades.on('upgrade', (...args) => app.stats.upgrades.onUpgrade(...args))
