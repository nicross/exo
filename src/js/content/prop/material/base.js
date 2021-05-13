content.prop.material.base = engine.prop.base.invent({
  collectRadius: 4,
  radius: 0,
  reverb: false,
  onConstruct: function (options = {}, ...args) {
    const context = engine.audio.context()

    this.chunk = options.chunk
    this.index = options.index
    this.rootFrequency = this.resolveFrequency()
    this.type = options.type

    this.createSynth()
    this.synth.chainAssign('compensator', context.createGain())
  },
  onDestroy: function () {
    this.synth.stop()
  },
  onUpdate: function ({delta, paused}) {
    if (this.isCollected || paused) {
      return this
    }

    this.updateCompensator()

    if (this.collectErrorTimer > 0) {
      this.collectErrorTimer -= delta
    }

    const canCollect = this.canCollect()

    if (engine.utility.round(this.distance, 3) <= this.collectRadius) {
      if (canCollect) {
        this.collect()
      } else {
        this.error()
      }
    } else if (canCollect) {
      this.handleAttractors()
    } else {
      this.halt()
    }
  },
  canCollect: function () {
    return content.inventory.canCollect(this.type.key) || content.upgrades.recycler.isActive()
  },
  collect: function () {
    this.fadeOutDuration = 1/32
    this.isCollected = true

    this.chunk.collect(this)

    return this
  },
  createSynth: function () {
    this.synth = engine.audio.synth.createSimple({
      carrierFrequency: this.rootFrequency,
      gain: 1,
    }).connect(this.output)
  },
  error: function () {
    if (this.collectErrorTimer > 0) {
      return this
    }

    content.inventory.onFull(this)
    this.collectErrorTimer = 10

    return this
  },
  handleAttractors: function () {
    const attraction = content.upgrades.attractors.getBonus()

    if (!attraction) {
      return this
    }

    const distance = engine.utility.lerp(0, 25, attraction)

    if (this.distance > distance) {
      return this.halt()
    }

    const velocity = engine.position.getVector()
      .subtract(this.vector())
      .normalize()
      .scale(distance / this.distance)

    this.velocity = content.utility.accelerate.vector(this.velocity, velocity, distance)

    return this
  },
  halt: function () {
    if (this.velocity.isZero()) {
      return this
    }

    const velocity = engine.utility.vector3d.create()
    this.velocity = content.utility.accelerate.vector(this.velocity, velocity, 5)

    return this
  },
  maxFrequency: content.utility.frequency.fromMidi(72),
  minFrequency: content.utility.frequency.fromMidi(60),
  resolveFrequency: function () {
    const index = this.index % 3

    const chord = content.audio.music.chord.getIndex(index)

    let frequency = chord.tDelta < 0.5
      ? (chord.zDelta < 0.5 ? chord.t0.z0 : chord.t0.z1)
      : (chord.zDelta < 0.5 ? chord.t1.z0 : chord.t1.z1)

    while (frequency > this.maxFrequency) {
      frequency /= 2
    }

    while (frequency < this.minFrequency) {
      frequency *= 2
    }

    return frequency
  },
  updateCompensator: function () {
    const gain = engine.utility.fromDb(engine.utility.lerpExp(0, 7.5, engine.utility.clamp(this.distance / 25, 0, 1), 2))
    engine.audio.ramp.set(this.synth.compensator.gain, 1 + gain)
    return this
  },
})
