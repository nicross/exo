content.materials.chunk = {}

content.materials.chunk.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

content.materials.chunk.prototype = {
  collect: function (prop) {
    const token = prop.token
    const index = this.tokens.get(token)

    this.collected.add(index)
    this.tokens.delete(token)

    content.materials.collect(prop)

    engine.streamer.deregisterProp(token)
    engine.streamer.destroyStreamedProp(token)

    return this
  },
  construct: function ({
    collected = [],
    size = 0,
    x = 0,
    y = 0,
  }) {
    this.collected = new Set(collected)
    this.size = size
    this.tokens = new Map()
    this.x = x
    this.y = y

    this.generate()

    return this
  },
  destroy: function () {
    return this
  },
  hasCollected: function () {
    return this.collected.size
  },
  generate: function () {
    const srand = engine.utility.srand('materials', 'chunk', this.x, this.y)
    const count = Math.round(engine.utility.lerpExp(0, 4, srand(), 3))

    if (!count || this.collected.size == count) {
      return this
    }

    this.cluster = {
      angle: srand(0, engine.const.tau),
      count,
      density: srand(1, 4),
      distance: srand(0, 1/4),
    }

    this.cluster.radius = 1/2 - this.cluster.distance

    for (let i = 0; i < count; i += 1) {
      if (!this.collected.has(i)) {
        this.generateProp(i)
      }
    }

    return this
  },
  generateProp: function (index = 0) {
    const srand = engine.utility.srand('materials', 'chunk', this.x, this.y, index)

    const x = (this.x * this.size) // edge of chunk
      + (this.size / 2) // center of chunk
      + (this.size * this.cluster.distance * Math.cos(this.cluster.angle)) // center of cluster
      + (this.cluster.radius * this.size * (srand() ** this.cluster.density)) // offset from cluster

    const y = (this.x * this.size)
      + (this.size / 2)
      + (this.size * this.cluster.distance * Math.sin(this.cluster.angle))
      + (this.cluster.radius * this.size * (srand() ** this.cluster.density))

    const type = content.materials.types.choose(srand())

    const options = {
      chunk: this,
      index,
      type,
      x,
      y,
      z: content.terrain.value(x, y) + content.prop.material.base.radius,
    }

    const token = engine.streamer.registerProp(type.prototype, options)
    this.tokens.set(token, index)

    return this
  },
  getCollected: function () {
    return Array.from(this.collected)
  },
}
