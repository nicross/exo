content.terrain = (() => {
  const biomeXField = engine.utility.perlin2d.create('terrain', 'biomeX'),
    biomeYField = engine.utility.perlin2d.create('terrain', 'biomeY'),
    biomeScale = 10000,
    noiseField = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, 'terrain', 2),
    sauceField = engine.utility.perlin2d.create('terrain', 'sauce')

  // TODO: generalized noise fields: exponent and scale

  const biomes = [
    {x: 1/5, y: 1/3, name: 'flat', command: flat}, {x: 1/5, y: 2/3, name: 'waves', command: waves},
    {x: 2/5, y: 1/3, name: 'plains', command: plains}, {x: 2/5, y: 2/3, name: 'rolling', command: rolling},
    {x: 3/5, y: 1/3, name: 'rough', command: rough}, {x: 3/5, y: 2/3, name: 'polar', command: polar},
    {x: 4/5, y: 1/3, name: 'mountains', command: mountains}, {x: 4/5, y: 2/3, name: 'plateau', command: plateau},
  ]

  const biomeCache = engine.utility.octree.create()

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

  function flat(x, y) {
    return noiseField.value(x / 100, y / 100) * 2
  }

  function generateBiome(x, y) {
    x = biomeXField.value(x, y)
    y = biomeYField.value(x, y)

    for (const biome of biomes) {
      biome.distance = engine.utility.distance2({x, y}, {x: biome.x, y: biome.y})
    }

    const closest = biomes.sort((a, b) => {
      return b.distance - a.distance
    }).slice(6)

    let sum = closest.reduce((sum, biome) => {
      return sum + biome.distance
    }, 0)

    for (const biome of closest) {
      biome.percent = 1 - (biome.distance / sum)
    }

    return (x, y) => {
      let value = 0

      for (const biome of closest) {
        value += biome.percent * biome.command(x, y)
      }

      return value
    }
  }

  function getBiome(x, y) {
    x = Math.round(x)
    y = Math.round(y)

    x /= biomeScale
    y /= biomeScale
    y += 0.5

    let result = biomeCache.find({x, y}, 1/biomeScale)

    if (result) {
      return result
    }

    result = generateBiome(x, y)
    biomeCache.insert(result)

    return result
  }

  function getValue(x, y) {
    const biome = getBiome(x, y)
    return biome(x, y) + sauce(x, y)
  }

  function mountains(x, y) {
    // TODO: Adjust amplitude and exponent by noise fields
    return (noiseField.value(x / 1000, y / 1000) ** (1/3)) * 2000
  }

  function polar(x, y) {
    // TODO: Adjust amplitude and exponent by noise fields

    // TODO: repeat in a grid somehow,basically to create pockets of radial symmetry that fade out from their center
    /*
    const xi = Math.floor(x / 1000) * 1000,
      yi = Math.floor(y / 1000) * 1000

    const blend = engine.utility.distance({x, y}, {x: xi, y: xi})
    */

    return (noiseField.value(engine.utility.distance({x, y}) / 100, Math.abs(x + y) / 100) ** 8) * 1000
  }

  function plains(x, y) {
    // TODO: Adjust amplitude by noise field
    return noiseField.value(x / 100, y / 100) * 5
  }

  function plateau(x, y) {
    // TODO: Adjust stairHeight, amplitude, and exponent by noise fields
    const amplitude = 500,
      stairHeight = 2,
      value = (noiseField.value(x / 1000, y / 1000) ** 0.5) * amplitude

    const v0 = Math.floor(value / stairHeight) * stairHeight,
      delta = smooth((value - v0) / stairHeight) * stairHeight

    return v0 + delta
  }

  function rolling(x, y) {
    // TODO: Adjust amplitude by noise field
    return noiseField.value(x / 50, y / 50) * 10
  }

  function rough(x, y) {
    // TODO: Adjust amplitude and exponent by noise fields
    return (noiseField.value(x / 50, y / 50) ** 10) * 500
  }

  function sauce(x, y) {
    return sauceField.value(x / 4, y / 4) / 8
  }

  function smooth(value) {
    // generalized logistic function
    return 1 / (1 + (Math.E ** (-20 * (value - 0.5))))
  }

  function waves(x, y) {
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
    import: function () {
      cacheCurrent()
      return this
    },
    reset: function () {
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

engine.loop.on('frame', () => content.terrain.update())
engine.state.on('import', () => content.terrain.import())
engine.state.on('reset', () => content.terrain.reset())
