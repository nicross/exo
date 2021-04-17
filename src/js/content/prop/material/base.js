content.prop.material.base = engine.prop.base.invent({
  radius: 2,
  onConstruct: function (options = {}, ...args) {
    this.chunk = options.chunk
    this.synth = engine.audio.synth.createFm().filtered().connect(this.output)
    this.synth.param.gain.value = 1
    this.configureSynth(options, ...args)
  },
  onDestroy: function () {
    this.synth.stop()
  },
  onUpdate: function () {
    if (this.isCollected) {
      return this
    }

    if (engine.utility.round(this.distance, 3) <= 0) {
      this.collect()
    }
  },
  collect: function () {
    // TODO: inventory check
    this.isCollected = true
    engine.audio.ramp.exponential(this.output.gain, engine.const.zeroGain, 1/4)
    this.chunk.collect(this)
    return this
  },
  configureSynth: () => {},
  pulse: () => {},
})
