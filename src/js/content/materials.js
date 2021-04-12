content.materials = (() => {
  const pubsub = engine.utility.pubsub.create()

  // TODO: generate in chunks, for simplicity never throw them away
  // TODO: each chunk generates 0-N clusters containing 1-N materials
  // TODO: generated chunks place props in the streamer and track their tokens here
  // TODO: collected are stored as [chunkX, chunkY, index]
  // TODO: collected are omitted from streamer
  // TODO: place breadcrumbs at collected materials? possibly another module

  return engine.utility.pubsub.decorate({
    collect: function (prop) {
      pubsub.emit('collect', prop)
      return this
    },
    export: () => ({
      collected: [],
    }),
    import: function (data = {}) {
      // data.collected
      return this
    },
  }, pubsub)
})()
