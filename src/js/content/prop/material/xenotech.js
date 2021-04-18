content.prop.material.xenotech = content.prop.material.base.invent({
  name: 'material/xenotech',
  createSynth: function () {
    this.synth = engine.audio.synth.createAm({
      carrierDetune: -600,
      carrierFrequency: this.rootFrequency,
      carrierGain: 1/2,
      carrierType: 'square',
      gain: 1,
      modDepth: 1/2,
      modFrequency: 24,
      modType: 'square',
    }).filtered({
      frequency: this.rootFrequency / 2,
      Q: 5,
      type: 'bandpass',
    }).connect(this.output)

    const lfo = engine.audio.synth.createLfo({
      depth: 600,
      frequency: 1,
      type: 'triangle',
    }).connect(this.synth.param.detune)

    this.synth.chainStop(lfo)

    const lfoModFrequency = engine.audio.synth.createLfo({
      depth: 1,
      frequency: 1/5,
    })

    const scale = engine.audio.circuit.scale({
      from: lfoModFrequency.output,
      fromMax: 1,
      fromMin: -1,
      to: this.synth.param.mod.frequency,
      toMax: 24,
      toMin: 12,
    })

    this.synth.chainStop(scale)
  },
})
