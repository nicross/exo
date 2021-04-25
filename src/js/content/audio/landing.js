content.audio.landing = (() => {
  const bus = content.audio.createBus(),
    pubsub = engine.utility.pubsub.create()

  bus.gain.value = engine.utility.fromDb(-7.5)

  function play() {
    const velocity = engine.position.getVelocity()

    const distance = velocity.distance() || engine.const.zero,
      strength = engine.utility.clamp(distance / content.const.maxBipedalVelocity, 0, 1)

    const synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.brown(),
    }).filtered({
      frequency: engine.utility.lerpExp(80, 160, strength, 2),
    }).connect(bus)

    const duration = engine.utility.lerpExp(2, 4, strength, 0.5),
      now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1, now + 1/16)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + duration)

    pubsub.emit('trigger', strength)

    synth.stop(now + duration)
  }

  return engine.utility.pubsub.decorate({
    trigger: function () {
      play()
      return this
    },
  }, pubsub)
})()

engine.ready(() => {
  content.movement.on('land', () => content.audio.landing.trigger())
})
