content.audio.tires = (() => {
  const bus = content.audio.createBus(),
    pubsub = engine.utility.pubsub.create(),
    throttleRate = 1000/20

  let throttle = 0

  bus.gain.value = engine.utility.fromDb(-6)

  function grain() {
    const velocity = humanize(engine.position.getVelocity())
    const strength = toStrength(velocity)

    const direction = velocity.normalize().rotateQuaternion(
      engine.position.getQuaternion().conjugate()
    )

    const synth = engine.audio.synth.createAmBuffer({
      buffer: engine.audio.buffer.noise.brown(),
      carrierGain: 1/2,
      modDepth: 1/2,
      modFrequency: engine.utility.lerpRandom([4, 8], [10, 20], strength),
    }).filtered({
      frequency: engine.utility.lerp(80, 640, strength),
    })

    const binaural = engine.audio.binaural.create(direction)
      .from(synth.output)
      .to(bus)

    const duration = engine.utility.lerp(1/4, 1, strength),
      gain = engine.utility.lerp(1, 1/2, strength),
      now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(gain, now + duration/2)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)
    setTimeout(() => binaural.destroy(), duration * 1000)

    pubsub.emit('grain')
    throttle = performance.now()
  }

  function humanize(vector, scale = 1/2) {
    vector.x *= 1 + engine.utility.random.float(-scale, scale)
    vector.y *= 1 + engine.utility.random.float(-scale, scale)
    vector.z *= 1 + engine.utility.random.float(-scale, scale)
    return vector
  }

  function rollGrain() {
    if (performance.now() < throttle + throttleRate) {
      return false
    }

    if (!content.movement.isGrounded() || !content.movement.isWheeled()) {
      return false
    }

    const velocity = engine.position.getVelocity()

    if (velocity.isZero()) {
      return false
    }

    const fps = Math.max(engine.performance.fps(), 1),
      strength = toStrength(velocity)

    const chance = engine.utility.lerp(1/fps, 1/(fps/8), strength)

    return Math.random() < chance
  }

  function toStrength(vector) {
    // XXX: strength is ratio of hardcoded maximum velocity
    return engine.utility.clamp(vector.distance() / 20, 0, 1)
  }

  return engine.utility.pubsub.decorate({
    update: function () {
      if (rollGrain()) {
        grain()
      }

      return this
    },
  }, pubsub)
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.tires.update()
})
