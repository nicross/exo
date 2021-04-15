content.audio.footstep = (() => {
  const bus = content.audio.createBus()

  let isLeft = false,
    lastAngle = engine.utility.vector3d.create(),
    lastStep = engine.utility.vector3d.create()

  bus.gain.value = engine.utility.fromDb(-6)

  function shouldStep() {
    // TODO: footstep on complete stop

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
    console.log('footstep')

    // TODO: binaural
    // TODO: piston
    // TODO: crunch
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
