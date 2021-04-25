content.prop.material.metal = content.prop.material.base.invent({
  name: 'material/metal',
  createSynth: function () {
    const protons = engine.utility.scale(this.type.protons, 1, 108, 0, 1)

    this.synth = engine.audio.synth.createAm({
      carrierFrequency: this.rootFrequency,
      carrierGain: 7/8,
      gain: 2/3,
      modDepth: 1/4,
      modFrequency: 60,
      modType: 'square',
    }).filtered({
      frequency: this.rootFrequency * 2,
    }).connect(this.output)

    const lfoDepth = engine.audio.synth.createLfo({
      depth: 1/16,
      frequency: engine.utility.lerp(1, 8, protons),
    }).connect(this.synth.param.mod.depth)

    this.synth.chainStop(lfoDepth)

    const invert = engine.audio.circuit.invert({
      from: lfoDepth,
      to: this.synth.param.carrierGain,
    })

    this.synth.chainStop(invert)

    const lfoGain = engine.audio.synth.createLfo({
      depth: 1/3,
      frequency: engine.utility.lerp(1/8, 1, protons),
    }).connect(this.synth.param.gain)

    this.synth.chainStop(lfoGain)
  },
})
