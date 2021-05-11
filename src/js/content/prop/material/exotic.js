content.prop.material.exotic = content.prop.material.base.invent({
  name: 'material/exotic',
  createSynth: function () {
    const protons = engine.utility.scale(this.type.protons, 1, 36, 0, 1)

    this.synth = engine.audio.synth.createMod({
      amodDepth: 1/3,
      amodFrequency: engine.utility.lerp(8, 16, protons),
      amodType: 'square',
      carrierGain: 2/3,
      carrierFrequency: this.rootFrequency,
      carrierType: 'triangle',
      fmodDepth: this.rootFrequency,
      fmodFrequency: this.rootFrequency * 2,
      fmodType: 'triangle',
      gain: 2/3,
    }).filtered({
      frequency: 0,
    }).connect(this.output)

    const lfo = engine.audio.synth.createLfo({
      depth: 1/3,
      frequency: engine.utility.lerp(1/2, 1/8, protons),
    })

    this.synth.chainStop(lfo)

    const lerp = engine.audio.circuit.scale({
      from: lfo,
      fromMax: 1/3,
      fromMin: -1/3,
      to: this.synth.filter.frequency,
      toMax: 2 * this.rootFrequency,
      toMin: 0.5 * this.rootFrequency,
    })

    this.synth.chainStop(lerp)

    const invert = engine.audio.circuit.invert({
      from: lfo,
      to: this.synth.param.gain,
    })

    this.synth.chainStop(invert)
  },
})
