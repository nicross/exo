content.prop.material.base = engine.prop.base.invent({
  radius: 4,
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

    if (engine.utility.round(this.distance, 3) <= 0) {
      if (content.inventory.canCollect(this.type.key)) {
        this.collect()
      } else if (this.collectErrorTimer > delta) {
        this.collectErrorTimer -= delta
      } else {
        content.inventory.onFull(this)
        this.collectErrorTimer = 10
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
    engine.audio.ramp.exponential(this.output.gain, engine.const.zeroGain, 1/4)
    this.chunk.collect(this)
    return this
  },
  resolveFrequency: function (offset = 0) {
    return content.utility.frequency.fromMidi(this.resolveNote() + offset)
  },
  resolveNote: function () {
    const index = this.index / (this.chunk.count + 1)
    return engine.utility.choose([67, 70, 72, 75], index)
  },
})
