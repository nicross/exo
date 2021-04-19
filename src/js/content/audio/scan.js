content.audio.scan = (() => {
  const bus = content.audio.createBypass(),
    context = engine.audio.context(),
    rootFrequency = content.utility.frequency.fromMidi(60)

  bus.gain.value = engine.utility.fromDb(-9)

  function render(scan) {
    const now = engine.audio.time()

    renderGroup(scan.left, {
      pan: -1,
      when: now,
    })

    renderGroup(scan.forwardLeftLeft, {
      pan: -2/3,
      when: now,
    })

    renderGroup(scan.forwardForwardLeft, {
      pan: -1/3,
      when: now,
    })

    renderGroup(scan.forward, {
      pan: 0,
      when: now,
    })

    renderGroup(scan.forwardForwardRight, {
      pan: 1/3,
      when: now,
    })

    renderGroup(scan.forwardRightRight, {
      pan: 2/3,
      when: now,
    })

    renderGroup(scan.right, {
      pan: 1,
      when: now,
    })
  }

  function renderGroup(group = [], {pan, when} = {}) {
    const duration = 2

    const panner = context.createStereoPanner()

    panner.pan.value = pan
    panner.connect(bus)

    const synth = engine.audio.synth.createSimple({
      frequency: rootFrequency,
      when,
    }).filtered({
      frequency: rootFrequency,
      Q: 5,
      type: 'notch',
    }).connect(panner)

    const count = group.length

    for (let i = 0; i < count; i += 1) {
      const gain = (1 - (i / (count - 1))) ** 4,
        next = when + ((i + 1) * (duration / count)),
        note = engine.utility.scale(group[i], 0, 12.5, 0, 12)

      const detune = (note - Math.round(note)) * 100,
        frequency = content.utility.frequency.fromMidi(60 + Math.round(note))

      synth.param.detune.linearRampToValueAtTime(detune, next)
      synth.param.frequency.exponentialRampToValueAtTime(frequency, next)
      synth.param.gain.linearRampToValueAtTime(gain / 2.5, next)
    }

    synth.stop(when + duration)
  }

  return {
    render: function (scan) {
      render(scan)
      return this
    },
  }
})()

engine.ready(() => {
  content.scan.on('complete', (...args) => content.audio.scan.render(...args))
})
