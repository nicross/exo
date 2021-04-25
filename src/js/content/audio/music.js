content.audio.music = (() => {
  const bus = content.audio.createBus(),
    context = engine.audio.context(),
    fadeAltitude = 100,
    filter = context.createBiquadFilter(),
    input = context.createGain(),
    output = context.createGain(),
    reverb = content.audio.reverb(),
    rootFrequency = content.utility.frequency.fromMidi(48)

  let idleProgress = 0,
    isActive = true,
    synths = []

  input.connect(filter)
  filter.connect(output)
  filter.connect(reverb)
  output.connect(bus)

  // Internal gain, bus is normalized at 0 dB and set via this.setGain()
  output.gain.value = engine.utility.fromDb(-9)

  function createSynths() {
    synths.push(
      content.audio.music.synth.create({
        destination: input,
        index: 0,
      })
    )

    synths.push(
      content.audio.music.synth.create({
        destination: input,
        index: 1,
      })
    )

    synths.push(
      content.audio.music.synth.create({
        destination: input,
        index: 2,
      })
    )
  }

  function destroySynths() {
    for (const synth of synths) {
      synth.destroy()
    }

    synths.length = 0
  }

  function updateFilter() {
    const {z} = engine.position.getVector()
    const terrain = content.terrain.current()

    const altitude = engine.utility.scale(z - terrain, 0, fadeAltitude, 0, 1),
      idle = (idleProgress ** 2) * 0.0625, // up a fifth when idle
      strength = engine.utility.clamp(altitude + idle, 0, 1)

    const frequency = engine.utility.lerpExp(rootFrequency, rootFrequency * 4, strength, 0.5)

    engine.audio.ramp.set(filter.frequency, frequency)
  }

  function updateSynths() {
    for (const synth of synths) {
      synth.update()
    }
  }

  return {
    bus: () => bus,
    import: function () {
      if (isActive) {
        createSynths()
      }

      return this
    },
    isActive: () => isActive,
    reset: function () {
      idleProgress = 0

      if (synths.length) {
        destroySynths()
      }

      return this
    },
    setActive: function (value, isRunning = false) {
      isActive = Boolean(value)

      if (isRunning) {
        if (isActive && !synths.length) {
          createSynths()
        } else if (!isActive && synths.length) {
          destroySynths()
        }
      }

      return this
    },
    setGain: function (value) {
      engine.audio.ramp.set(bus.gain, value)
      return this
    },
    synths: () => [...synths],
    update: function () {
      if (!isActive) {
        return this
      }

      idleProgress = content.utility.accelerate.value(idleProgress, content.idle.progress(), 1)

      updateFilter()
      updateSynths()

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.music.update()
})

engine.state.on('import', () => content.audio.music.import())
engine.state.on('reset', () => content.audio.music.reset())
