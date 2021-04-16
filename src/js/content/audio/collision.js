content.audio.collision = (() => {
  const bus = content.audio.createBus(),
    pubsub = engine.utility.pubsub.create()

  function play() {
    const velocity = engine.position.getVelocity()

    const distance = velocity.distance() || engine.const.zero,
      strength = engine.utility.clamp(distance / content.const.maxWheeledVelocity, 0, 1)

    const synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.pink(),
    }).filtered({
      frequency: engine.utility.lerpExp(200, 800, strength, 2),
    })

    const direction = velocity.scale(1 / distance).rotateQuaternion(
      engine.position.getQuaternion().conjugate()
    )

    const binaural = engine.audio.binaural.create(direction)
      .from(synth)
      .to(bus)

    const duration = engine.utility.lerpExp(1, 4, strength, 0.5),
      now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1, now + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + duration)

    pubsub.emit('trigger', strength)

    synth.stop(now + duration)
    setTimeout(() => binaural.destroy(), duration * 1000)
  }

  return engine.utility.pubsub.decorate({
    trigger: function () {
      play()
      return this
    },
  }, pubsub)
})()

engine.ready(() => {
  // TODO: play when first gluing from air
  content.movement.on('reflect', () => content.audio.collision.trigger())
})
