content.audio.transform = (() => {
  const bus  = content.audio.createBus(),
    pubsub = engine.utility.pubsub.create(),
    rootFrequency = engine.utility.midiToFrequency(24)

  let currentMode,
    detune,
    synth

  bus.gain.value = engine.utility.fromDb(-6)

  function calculateParameters() {
    const progress = content.movement.mode()

    const amodDepth = engine.utility.lerp(2/5, 1/2, progress)

    return {
      amodDepth: amodDepth,
      amodFrequency: engine.utility.lerp(16, 2, progress),
      carrierGain: 1 - amodDepth,
      detune: engine.utility.lerp(1200, 0, progress),
      fmodDetune: engine.utility.lerp(0, 1200, progress),
      fmodDepth: rootFrequency * engine.utility.lerp(2, 4, progress),
      gain: Math.sin(progress * Math.PI),
    }
  }

  function createSynth() {
    const parameters = calculateParameters()

    detune = engine.utility.random.float(-50, 50)

    synth = engine.audio.synth.createMod({
      amodDepth: parameters.amodDepth,
      amodFrequency: parameters.amodFrequency,
      carrierDetune: detune + parameters.detune,
      carrierGain: parameters.carrierGain,
      carrierFequency: rootFrequency,
      fmodDepth: parameters.fmodDepth,
      fmodDetune: parameters.fmodDetune,
      fmodFrequency: rootFrequency * 2,
      gain: parameters.gain,
      type: 'triangle',
    }).shaped(
      engine.audio.shape.noise4()
    ).filtered({
      frequency: rootFrequency * 4,
    }).connect(bus)
  }

  function destroySynth() {
    synth.stop()
    synth = null
  }

  function updateSynth() {
    const parameters = calculateParameters()

    engine.audio.ramp.set(synth.param.amod.depth, parameters.amodDepth)
    engine.audio.ramp.set(synth.param.amod.frequency, parameters.amodFrequency)
    engine.audio.ramp.set(synth.param.carrierGain, parameters.carrierGain)
    engine.audio.ramp.set(synth.param.detune, detune + parameters.detune)
    engine.audio.ramp.set(synth.param.fmod.depth, parameters.fmodDepth)
    engine.audio.ramp.set(synth.param.fmod.detune, parameters.fmodDetune)
    engine.audio.ramp.set(synth.param.gain, parameters.gain)
  }

  return engine.utility.pubsub.decorate({
    import: function () {
      currentMode = content.movement.mode()
      return this
    },
    reset: function () {
      if (synth) {
        destroySynth()
      }

      currentMode = 0

      return this
    },
    update: function () {
      const mode = content.movement.mode(),
        shouldUpdate = mode != currentMode

      if (shouldUpdate) {
        if (!synth) {
          createSynth()
        } else {
          updateSynth()
        }

        pubsub.emit('fire')
      } else if (synth) {
        destroySynth()
      }

      currentMode = mode

      return this
    },
  }, pubsub)
})()

engine.ready(() => {
  engine.loop.on('frame', ({paused}) => {
    if (paused) {
      return
    }

    content.audio.transform.update()
  })

  engine.state.on('import', () => content.audio.transform.import())
  engine.state.on('reset', () => content.audio.transform.reset())
})
