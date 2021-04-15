content.audio.jump = (() => {
  const bus = content.audio.createBus()

  bus.gain.value = engine.utility.fromDb(-12)

  function play() {
    const duration = engine.utility.random.float(1/3, 2/3)

    const attack = duration / 4,
      frequency = engine.utility.random.float(1500, 2000)

    const synth = engine.audio.synth.createBuffer({
      buffer: engine.audio.buffer.noise.pink(),
    }).filtered().connect(bus)

    const now = engine.audio.time()

    synth.filter.frequency.setValueAtTime(frequency / 2, now + attack)
    synth.filter.frequency.exponentialRampToValueAtTime(frequency, now + duration)

    synth.param.gain.exponentialRampToValueAtTime(1, now + attack)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, now + duration)

    synth.stop(now + duration)
  }

  return {
    trigger: function () {
      play()
      return this
    },
  }
})()

engine.ready(() => {
  content.movement.on('jump', () => content.audio.jump.trigger())
})
