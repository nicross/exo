content.audio.compass = (() => {
  const bus = content.audio.createBus(),
    frequency = engine.utility.midiToFrequency(72),
    tau = Math.PI * 2

  const roses = [
    {angle: Math.PI * 0, strength: 2/3, east: true},
    {angle: Math.PI * 0.125, strength: 0},
    {angle: Math.PI * 0.25, strength: 1/3},
    {angle: Math.PI * 0.375, strength: 0},
    {angle: Math.PI * 0.5, strength: 1, north: true},
    {angle: Math.PI * 0.625, strength: 0},
    {angle: Math.PI * 0.75, strength: 1/3},
    {angle: Math.PI * 0.875, strength: 0},
    {angle: Math.PI * 1, strength: 2/3, west: true},
    {angle: Math.PI * 1.125, strength: 0},
    {angle: Math.PI * 1.25, strength: 1/3},
    {angle: Math.PI * 1.375, strength: 0},
    {angle: Math.PI * 1.5, strength: 1, south: true},
    {angle: Math.PI * 1.625, strength: 0},
    {angle: Math.PI * 1.75, strength: 1/3},
    {angle: Math.PI * 1.875, strength: 0},
  ]

  let previousAngle = 0

  bus.gain.value = engine.utility.fromDb(-10.5)

  function getRose(angle) {
    const max = Math.max(angle, previousAngle),
      min = Math.min(angle, previousAngle)

    for (const rose of roses) {
      if (engine.utility.between(rose.angle, min, max)) {
        return rose
      }

      if (!rose.angle && (Math.abs(angle - previousAngle) > Math.PI) && engine.utility.between(tau, previousAngle, angle + tau)) {
        return rose
      }
    }

    return false
  }

  function triggerRose(angle) {
    const rose = getRose(angle)

    if (rose === false) {
      return
    }

    const binaural = engine.audio.binaural.create({
      x: Math.cos(rose.angle - Math.PI/2),
      y: Math.sin(rose.angle - Math.PI/2),
      z: 0,
    })

    const synth = engine.audio.synth.createSimple({
      frequency,
      type: 'triangle',
    }).filtered({
      frequency: engine.utility.choose([1, 2, 3, 4], rose.strength) * frequency,
    })

    const duration = engine.utility.choose([1/16, 1/12, 1/8, 1/6], rose.strength),
      now = engine.audio.time()

    binaural.from(synth).to(bus)

    synth.param.gain.setValueAtTime(engine.const.zeroGain, now)
    synth.param.gain.exponentialRampToValueAtTime(1, now + 1/64)
    synth.param.gain.exponentialRampToValueAtTime(engine.const.zeroGain, now + duration)

    if (rose.strength) {
      const detune = rose.north
        ? 1200
        : (rose.south ? -500 : 700)

      synth.param.detune.setValueAtTime(detune, now)
      synth.param.detune.linearRampToValueAtTime(engine.const.zero, now + duration)
    }

    synth.stop(now + duration)
  }

  return {
    import: function () {
      previousAngle = engine.utility.normalizeAngle(engine.position.getEuler().yaw)
      return this
    },
    update: function () {
      const angle = engine.utility.normalizeAngle(engine.position.getEuler().yaw)

      if (angle == previousAngle) {
        return this
      }

      triggerRose(angle)
      previousAngle = angle

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.compass.update()
})

engine.state.on('import', () => content.audio.compass.import())
