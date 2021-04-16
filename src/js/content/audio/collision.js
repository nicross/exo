content.audio.collision = (() => {
  const bus = content.audio.createBus()

  function play() {
    const velocity = engine.position.getVelocity()

    // XXX: strength is ratio to hardcoded maximum velocity
    const distance = velocity.distance() || engine.const.zero,
      normal = velocity.scale(1 / distance),
      strength = engine.utility.clamp(distance / 20, 0, 1)

    const synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.pink(),
    }).filtered({
      frequency: engine.utility.lerpExp(200, 800, strength, 2),
    })

    const binaural = engine.audio.binaural.create({
      ...normal,
    }).from(synth).to(bus)

    const duration = engine.utility.lerpExp(1, 4, strength, 0.5),
      now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1, now + 1/32)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)
    setTimeout(() => binaural.destroy(), duration * 1000)
  }

  return {
    trigger: function () {
      play()
      return this
    },
  }
})()

engine.ready(() => {
  // TODO: play when first gluing from air
  content.movement.on('reflect', () => content.audio.collision.trigger())
})
