content.prop.material.base = engine.prop.base.invent({
  radius: 4,
  onConstruct: function (options = {}, ...args) {
    this.chunk = options.chunk
    this.index = options.index
    this.type = options.type

    this.synth = engine.audio.synth.createFm().filtered().connect(this.output)
    this.synth.param.gain.value = 1
    this.configureSynth(options, ...args)
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
  collect: function () {
    this.isCollected = true
    engine.audio.ramp.exponential(this.output.gain, engine.const.zeroGain, 1/4)
    this.chunk.collect(this)
    return this
  },
  configureSynth: () => {},
})
