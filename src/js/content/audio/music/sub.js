content.audio.music.sub = (() => {
  const beat = 4,
    bus = content.audio.createBus(),
    maxAltitude = 7500,
    minAltitude = 2500

  let left,
    leftBinaural,
    right,
    rightBinaural

  bus.gain.value = engine.const.zeroGain

  function createSynths() {
    left = engine.audio.synth.createSimple({
      frequency: 0,
      gain: 0.5,
    })

    leftBinaural = engine.audio.binaural.create().from(left).to(bus)

    right = engine.audio.synth.createSimple({
      frequency: 0,
      gain: 0.5,
    })

    rightBinaural = engine.audio.binaural.create().from(right).to(bus)
  }

  function destroySynths() {
    const now = engine.audio.time(),
      release = 1/16

    if (left) {
      engine.audio.ramp.linear(left.param.gain, engine.const.zeroGain, release)
      left.stop(now + release)
      left = null
    }

    if (leftBinaural) {
      setTimeout(() => leftBinaural.destroy(), release * 1000)
    }

    if (right) {
      engine.audio.ramp.linear(right.param.gain, engine.const.zeroGain, release)
      right.stop(now + release)
      right = null
    }
  }

  function updateSynths(z) {
    const frequency = content.audio.music.chord.getSub()

    engine.audio.ramp.set(left.param.frequency, frequency - beat/2)
    engine.audio.ramp.set(right.param.frequency, frequency + beat/2)

    const strength = engine.utility.clamp(engine.utility.scale(z, minAltitude, maxAltitude, 0, 1), 0, 1)
    const gain = engine.utility.fromDb(engine.utility.lerpExp(engine.const.zeroDb, -9, strength, 0.1))

    engine.audio.ramp.set(bus.gain, gain)

    leftBinaural.update(
      engine.utility.vector3d.create({y: 1})
        .rotateQuaternion(engine.position.getQuaternion())
    )

    rightBinaural.update(
      engine.utility.vector3d.create({y: -1})
        .rotateQuaternion(engine.position.getQuaternion())
    )
  }

  return {
    update: function () {
      const {z} = engine.position.getVector()

      const hasSynths = left || right

      if (z > minAltitude) {
        if (!hasSynths) {
          createSynths()
        }

        updateSynths(z)
      } else if (hasSynths) {
        destroySynths()
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.music.sub.update()
})
