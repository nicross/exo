content.prop.material.common = content.prop.material.base.invent({
  name: 'material/common',
  createSynth: function () {
    const protons = engine.utility.scale(this.type.protons, 1, 36, 0, 1)

    this.synth = engine.audio.synth.createPwm({
      frequency: this.rootFrequency,
      gain: 2/3,
      width: 0.5,
    }).filtered({
      frequency: this.rootFrequency,
    }).connect(this.output)

    const lfoGain = engine.audio.synth.createLfo({
      depth: 1/3,
      frequency: engine.utility.lerp(4, 8, protons),
    }).connect(this.synth.param.gain)

    const lfoPwm = engine.audio.synth.createLfo({
      depth: 0.2,
      frequency: engine.utility.lerp(1/8, 1/4, protons),
    }).connect(this.synth.param.width)

    this.synth.chainStop(lfoGain).chainStop(lfoPwm)
  },
})
