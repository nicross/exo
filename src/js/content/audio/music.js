content.audio.music = (() => {
  const bus = content.audio.createBus(),
    context = engine.audio.context(),
    fadeAltitude = 100,
    filter = context.createBiquadFilter(),
    input = context.createGain(),
    reverb = content.audio.reverb(),
    rootFrequency = content.utility.frequency.fromMidi(48)

  let idleProgress = 0,
    synths = []

  input.connect(filter)
  filter.connect(bus)
  filter.connect(reverb)

  bus.gain.value = engine.utility.fromDb(-9)

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

  function updateFader() {
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
    synths: () => [...synths],
    import: function () {
      createSynths()
      return this
    },
    reset: function () {
      idleProgress = 0

      if (synths.length) {
        destroySynths()
      }

      return this
    },
    update: function () {
      idleProgress = content.utility.accelerate.value(idleProgress, content.idle.progress(), 1)

      updateFader()
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
