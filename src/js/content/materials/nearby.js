content.materials.nearby = (() => {
  const map = new Map(),
    tree = engine.utility.octree.create()

  return {
    chunk: function (chunk) {
      for (const token of chunk.tokens.keys()) {
        const {options} = engine.streamer.getRegisteredProp(token)

        const item = {
          token,
          type: options.type,
          x: options.x,
          y: options.y,
          z: options.z,
        }

        map.set(token, item)
        tree.insert(item)
      }

      return this
    },
    collect: function (prop) {
      const item = map.get(prop.token)

      map.delete(prop.token)
      tree.remove(item)

      return this
    },
    debug: function (radius = 100) {
      const position = engine.position.getVector()

      return {
        items: this.retrieveAll({
          depth: radius * 2,
          height: radius * 2,
          width: radius * 2,
          x: position.x - radius,
          y: position.y - radius,
          z: position.z - radius,
        }),
        map,
        tree,
      }
    },
    reset: function () {
      return this
    },
    retrieve: (...args) => tree.retrieve(...args),
    retrieveAll: function (...args) {
      return this.retrieveAllTokens(...args).map((token) => {
        const prop = engine.streamer.getStreamedProp(token)

        if (prop) {
          return {
            token,
            type: prop.type,
            x: prop.x,
            y: prop.y,
            z: prop.z,
          }
        }

        const item = map.get(token)

        return {...item}
      })
    },
    retrieveAllTokens: (...args) => {
      const tokens = new Set(
        [
          ...engine.streamer.getStreamedProps(),
          ...tree.retrieve(...args),
        ].map(({token}) => token)
      )

      return Array.from(tokens.values())
    },
  }
})()

content.materials.on('chunk', (...args) => content.materials.nearby.chunk(...args))
content.materials.on('collect', (...args) => content.materials.nearby.collect(...args))
engine.state.on('reset', () => content.materials.nearby.reset())
