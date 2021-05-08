content.audio.materials = (() => {
  const bus = content.audio.createBus(),
    gain = engine.utility.fromDb(0)

  bus.gain.value = gain

  return {
    bus: () => bus,
    duck: function () {
      const now = engine.audio.time()

      engine.audio.ramp.hold(bus.gain)
      bus.gain.exponentialRampToValueAtTime(gain/256, now + 1/32)
      bus.gain.exponentialRampToValueAtTime(gain, now + 0.5)

      return this
    },
  }
})()

engine.ready(() => {
  content.audio.notifications.on('duck', () => content.audio.materials.duck())
})
