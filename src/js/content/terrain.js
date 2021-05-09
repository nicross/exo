content.terrain = (() => {
  const amplitudeField = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, ['terrain', 'amplitude'], 2),
    amplitudeScale = 1000,
    biomeXField = engine.utility.perlin2d.create('terrain', 'biomeX'),
    biomeYField = engine.utility.perlin2d.create('terrain', 'biomeY'),
    biomeScale = 5000,
    exponentField = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, ['terrain', 'exponent'], 2),
    exponentScale = 1000,
    noiseField = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, 'terrain', 4),
    sauceField = engine.utility.perlin2d.create('terrain', 'sauce'),
    wildcardField = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, ['terrain', 'wildcard'], 2),
    wildcardScale = 1000

  const biomes = [
    {x: 0, y: 0.5, name: 'low', command: low},
    {x: 1/5, y: 1/3, name: 'flat', command: flat}, {x: 1/5, y: 2/3, name: 'waves', command: waves},
    {x: 2/5, y: 1/3, name: 'plains', command: plains}, {x: 2/5, y: 2/3, name: 'rolling', command: rolling},
    {x: 3/5, y: 1/3, name: 'plateau', command: plateau}, {x: 3/5, y: 2/3, name: 'mountains', command: mountains},
    {x: 4/5, y: 1/3, name: 'hoodoos', command: hoodoos}, {x: 4/5, y: 2/3, name: 'rough', command: rough},
    {x: 1, y: 0.5, name: 'high', command: high},
  ]

  const cache = engine.utility.quadtree.create({
    maxItems: 100,
  })

  let current

  content.utility.ephemeralNoise
    .manage(amplitudeField)
    .manage(biomeXField)
    .manage(biomeYField)
    .manage(exponentField)
    .manage(noiseField)
    .manage(sauceField)
    .manage(wildcardField)

  function cacheCurrent() {
    const position = engine.position.getVector()
    current = getValue(position.x, position.y)
  }

  function flat({amplitude, x, y}) {
    const noise = noiseField.value(x / 100, y / 100)
    amplitude = engine.utility.lerp(0, 2, amplitude)
    return amplitude * noise
  }

  function generateBiome(x, y) {
    x /= biomeScale
    y /= biomeScale
    x += 0.5
    y += 0.5

    const weighted = getWeightedBiomes(x, y)

    return (options) => {
      let value = 0

      for (const biome of weighted) {
        value += biome.weight * biome.command({
          ...options,
          weight: biome.weight,
        })
      }

      return value
    }
  }

  function generateValue(x, y) {
    const amplitude = getAmplitude(x, y),
      biome = getBiome(x, y),
      exponent = getExponent(x, y),
      wildcard = getWildcard(x, y)

    const options = {
      amplitude,
      exponent,
      wildcard,
      x,
      y,
    }

    return biome(options) + sauce(options)
  }

  function getAmplitude(x, y) {
    return exponentField.value(x / amplitudeScale, y / amplitudeScale)
  }

  function getBiome(x, y) {
    // XXX: originally caching here, but it causes seams
    return generateBiome(x, y)
  }

  function getExponent(x, y) {
    return exponentField.value(x / exponentScale, y / exponentScale)
  }

  function getValue(x, y) {
    const shouldCache = x % 1 == 0 && y % 1 == 0

    let result = shouldCache
      ? cache.find({x, y}, engine.const.zero)
      : undefined

    if (result && 'value' in result) {
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

  function getWildcard(x, y) {
    return wildcardField.value(x / wildcardScale, y / wildcardScale)
  }

  function high() {
    return 2500
  }

  function hoodoos({amplitude, exponent, weight, x, y, wildcard}) {
    const noise = noiseField.value((x / 25) + 0.5, (y / 25) + 0.5),
      stairHeight = engine.utility.lerpExp(2, 10, wildcard, 2) / weight

    amplitude = engine.utility.lerp(250, 500, amplitude)
    exponent = engine.utility.lerp(4, 8, exponent)

    const value = amplitude * (noise ** exponent)

    const v0 = Math.floor(value / stairHeight) * stairHeight,
      delta = smooth((value - v0) / stairHeight) * stairHeight

    return v0 + delta
  }

  function low() {
    return 0
  }

  function mountains({amplitude, exponent, x, y}) {
    const noise = noiseField.value(x / 1000, y / 1000)
    amplitude = engine.utility.lerp(500, 2000, amplitude)
    exponent = engine.utility.lerpExp(1/2, 2, exponent, 2)
    return amplitude * (noise ** exponent)
  }

  function plains({amplitude, x, y}) {
    const noise = noiseField.value(x / 75, y / 75)
    amplitude = engine.utility.lerp(5, 10, amplitude)
    return amplitude * noise
  }

  function plateau({amplitude, exponent, weight, x, y, wildcard}) {
    const noise = noiseField.value(x / 1000, y / 1000),
      stairHeight = engine.utility.lerpExp(2, 10, wildcard, 2) / weight

    amplitude = engine.utility.lerp(250, 750, amplitude)
    exponent = engine.utility.lerp(1/4, 1, exponent)

    const value = amplitude * (noise ** exponent)

    const v0 = Math.floor(value / stairHeight) * stairHeight,
      delta = smooth((value - v0) / stairHeight) * stairHeight

    return v0 + delta
  }

  function rolling({amplitude, exponent, x, y}) {
    const noise = noiseField.value(x / 100, y / 100)
    amplitude = engine.utility.lerp(12.5, 50, amplitude)
    exponent = engine.utility.lerp(0.75, 1.25, exponent)
    return amplitude * (noise ** exponent)
  }

  function rough({amplitude, exponent, x, y}) {
    const noise = noiseField.value(x / 50, y / 50)
    amplitude = engine.utility.lerp(250, 500, amplitude)
    exponent = engine.utility.lerp(5, 10, exponent)
    return amplitude * (noise ** exponent)
  }

  function sauce({x, y}) {
    const amplitude = 1/32,
      noise = sauceField.value(x / 2, y / 2)

    return amplitude * noise
  }

  function smooth(value) {
    // generalized logistic function
    return 1 / (1 + (Math.E ** (-20 * (value - 0.5))))
  }

  function waves({amplitude, exponent, x}) {
    const wavelength = 62.5 + (12.5 * Math.sin(x * engine.const.tau / 5000))
    const oscillation = (Math.cos(x * engine.const.tau / wavelength) + 1) / 2

    amplitude = engine.utility.lerp(5, 20, amplitude)
    exponent = engine.utility.lerp(1, 2.8, exponent)

    // Prevent odd exponents
    exponent = Math.round((exponent - (exponent % 0.2)) * 100) / 100

    return amplitude * (oscillation ** exponent)
  }

  return {
    current: function () {
      if (current === undefined) {
        cacheCurrent()
      }

      return current
    },
    debug: (position = engine.position.getVector()) => ({
      biomes: getWeightedBiomes(position.x, position.y),
      cache,
      value: getValue(position.x, position.y),
    }),
    import: function () {
      cacheCurrent()
      return this
    },
    reset: function () {
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
