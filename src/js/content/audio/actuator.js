content.audio.actuator = (() => {
  const bus = content.audio.createBus(),
    rootFrequency = engine.utility.midiToFrequency(36)

  let strength = 0,
    synth

  bus.gain.value = engine.utility.fromDb(-12)

  function calculateIntent() {
    // TODO: while turning

    if (!content.movement.isGroundedEnough()) {
      return 0
    }

    const mode = engine.utility.lerp(0.5, 1, content.movement.mode()),
      normal = content.movement.normalThrust().distance(),
      turbo = engine.utility.lerp(0.5, 1, content.movement.turbo())

    return normal * mode * turbo
  }

  function calculateParameters() {
    const amodDepth = engine.utility.lerp(1/4, 1/3, strength)

    return {
      amodDepth,
      amodFrequency: engine.utility.lerp(1/2, 1, strength) * rootFrequency / 4,
      carrierGain: 1 - amodDepth,
      detune: engine.utility.lerp(-3600, -1200, strength),
      fmodDepth: engine.utility.lerp(0, 4, strength) * rootFrequency,
      fmodDetune: engine.utility.lerp(700, 2400, strength),
      gain: engine.utility.lerpExp(engine.const.zeroGain, 1, strength, 1/3),
    }
  }

  function createSynth() {
    const parameters = calculateParameters()

    synth = engine.audio.synth.createMod({
      amodDepth: parameters.amodDepth,
      amodFrequency: parameters.amodFrequency,
      carrierDetune: parameters.detune,
      carrierFrequence: rootFrequency,
      carrierGain: parameters.carrierGain,
      fmodDepth: parameters.fmodDepth,
      fmodDetune: parameters.fmodDetune,
      fmodFrequency: rootFrequency * 2,
      fmodType: 'sawtooth',
      gain: parameters.gain,
    }).filtered({
      frequency: rootFrequency * 8,
    }).connect(bus)
  }

  function destroySynth() {
    // see jets if release needed
    synth.stop()
    synth = null
  }

  function updateSynth() {
    const parameters = calculateParameters()

    engine.audio.ramp.set(synth.param.amod.depth, parameters.amodDepth)
    engine.audio.ramp.set(synth.param.amod.frequency, parameters.amodFrequency)
    engine.audio.ramp.set(synth.param.carrierGain, parameters.carrierGain)
    engine.audio.ramp.set(synth.param.detune, parameters.detune)
    engine.audio.ramp.set(synth.param.fmod.detune, parameters.fmodDetune)
    engine.audio.ramp.set(synth.param.gain, parameters.gain)
    engine.audio.ramp.set(synth.param.fmod.depth, parameters.fmodDepth)
  }

  return {
    reset: function () {
      if (synth) {
        destroySynth()
      }

      strength = 0

      return this
    },
    update: function () {
      const intent = calculateIntent()

      strength = content.utility.accelerate.value(strength, intent, 1/2)

      if (strength) {
        if (synth) {
          updateSynth()
        } else {
          createSynth()
        }
      } else if (synth) {
        destroySynth()
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.actuator.update()
})

engine.state.on('reset', () => content.audio.actuator.reset())
