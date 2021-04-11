content.audio = (() => {
  const bus = engine.audio.mixer.createBus(),
    context = engine.audio.context()

  return {
    bus: () => bus,
    createBus: () => {
      const gain = context.createGain()
      gain.connect(bus)
      return gain
    },
  }
})()
