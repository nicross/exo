content.audio.footstep = (() => {
  const bus = content.audio.createBus(),
    textureField = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, ['footstep', 'texture'], 4),
    textureScale = 100

  let isLeft = false,
    lastAngle = engine.utility.vector3d.create(),
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

    const angle = engine.position.getQuaternion().forward(),
      dot = angle.dotProduct(lastAngle),
      theta = Math.acos(dot / 1)

    return !engine.utility.between(theta, -Math.PI/2, Math.PI/2)
  }

  function trigger() {
    const binaural = engine.audio.binaural.create({
      x: 0,
      y: (isLeft ? 1 : -1) * 0.5,
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

    // TODO: synth
    console.log('piston', strength)

    return engine.utility.timing.promise(250)
  }

  return {
    import: function () {
      isLeft = Math.random() > 0.5
      lastAngle = engine.position.getQuaternion().forward()
      lastStep = engine.position.getVector()
      return this
    },
    reset: function () {
      isLeft = false
      lastAngle = engine.utility.vector3d.create()
      lastStep = engine.utility.vector3d.create()
      return this
    },
    update: function () {
      if (!content.movement.isBipedal() || !content.movement.isGrounded()) {
        return this
      }

      if (shouldStep()) {
        trigger()

        isLeft = !isLeft
        lastAngle = engine.position.getQuaternion().forward()
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
