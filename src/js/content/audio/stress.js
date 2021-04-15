content.audio.stress = (() => {
  const bus = content.audio.createBus(),
    context = engine.audio.context(),
    pulseF1 = engine.utility.midiToFrequency(22),
    pulseF2 = engine.utility.midiToFrequency(24)

  let breathFormant,
    breathTimer,
    pulseTimer

  bus.gain.value = engine.utility.fromDb(-3)

  function breath() {
    const level = content.stress.level(),
      now = engine.audio.time()

    const duration = engine.utility.lerpRandom([4, 3], [1, 0.5], level),
      gain = engine.utility.fromDb(engine.utility.lerpRandom([-9, -8], [-7, -6], level)),
      nextFormant = chooseFormant()

    const synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.pink(),
    }).chainAssign('talkbox', engine.audio.effect.createTalkbox({
      dry: 0,
      format0: engine.audio.formant.create(breathFormant),
      formant1: engine.audio.formant.create(nextFormant),
      mix: 0,
      wet: 1,
    })).connect(bus)

    synth.param.talkbox.mix.setValueAtTime(0, now)
    synth.param.talkbox.mix.linearRampToValueAtTime(1, now + duration)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(gain, now + duration/2)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)

    // Timer
    const delay = engine.utility.lerpRandom([1, 0.5], [0.125, 0], level),
      next = now + duration + delay

    breathTimer = context.createConstantSource()
    breathTimer.onended = breath
    breathTimer.start()
    breathTimer.stop(next)

    breathFormant = nextFormant
  }

  function chooseFormant() {
    return engine.utility.choose([
      engine.audio.formant.a,
      engine.audio.formant.e,
      engine.audio.formant.i,
      engine.audio.formant.o,
      engine.audio.formant.u,
    ], Math.random())()
  }

  function pulse() {
    const bpm = content.stress.bpm(),
      duration = 1 / (bpm / 60),
      level = content.stress.level(),
      now = engine.audio.time()

    const gain = engine.utility.fromDb(engine.utility.lerpRandom([-6, -5], [-4, -3]), level),
      rampDuration = 1/32,
      s1Duration = duration / 3,
      s1Gain = engine.utility.humanizeDb(gain / 1.5, -12),
      s2Duration = duration / 2,
      s2Gain = engine.utility.humanizeDb(gain, -12)

    const endTime = now + s1Duration + s2Duration

    const synth = engine.audio.synth.createSimple().connect(bus)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.linearRampToValueAtTime(s1Gain, now + rampDuration)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + s1Duration - rampDuration)
    synth.param.gain.linearRampToValueAtTime(s2Gain, now + s1Duration)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, endTime)

    synth.param.frequency.setValueAtTime(pulseF1, now)
    synth.param.frequency.setValueAtTime(pulseF1, now + s1Duration - rampDuration)
    synth.param.frequency.exponentialRampToValueAtTime(pulseF2, now + s1Duration)
    synth.param.frequency.exponentialRampToValueAtTime(pulseF1, endTime)

    synth.stop(endTime)

    // Timer
    const next = now + duration

    pulseTimer = context.createConstantSource()
    pulseTimer.onended = pulse
    pulseTimer.start()
    pulseTimer.stop(next)
  }

  return {
    import: function () {
      if (!breathTimer) {
        breath()
      }

      if (!pulseTimer) {
        pulse()
      }

      return this
    },
    reset: function () {
      if (breathTimer) {
        breathTimer.onended = null
        breathTimer.stop()
        breathTimer = null
      }

      if (pulseTimer) {
        pulseTimer.ondended = null
        pulseTimer.stop()
        pulseTimer = null
      }

      breathFormant = chooseFormant()

      return this
    },
  }
})()

// Ensure bpm is populated by import before first breath/pulse
engine.state.on('import', () => setTimeout(() => content.audio.stress.import(), 0))
engine.state.on('reset', () => content.audio.stress.reset())
