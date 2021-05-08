content.audio.scan = (() => {
  const bus = content.audio.createBypass(),
    context = engine.audio.context(),
    rootFrequency = content.utility.frequency.fromMidi(60)

  bus.gain.value = engine.utility.fromDb(-9)

  const lowpass = context.createBiquadFilter(),
    notch = context.createBiquadFilter()

  lowpass.frequency.value = 10000

  notch.frequency.value = rootFrequency
  notch.Q.value = 5
  notch.type = 'notch'

  lowpass.connect(notch)
  notch.connect(bus)

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
    const duration = 2,
      panner = context.createStereoPanner()

    panner.pan.value = pan
    panner.connect(lowpass)

    const synth = engine.audio.synth.createSimple({
      frequency: rootFrequency,
      when,
    }).connect(panner)

    const count = group.length

    for (let i = 0; i < count; i += 1) {
      const gain = (1 - (i / (count - 1))) ** 4,
        next = when + ((i + 1) * (duration / count))

      const {
        detune,
        frequency,
      } = toNote(group[i])

      synth.param.detune.linearRampToValueAtTime(detune, next)
      synth.param.frequency.exponentialRampToValueAtTime(frequency, next)
      synth.param.gain.linearRampToValueAtTime(gain / 2.5, next)
    }

    synth.stop(when + duration)
  }

  function renderNearbyMaterial(relative) {
    const distance = engine.utility.clamp(relative.subtract({z: relative.z}).distance() / 100, 0, 1)

    const color = engine.utility.lerpExp(1, 8, Math.max(0, Math.cos(Math.atan2(relative.y, relative.x))), 0.5),
      delay = distance * 2,
      duration = 1/12,
      gain = engine.utility.fromDb(engine.utility.lerp(-3, -12, distance)),
      when = engine.audio.time() + delay

    const {
      detune,
      frequency,
    } = toNote(relative.z)

    const synth = engine.audio.synth.createSimple({
      detune,
      frequency,
      type: 'square',
      when,
    }).filtered({
      detune,
      frequency: frequency * color,
    })

    const binaural = engine.audio.binaural.create({
      ...relative.normalize(),
    }).from(synth).to(bus)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, when)
    synth.param.gain.exponentialRampToValueAtTime(gain, when + 1/32)
    synth.param.gain.linearRampToValueAtTime(engine.const.zeroGain, when + duration)
    synth.stop(when + duration)

    setTimeout(() => binaural.destroy(), (delay + duration) * 1000)
  }

  function renderNearbyMaterials() {
    const position = engine.position.getVector(),
      quaternion = engine.position.getQuaternion().conjugate(),
      renderDistance = 100

    const materials = content.materials.nearby.retrieveAll({
      depth: renderDistance * 2,
      height: renderDistance * 2,
      width: renderDistance * 2,
      x: position.x - renderDistance,
      y: position.y - renderDistance,
      z: position.z - renderDistance,
    })

    for (const material of materials) {
      const relative = engine.utility.vector3d.create(material)
        .subtract(position)
        .rotateQuaternion(quaternion)

      renderNearbyMaterial(relative)
    }
  }

  function toNote(z = 0) {
    const scale = 100

    const note = engine.utility.scale(z, 0, scale/12, 0, 12)

    return {
      detune: (note - Math.round(note)) * scale,
      frequency: content.utility.frequency.fromMidi(engine.utility.clamp(60 + Math.round(note), 0, 127)),
    }
  }

  return {
    render: function (scan) {
      render(scan)
      renderNearbyMaterials()
      return this
    },
  }
})()

engine.ready(() => {
  content.scan.on('complete', (...args) => content.audio.scan.render(...args))
})
