content.materials = (() => {
  const chunks = [],
    chunkSize = 100,
    chunkTree = engine.utility.quadtree.create(),
    pubsub = engine.utility.pubsub.create()

  // TODO: place breadcrumbs at collected materials? possibly another module

  function exportChunks() {
    const data = []

    for (const chunk of chunks) {
      if (chunk.hasCollected()) {
        data.push({
          collected: chunk.getCollected(),
          x: chunk.x,
          y: chunk.y,
        })
      }
    }

    return data
  }

  function instantiateChunk(options) {
    const chunk = content.materials.chunk.create({
      size: chunkSize,
      ...options,
    })

    chunks.push(chunk)
    chunkTree.insert(chunk)
  }

  function getChunk(x, y) {
    return chunkTree.find({x, y}, engine.const.zero)
  }

  function importChunks(items = []) {
    for (const item of items) {
      instantiateChunk(item)
    }
  }

  function stream() {
    const position = engine.position.getVector()

    const xi = Math.floor(position.x / chunkSize),
      yi = Math.floor(position.y / chunkSize)

    for (let x = xi - 1; x <= xi + 1; x += 1) {
      for (let y = yi - 1; y <= yi + 1; y += 1) {
        if (!getChunk(x, y)) {
          instantiateChunk({x, y})
        }
      }
    }
  }

  return engine.utility.pubsub.decorate({
    chunks: () => [...chunks],
    chunkTree: () => chunkTree,
    collect: function (prop) {
      if (content.inventory.canCollect(prop.type.key)) {
        pubsub.emit('collect', prop)
      } else if (content.upgrades.recycler.isActive()) {
        pubsub.emit('recycle', prop)
      }

      return this
    },
    export: () => ({
      chunks: exportChunks(),
    }),
    import: function (data = {}) {
      importChunks(data.chunks || [])
      return this
    },
    reset: function () {
      for (const chunk of chunks) {
        chunk.destroy()
      }

      chunks.length = 0
      chunkTree.clear()

      return this
    },
    test: function (key = 'common/hydrogen') {
      const type = content.materials.types.get(key)

      const location = engine.position.getVector().add(
        engine.position.getQuaternion().forward().scale(10)
      )

      return engine.props.create(type.prototype, {
        chunk: {collect: () => {}, count: 4},
        index: engine.utility.random.integer(1, 4),
        type,
        x: location.x,
        y: location.y,
        z: content.terrain.value(location.x, location.y) + (content.prop.material.base.radius / 2),
      })
    },
    update: function () {
      stream()
      return this
    },
  }, pubsub)
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.materials.update()
})

engine.state.on('export', (data = {}) => data.materials = content.materials.export())
engine.state.on('import', ({materials}) => content.materials.import(materials))
engine.state.on('reset', () => content.materials.reset())
