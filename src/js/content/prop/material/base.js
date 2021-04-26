content.prop.material.base = engine.prop.base.invent({
  radius: 4,
  reverb: false,
  onConstruct: function (options = {}, ...args) {
    this.chunk = options.chunk
    this.index = options.index
    this.rootFrequency = this.resolveFrequency()
    this.type = options.type

    this.createSynth()
  },
  onDestroy: function () {
    this.synth.stop()
  },
  onUpdate: function ({delta, paused}) {
    if (this.isCollected || paused) {
      return this
    }

    if (this.collectErrorTimer > 0) {
      this.collectErrorTimer -= delta
    }

    if (engine.utility.round(this.distance, 3) <= 0) {
      if (content.inventory.canCollect(this.type.key) || content.upgrades.recycler.isActive()) {
        this.collect()
      } else {
        this.error()
      }
    }
  },
  createSynth: function () {
    this.synth = engine.audio.synth.createSimple({
      carrierFrequency: this.rootFrequency,
      gain: 1,
    }).connect(this.output)
  },
  collect: function () {
    this.isCollected = true
    engine.audio.ramp.exponential(this.output.gain, engine.const.zeroGain, 1/8)
    this.chunk.collect(this)
    return this
  },
  error: function () {
    if (this.collectErrorTimer > 0) {
      return this
    }

    content.inventory.onFull(this)
    this.collectErrorTimer = 10

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
})
