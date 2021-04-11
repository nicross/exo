content.audio.wind = (() => {
  const binaural = engine.audio.binaural.create(),
    bus = content.audio.createBus()

  const maxFrequency = 120,
    minFrequency = 20

  let synth

  binaural.to(bus)
  bus.gain.value = engine.utility.fromDb(-9)

  function createSynth() {
    synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.brown(),
    }).filtered({
      frequency: engine.const.minFrequency,
      type: 'bandpass',
    })

    engine.audio.ramp.linear(bus.gain, 1, 1/32)
    binaural.from(synth)
  }

  function destroySynth() {
    engine.audio.ramp.linear(bus.gain, engine.const.zeroGain, 1/32)
    synth.stop(engine.audio.time(1/32))
    synth = null
  }

  function getVector() {
    const movement = engine.position.getVelocity()
      .scale(1 / 20)
      .rotateQuaternion(engine.position.getQuaternion().conjugate())

    const wind = engine.utility.vector3d.create({x: -1})
      .scale((content.wind.value() ** 2) / 8)
      .rotateQuaternion(engine.position.getQuaternion())

    return movement.add(wind)
  }

  function updateSynth() {
    const vector = getVector()
    const strength = engine.utility.clamp(vector.distance(), 0, 1)

    const frequency = engine.utility.lerp(minFrequency, maxFrequency, strength),
      gain = engine.utility.fromDb(engine.utility.lerp(0, -1.5, strength))

    engine.audio.ramp.set(synth.filter.frequency, frequency)
    engine.audio.ramp.set(synth.param.gain, gain)

    binaural.update(vector.normalize())
  }

  return {
    import: function () {
      if (!synth) {
        createSynth()
      }

      return this
    },
    reset: function () {
      if (synth) {
        destroySynth()
      }

      return this
    },
    update: function () {
      updateSynth()
      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.wind.update()
})

engine.state.on('import', () => content.audio.wind.import())
engine.state.on('reset', () => content.audio.wind.reset())
