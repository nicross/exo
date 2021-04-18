content.prop.material.common = content.prop.material.base.invent({
  name: 'material/common',
  createSynth: function () {
    const protons = engine.utility.scale(this.type.protons, 1, 36, 0, 1)

    this.synth = engine.audio.synth.createFm({
      carrierFrequency: this.rootFrequency / 2,
      carrierType: 'sine',
      gain: 2/3,
      modDepth: this.rootFrequency,
      modFrequency: this.rootFrequency * 2,
      modType: 'triangle',
    }).chainAssign('phaser', engine.audio.effect.createPhaser({
      dry: 0,
      feedback: 1/3,
      frequency: engine.utility.lerp(1, 8, protons),
      wet: 1,
    })).filtered({
      frequency: this.rootFrequency,
    }).connect(this.output)

    const lfoGain = engine.audio.synth.createLfo({
      depth: 1/3,
      frequency: engine.utility.lerp(1/8, 1/4, protons),
    }).connect(this.synth.param.gain)

    this.synth.chainStop(lfoGain)
  },
})
