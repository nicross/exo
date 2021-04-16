content.audio.footstep = (() => {
  const bus = content.audio.createBus(),
    context = engine.audio.context(),
    highpass = context.createBiquadFilter(),
    pistonRoot = engine.utility.midiToFrequency(31),
    textureField = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, ['footstep', 'texture'], 4),
    textureScale = 100

  let isLeft = false,
    lastAngle = 0,
    lastStep = engine.utility.vector3d.create()

  highpass.connect(bus)
  highpass.frequency.value = 80
  highpass.type = 'highpass'

  bus.gain.value = engine.utility.fromDb(-3)
  content.utility.ephemeralNoise.manage(textureField)

  function getTexture() {
    const {x, y} = engine.position.getVector()
    const value = textureField.value(x / textureScale, y / textureScale)
    return humanizeNormal(value, 1/16)
  }

  function humanizeNormal(value, amount) {
    return engine.utility.clamp(engine.utility.humanize(value, amount), 0, 1)
  }

  function shouldStep() {
    // TODO: footstep on complete stop

    const distance = engine.utility.distance({
      ...lastStep,
      z: 0,
    }, {
      ...engine.position.getVector(),
      z: 0,
    })

    const strideLength = content.movement.model().strideLength

    if (distance >= strideLength) {
      return true
    }

    const angle = engine.position.getEuler().yaw,
      difference = angle - lastAngle

    return !engine.utility.between(difference, -Math.PI/2, Math.PI/2)
  }

  function trigger() {
    const binaural = engine.audio.binaural.create({
      x: 0.25,
      y: (isLeft ? 1 : -1) * 0.5,
      z: -1,
    }).to(highpass)

    triggerPiston(binaural)
      .then(() => triggerCrunch(binaural))
      .then(() => binaural.destroy())
  }

  function triggerCrunch(binaural) {
    const texture = getTexture(),
      velocity = engine.position.getVelocity().distance()

    // XXX: strength is ratio to hardcoded maximum velocity
    const strength = engine.utility.clamp(velocity / 10, 0, 1)

    // TODO: synth
    const duration = engine.utility.random.float(1/3, 1/2)

    const attack = duration / 4,
      color = (strength ** 0.5) * texture,
      depth = engine.utility.lerp(0, 0.5, texture),
      frequency = engine.utility.lerp(400, 1200, color),
      gain = engine.utility.lerpExp(1, 0.125, color, 0.5)

    const synth = engine.audio.synth.createAmBuffer({
      buffer: engine.audio.buffer.noise.white(),
      carrierGain: 1,
      modDepth: 0,
      modFrequency: engine.utility.lerp(4, 20, texture),
    }).filtered()

    const now = engine.audio.time()

    synth.filter.frequency.setValueAtTime(frequency / 2, now + attack)
    synth.filter.frequency.exponentialRampToValueAtTime(frequency, now + duration)

    synth.param.gain.exponentialRampToValueAtTime(gain, now + attack)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.param.carrierGain.linearRampToValueAtTime(1 - depth, now + duration)
    synth.param.mod.depth.linearRampToValueAtTime(depth, now + duration)

    binaural.from(synth)
    synth.stop(now + duration)

    return engine.utility.timing.promise(250)
  }

  function triggerPiston(binaural) {
    const thrust = content.movement.normalThrust().distance()
    const strength = humanizeNormal(thrust, 1/16)

    const synth = engine.audio.synth.createSimple({
      detune: engine.utility.random.float(-25, 25),
      frequency: pistonRoot,
      type: 'triangle',
    }).shaped(
      engine.audio.shape.noise4()
    ).filtered({
      frequency: pistonRoot * 4,
      type: 'bandpass',
    })

    const detune = engine.utility.lerp(500, 1200, strength),
      duration = engine.utility.lerp(1/2, 1/4, strength),
      gain = engine.utility.fromDb(engine.utility.lerp(-3, 0, strength)),
      now = engine.audio.time()

    synth.param.detune.linearRampToValueAtTime(detune, now + duration)
    synth.param.gain.linearRampToValueAtTime(gain, now + duration/2)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    binaural.from(synth)
    synth.stop(now + duration)

    return engine.utility.timing.promise(duration / 2)
  }

  return {
    import: function () {
      isLeft = Math.random() > 0.5
      lastAngle = engine.position.getEuler().yaw
      lastStep = engine.position.getVector()
      return this
    },
    onJump: function () {
      return this.update(true)
    },
    reset: function () {
      isLeft = false
      lastAngle = 0
      lastStep = engine.utility.vector3d.create()
      return this
    },
    update: function (force = false) {
      if (!content.movement.isBipedal() || !(force || content.movement.isGrounded())) {
        return this
      }

      if (force || shouldStep()) {
        trigger()

        isLeft = !isLeft
        lastAngle = engine.position.getEuler().yaw
        lastStep = engine.position.getVector()
      }

      return this
    },
  }
})()

engine.ready(() => {
  content.movement.on('jump', () => content.audio.footstep.onJump())
})

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.footstep.update()
})

engine.state.on('import', () => content.audio.footstep.import())
engine.state.on('reset', () => content.audio.footstep.reset())
