content.audio.rcs = (() => {
  const bus = content.audio.createBus(),
    context = engine.audio.context(),
    firstBurnDuration = 1/4,
    pubsub = engine.utility.pubsub.create()

  let synth

  bus.gain.value = engine.utility.fromDb(-16.5)

  function calculateParameters() {
    const rcsThrust = content.movement.rcsThrust()

    return {
      pan: rcsThrust * 0.25,
      power: engine.utility.fromDb(engine.utility.lerp(-12, 0, Math.abs(rcsThrust))),
    }
  }

  function createSynth() {
    const {
      pan,
      power,
    } = calculateParameters()

    synth = engine.audio.synth.createAmBuffer({
      buffer: engine.audio.buffer.noise.white(),
      carrierGain: 1,
      modDepth: 0,
      modFrequency: engine.utility.random.float(28, 22),
    }).filtered({
      detune: engine.utility.random.float(-25, 25),
      frequency: 500,
      Q: 0.01,
      type: 'bandpass',
    }).chainAssign('panner', context.createStereoPanner()).chainAssign('power', context.createGain()).connect(bus)

    synth.panner.pan.value = pan
    synth.power.gain.value = power

    const now = engine.audio.time()
    const end = now + firstBurnDuration

    synth.param.gain.linearRampToValueAtTime(1, now + 1/16)
    synth.param.gain.linearRampToValueAtTime(1/4, end)

    synth.param.carrierGain.linearRampToValueAtTime(5/6, end)
    synth.filter.detune.linearRampToValueAtTime(0, end)
    synth.filter.frequency.exponentialRampToValueAtTime(1000, end)
    synth.filter.Q.linearRampToValueAtTime(1, end)
    synth.param.mod.depth.linearRampToValueAtTime(1/6, end)
    synth.param.mod.frequency.linearRampToValueAtTime(engine.utility.random.float(6, 10), end)
  }

  function destroySynth() {
    const now = engine.audio.time(),
      release = 1/4

    engine.audio.ramp.linear(synth.param.gain, engine.const.zeroGain, release)
    synth.stop(now + release)

    synth = null
  }

  function updateSynth() {
    const {
      pan,
      power,
    } = calculateParameters()

    engine.audio.ramp.set(synth.panner.pan, pan)
    engine.audio.ramp.set(synth.power.gain, power)
  }

  return engine.utility.pubsub.decorate({
    reset: function () {
      if (synth) {
        destroySynth()
      }

      return this
    },
    update: function () {
      const isRcsActive = content.movement.rcsThrust() != 0

      if (isRcsActive) {
        if (!synth) {
          createSynth()
        } else {
          updateSynth()
        }

        pubsub.emit('fire')
      } else if (synth) {
        destroySynth()
      }

      return this
    },
  }, pubsub)
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.rcs.update()
})

engine.state.on('reset', () => content.audio.rcs.reset())
