content.audio.music.synth = {}

content.audio.music.synth.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

content.audio.music.synth.prototype = {
  construct: function ({
    destination,
    index = 0,
  } = {}) {
    const context = engine.audio.context()

    this.index = index
    this.mixer = context.createGain()

    this.synth = [
      engine.audio.synth.createSimple().connect(this.mixer),
      engine.audio.synth.createSimple().connect(this.mixer),
      engine.audio.synth.createSimple().connect(this.mixer),
      engine.audio.synth.createSimple().connect(this.mixer),
    ]

    this.lfo = engine.audio.synth.createLfo().connect(this.mixer.gain)

    this.binaural = engine.audio.binaural.create()
      .from(this.mixer)
      .to(destination)

    return this
  },
  destroy: function () {
    const now = engine.audio.time(),
      release = 1/4

    for (const synth of this.synth) {
      synth.stop(now + release)
    }

    engine.audio.ramp.linear(this.mixer.gain, engine.const.zeroGain, release)
    this.lfo.stop(now + release)

    setTimeout(() => this.binaural.destroy(), release * 1000)

    return this
  },
  update: function () {
    const amodDepth = content.audio.music.amod.depth(this.index),
      amodFrequency = content.audio.music.amod.depth(this.index),
      chord = content.audio.music.chord.getIndex(this.index)

    this.binaural.update(
      engine.utility.vector3d.unitX().rotateEuler({
        yaw: this.index * engine.const.tau / 3,
      }).rotateQuaternion(engine.position.getQuaternion())
    )

    engine.audio.ramp.set(this.mixer.gain, 1 - amodDepth)
    engine.audio.ramp.set(this.lfo.param.depth, amodDepth)
    engine.audio.ramp.set(this.lfo.param.frequency, amodFrequency)

    // t0 z0
    engine.audio.ramp.set(this.synth[0].param.frequency, chord.t0.z0)
    engine.audio.ramp.set(this.synth[0].param.gain, chord.t0Mix * chord.z0Mix / 2)

    // t0 z1
    engine.audio.ramp.set(this.synth[1].param.frequency, chord.t0.z1)
    engine.audio.ramp.set(this.synth[1].param.gain, chord.t0Mix * chord.z1Mix / 2)

    // t1 z0
    engine.audio.ramp.set(this.synth[2].param.frequency, chord.t1.z0)
    engine.audio.ramp.set(this.synth[2].param.gain, chord.t1Mix * chord.z0Mix / 2)

    // t1 z1
    engine.audio.ramp.set(this.synth[3].param.frequency, chord.t1.z1)
    engine.audio.ramp.set(this.synth[3].param.gain, chord.t1Mix * chord.z1Mix / 2)

    return this
  },
}
