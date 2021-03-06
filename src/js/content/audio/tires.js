content.audio.tires = (() => {
  const bus = content.audio.createBus(),
    pubsub = engine.utility.pubsub.create(),
    throttleRate = 1000/20

  let throttle = 0

  bus.gain.value = engine.utility.fromDb(-4.5)

  function grain() {
    const velocity = humanize(engine.position.getVelocity()),
      yaw = Math.abs(engine.position.getAngularVelocityEuler().yaw)

    const strength = toStrength(velocity, yaw)

    const direction = velocity.normalize().rotateQuaternion(
      engine.position.getQuaternion().conjugate()
    )

    const carrierGain = engine.utility.random.float(1/2, 2/3)

    const synth = engine.audio.synth.createAmBuffer({
      buffer: engine.audio.buffer.noise.pink(),
      carrierGain,
      modDepth: 1 - carrierGain,
      modFrequency: engine.utility.lerpRandom([4, 8], [10, 20], strength),
    }).filtered({
      frequency: engine.utility.lerpRandom([100, 150], [300, 600], strength),
    })

    const binaural = engine.audio.binaural.create(direction)
      .from(synth.output)
      .to(bus)

    const duration = engine.utility.lerpRandom([1/8, 1], [1/2, 1], strength),
      gain = engine.utility.random.float(1/2, 1),
      now = engine.audio.time()

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(gain, now + duration/2)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)
    setTimeout(() => binaural.destroy(), duration * 1000)

    pubsub.emit('grain', strength)
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

    if (!content.movement.isGroundedEnough() || !content.movement.isWheeled()) {
      return false
    }

    const velocity = engine.position.getVelocity(),
      yaw = Math.abs(engine.position.getAngularVelocityEuler().yaw)

    if (engine.utility.round(velocity.distance() + yaw, 3) <= 0) {
      return false
    }

    const fps = Math.max(engine.performance.fps(), 1),
      strength = toStrength(velocity, yaw)

    const chance = engine.utility.lerp(1/fps, 1/(fps/8), strength)

    return Math.random() < chance
  }

  function toStrength(velocity, yaw) {
    const velocityRatio = velocity.distance() / content.const.maxWheeledVelocity,
      yawRatio = yaw / content.const.maxAngularVelocity / 16

    return engine.utility.clamp(velocityRatio + yawRatio, 0, 1)
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
