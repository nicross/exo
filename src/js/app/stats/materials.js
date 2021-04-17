app.stats.materials = (() => {
  let count = 0,
    types = {}

  return app.stats.invent('materials', {
    get: () => ({
      count,
      type: {...types},
    }),
    onCollect: function (prop) {
      const key = prop.type.key

      count += 1

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
    total: () => count,
  })
})()

content.materials.on('collect', (...args) => app.stats.materials.onCollect(...args))
