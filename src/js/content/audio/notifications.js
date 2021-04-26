content.audio.notifications = (() => {
  const bus = content.audio.createBus(),
    pubsub = engine.utility.pubsub.create()

  bus.gain.value = engine.utility.fromDb(-18)

  function createNote({
    frequency,
    off,
    when,
  } = {}) {
    const synth = engine.audio.synth.createSimple({
      frequency,
      type: 'square',
      when,
    }).filtered({
      frequency: frequency * 4,
    }).connect(bus)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, when)
    synth.param.gain.exponentialRampToValueAtTime(1, when + 1/32)
    synth.param.gain.linearRampToValueAtTime(1/8, off)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, off + 1/8)

    synth.stop(off + 1/8)
  }

  function materialCollect() {
    const now = engine.audio.time()

    createNote({
      frequency: content.utility.frequency.fromMidi(60),
      when: now,
      off: now + 0.0625,
    })

    createNote({
      frequency: content.utility.frequency.fromMidi(63),
      when: now + 0.0625,
      off: now + 0.125,
    })

    createNote({
      frequency: content.utility.frequency.fromMidi(67),
      when: now + 0.125,
      off: now + 0.1875,
    })

    createNote({
      frequency: content.utility.frequency.fromMidi(70),
      when: now + 0.1875,
      off: now + 0.25,
    })

    createNote({
      frequency: content.utility.frequency.fromMidi(75),
      when: now + 0.25,
      off: now + 0.3125,
    })
  }

  function materialFull() {
    const now = engine.audio.time()

    createNote({
      frequency: content.utility.frequency.fromMidi(70),
      when: now,
      off: now + 0.0625,
    })

    createNote({
      frequency: content.utility.frequency.fromMidi(67),
      when: now + 0.0625,
      off: now + 0.125,
    })

    createNote({
      frequency: content.utility.frequency.fromMidi(63),
      when: now + 0.125,
      off: now + 0.1875,
    })

    createNote({
      frequency: content.utility.frequency.fromMidi(62),
      when: now + 0.1875,
      off: now + 0.25,
    })

    createNote({
      frequency: content.utility.frequency.fromMidi(55),
      when: now + 0.25,
      off: now + 0.3125,
    })
  }

  function materialRecycle() {
    const now = engine.audio.time()

    createNote({
      frequency: content.utility.frequency.fromMidi(60),
      when: now,
      off: now + 0.0625,
    })

    createNote({
      frequency: content.utility.frequency.fromMidi(63),
      when: now + 0.0625,
      off: now + 0.125,
    })

    createNote({
      frequency: content.utility.frequency.fromMidi(65),
      when: now + 0.125,
      off: now + 0.1875,
    })

    createNote({
      frequency: content.utility.frequency.fromMidi(67),
      when: now + 0.1875,
      off: now + 0.25,
    })

    createNote({
      frequency: content.utility.frequency.fromMidi(70),
      when: now + 0.25,
      off: now + 0.3125,
    })
  }

  return engine.utility.pubsub.decorate({
    materialCollect: function () {
      this.emit('duck')
      materialCollect()
      return this
    },
    materialFull: function () {
      this.emit('duck')
      materialFull()
      return this
    },
    materialRecycle: function () {
      this.emit('duck')
      materialRecycle()
      return this
    },
  }, pubsub)
})()

engine.ready(() => {
  content.inventory.on('full', () => content.audio.notifications.materialFull())
  content.materials.on('collect', () => content.audio.notifications.materialCollect())
  content.materials.on('recycle', () => content.audio.notifications.materialRecycle())
})
