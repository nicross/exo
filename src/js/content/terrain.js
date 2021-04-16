content.terrain = (() => {
  const biomeXField = engine.utility.perlin2d.create('terrain', 'biomeX'),
    biomeYField = engine.utility.perlin2d.create('terrain', 'biomeY'),
    biomeScale = 10000,
    noiseField = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, 'terrain', 2),
    sauceField = engine.utility.perlin2d.create('terrain', 'sauce')

  const amplitudeField = engine.utility.perlin2d.create('terrain', 'amplitude')

  const biomes = [
    {x: 1/5, y: 1/3, name: 'flat', command: flat}, {x: 1/5, y: 2/3, name: 'waves', command: waves},
    {x: 2/5, y: 1/3, name: 'plains', command: plains}, {x: 2/5, y: 2/3, name: 'rolling', command: rolling},
    {x: 3/5, y: 1/3, name: 'rough', command: rough}, {x: 3/5, y: 2/3, name: 'polar', command: polar},
    {x: 4/5, y: 1/3, name: 'mountains', command: mountains}, {x: 4/5, y: 2/3, name: 'plateau', command: plateau},
  ]

  const biomeCache = engine.utility.quadtree.create(),
    cache = engine.utility.quadtree.create()

  let current

  content.utility.ephemeralNoise
    .manage(biomeXField)
    .manage(biomeYField)
    .manage(noiseField)
    .manage(sauceField)

  function cacheCurrent() {
    const position = engine.position.getVector()
    current = getValue(position.x, position.y)
  }

  function flat({x, y}) {
    return noiseField.value(x / 100, y / 100) * 2
  }

  function getWeightedBiomes(x, y) {
    x = biomeXField.value(x, y)
    y = biomeYField.value(x, y)

    const results = []

    for (const biome of biomes) {
      results.push({
        command: biome.command,
        distance: engine.utility.distance2({x, y}, {x: biome.x, y: biome.y}),
        name: biome.name,
      })
    }

    results.sort((a, b) => {
      return b.distance - a.distance
    })

    let totalDistance = results.reduce((sum, result) => {
      return sum + result.distance
    }, 0)

    for (const result of results) {
      result.weight = (1 - (result.distance / totalDistance)) ** 32
    }

    let totalWeight = results.reduce((sum, result) => {
      return sum + result.weight
    }, 0)

    for (const result of results) {
      result.weight /= totalWeight
    }

    results.debug = {
      totalDistance: totalDistance,
      totalWeight: totalWeight,
      x: x,
      y: y,
    }

    return results
  }

  function generateBiome(x, y) {
    x /= biomeScale
    y /= biomeScale
    x += 0.5
    y += 0.5

    const weighted = getWeightedBiomes(x, y)

    return (...args) => {
      let value = 0

      for (const biome of weighted) {
        value += biome.weight * biome.command(...args)
      }

      return value
    }
  }

  function generateValue(x, y) {
    const biome = getBiome(x, y)

    const options = {
      x,
      y,
    }

    return biome(options) + sauce(options)
  }

  function getBiome(x, y) {
    x = Math.round(x)
    y = Math.round(y)

    let result = biomeCache.find({x, y}, engine.const.zero)

    if (result && result.value) {
      return result.value
    }

    result = {
      value: generateBiome(x, y),
      x,
      y,
    }

    biomeCache.insert(result)

    return result.value
  }

  function getValue(x, y) {
    const shouldCache = x % 1 == 0 && y % 1 == 0

    let result = shouldCache
      ? cache.find({x, y}, engine.const.zero)
      : undefined

    if (result && result.value) {
      return result.value
    }

    result = {
      value: generateValue(x, y),
      x,
      y,
    }

    if (shouldCache) {
      cache.insert(result)
    }

    return result.value
  }

  function mountains({x, y}) {
    // TODO: Adjust amplitude and exponent by noise fields
    return (noiseField.value(x / 1000, y / 1000) ** (1/3)) * 2000
  }

  function polar({x, y}) {
    // TODO: Adjust amplitude and exponent by noise fields

    // TODO: repeat in a grid somehow,basically to create pockets of radial symmetry that fade out from their center
    /*
    const xi = Math.floor(x / 1000) * 1000,
      yi = Math.floor(y / 1000) * 1000

    const blend = engine.utility.distance({x, y}, {x: xi, y: xi})
    */

    return (noiseField.value(engine.utility.distance({x, y}) / 100, Math.abs(x + y) / 100) ** 8) * 1000
  }

  function plains({x, y}) {
    // TODO: Adjust amplitude by noise field
    return noiseField.value(x / 100, y / 100) * 5
  }

  function plateau({x, y}) {
    // TODO: Adjust stairHeight, amplitude, and exponent by noise fields
    const amplitude = 500,
      stairHeight = 2,
      value = (noiseField.value(x / 1000, y / 1000) ** 0.5) * amplitude

    const v0 = Math.floor(value / stairHeight) * stairHeight,
      delta = smooth((value - v0) / stairHeight) * stairHeight

    return v0 + delta
  }

  function rolling({x, y}) {
    // TODO: Adjust amplitude by noise field
    return noiseField.value(x / 50, y / 50) * 10
  }

  function rough({x, y}) {
    // TODO: Adjust amplitude and exponent by noise fields
    return (noiseField.value(x / 50, y / 50) ** 10) * 500
  }

  function sauce({x, y}) {
    return sauceField.value(x / 2, y / 2) / 32
  }

  function smooth(value) {
    // generalized logistic function
    return 1 / (1 + (Math.E ** (-20 * (value - 0.5))))
  }

  function waves({x, y}) {
    // TODO: Adjust scale and exponent by noise fields
    return (engine.utility.scale(Math.sin(x * Math.PI / engine.utility.lerp(25, 75, Math.abs(Math.sin(y * Math.PI / 1000)))), -1, 1, 0, 1) ** 2) * 10
  }

  return {
    current: function () {
      if (current === undefined) {
        cacheCurrent()
      }

      return current
    },
    debug: (position = engine.position.getVector()) => ({
      biomeCache,
      biomes: getWeightedBiomes(position.x, position.y),
      cache,
      value: getValue(position.x, position.y),
    }),
    import: function () {
      cacheCurrent()
      return this
    },
    reset: function () {
      biomeCache.clear()
      cache.clear()
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

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.terrain.update()
})

engine.state.on('import', () => content.terrain.import())
engine.state.on('reset', () => content.terrain.reset())
