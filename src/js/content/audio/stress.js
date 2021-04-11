content.audio.stress = (() => {
  const bus = content.audio.bus(),
    context = engine.audio.context()

  let breathExhale = false,
    breathTimer,
    pulseTimer

  function breath() {
    const level = content.stress.level(),
      now = engine.audio.time()

    const duration = engine.utility.lerpRandom([2.5, 1.5], [1, 0.5], level)

    // TODO: create synth
    console.log(breathExhale ? 'exhale' : 'inhale')

    // Timer
    const next = now + duration

    breathTimer = context.createConstantSource()
    breathTimer.onended = breath
    breathTimer.start()
    breathTimer.stop(next)

    // Switch next breath type
    breathExhale = !breathExhale
  }

  function pulse() {
    const bpm = content.stress.bpm(),
      duration = 1 / (bpm / 60),
      level = content.stress.level(),
      now = engine.audio.time()

    // TODO: create synth
    console.log('pulse')

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

      breathExhale = false

      return this
    },
  }
})()

// Ensure bpm is populated by import before first breath/pulse
engine.state.on('import', () => setTimeout(() => content.audio.stress.import(), 0))
engine.state.on('reset', () => content.audio.stress.reset())
