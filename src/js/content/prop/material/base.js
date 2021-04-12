content.prop.material.base = engine.prop.base.invent({
  onConstruct: function (options = {}, ...args) {
    this.synth = engine.audio.synth.createFm().filtered().connect(this.output)
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
    this.isCollected = true
    engine.audio.ramp.exponential(this.output.gain, engine.const.zeroGain, 1/4)
    content.
    return this
  },
  configureSynth: () => {},
  pulse: () => {},
})
