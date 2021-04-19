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
    createBypass: () => {
      return engine.audio.mixer.createBus()
    },
    onScanComplete: function () {
      const duration = 2,
        now = engine.audio.time()

      bus.gain.setValueAtTime(1/64, now + duration/2)
      bus.gain.exponentialRampToValueAtTime(1, now + duration)

      return this
    },
    onScanTrigger: function () {
      engine.audio.ramp.exponential(bus.gain, 1/64, 1/4)
      return this
    },
  }
})()

engine.ready(() => {
  content.scan.on('complete', () => content.audio.onScanComplete())
  content.scan.on('trigger', () => content.audio.onScanTrigger())
})
