content.audio.jets = (() => {
  const bus = content.audio.createBus(),
    context = engine.audio.context(),
    firstBurnDuration = 1/4,
    pubsub = engine.utility.pubsub.create()

  let firstBurn,
    firstBurnTimeout,
    synth

  bus.gain.value = engine.utility.fromDb(-13.5)

  function calculateParameters(delta = content.movement.jetDelta()) {
    const model = content.movement.model(),
      progress = engine.utility.clamp(delta / model.jetCapacity, 0, 1),
      vector = content.movement.jetVector().normalize()

    const modDepth = engine.utility.lerp(0, 1/4, progress)

    return {
      carrierGain: 1 - modDepth,
      filterFrequency: engine.utility.lerpExp(500, 100, progress, 2),
      filterQ: engine.utility.lerp(0.01, 1, progress),
      gain: engine.utility.fromDb(engine.utility.lerp(0, -1.5, progress)),
      modDepth,
      modFrequency: engine.utility.lerp(20, 4, progress),
      pan: vector.y * 0.5,
    }
  }

  function createSynth() {
    const end = calculateParameters(content.movement.jetDelta() + firstBurnDuration),
      now = engine.audio.time(),
      start = calculateParameters(0)

    synth = engine.audio.synth.createAmBuffer({
      buffer: engine.audio.buffer.noise.brown(),
      carrierGain: start.carrierGain,
      modDepth: start.modDepth,
      modFrequency: start.modFrequency,
    }).filtered({
      frequency: start.filterFrequency,
      Q: start.filterQ,
      type: 'bandpass',
    }).chainAssign('panner', context.createStereoPanner()).connect(bus)

    synth.panner.pan.value = start.pan

    synth.param.gain.linearRampToValueAtTime(1, now + 1/16)
    synth.param.gain.linearRampToValueAtTime(end.gain, now + firstBurnDuration)

    synth.param.carrierGain.linearRampToValueAtTime(end.carrierGain, now + firstBurnDuration)
    synth.filter.frequency.linearRampToValueAtTime(end.filterFrequency, now + firstBurnDuration)
    synth.filter.Q.linearRampToValueAtTime(end.filterQ, now + firstBurnDuration)
    synth.param.mod.depth.linearRampToValueAtTime(end.modDepth, now + firstBurnDuration)
    synth.param.mod.frequency.linearRampToValueAtTime(end.modFrequency, now + firstBurnDuration)

    firstBurn = true
    firstBurnTimeout = setTimeout(() => firstBurn = false, firstBurnDuration * 1000)
  }

  function destroySynth() {
    const now = engine.audio.time(),
      release = 1/4

    engine.audio.ramp.linear(synth.param.gain, engine.const.zeroGain, release)
    synth.stop(now + release)

    firstBurn = false
    clearTimeout(firstBurnTimeout)

    synth = null
  }

  function updateSynth() {
    const {
      carrierGain,
      filterFrequency,
      filterQ,
      gain,
      modDepth,
      modFrequency,
      pan,
    } = calculateParameters()

    engine.audio.ramp.set(synth.param.carrierGain, carrierGain)
    engine.audio.ramp.set(synth.filter.frequency, filterFrequency)
    engine.audio.ramp.set(synth.filter.Q, filterQ)
    engine.audio.ramp.set(synth.param.gain, gain)
    engine.audio.ramp.set(synth.param.mod.depth, modDepth)
    engine.audio.ramp.set(synth.param.mod.frequency, modFrequency)
    engine.audio.ramp.set(synth.panner.pan, pan)
  }

  return engine.utility.pubsub.decorate({
    reset: function () {
      if (synth) {
        destroySynth()
      }

      return this
    },
    update: function () {
      const isJetActive = content.movement.isJetActive()

      if (isJetActive) {
        if (!synth) {
          createSynth()
        } else if (!firstBurn) {
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

  content.audio.jets.update()
})

engine.state.on('reset', () => content.audio.jets.reset())
