content.audio.footstep = (() => {
  const bus = content.audio.createBus(),
    pistonRoot = engine.utility.midiToFrequency(31),
    textureField = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, ['footstep', 'texture'], 4),
    textureScale = 100

  let isLeft = false,
    lastAngle = 0,
    lastStep = engine.utility.vector3d.create()

  bus.gain.value = engine.utility.fromDb(-6)

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
    // TODO: prevent footstep on import / glue

    const distance = engine.position.getVector().distance(lastStep),
      strideLength = content.movement.model().strideLength

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
      y: (isLeft ? 1 : -1) * 0.25,
    }).to(bus)

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
    console.log('crunch', strength, texture)

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
      gain = engine.utility.fromDb(engine.utility.lerp(-6, -3, strength)),
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
    reset: function () {
      isLeft = false
      lastAngle = 0
      lastStep = engine.utility.vector3d.create()
      return this
    },
    update: function () {
      if (!content.movement.isBipedal() || !content.movement.isGrounded()) {
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

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.footstep.update()
})

engine.state.on('import', () => content.audio.footstep.import())
engine.state.on('reset', () => content.audio.footstep.reset())
