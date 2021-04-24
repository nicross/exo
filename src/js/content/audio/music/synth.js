content.audio.music.synth = {}

content.audio.music.synth.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

content.audio.music.synth.prototype = {
  construct: function ({
    destination,
  } = {}) {
    // TODO: build binaural
    // TODO: build synth

    return this
  },
  destroy: function () {
    const now = engine.audio.time(),
      release = 1/4

    //engine.audio.ramp.linear(this.synth.gain, engine.const.zeroGain, release)
    //this.synth.stop(now + release)

    // TODO: destroy binaural

    return this
  },
  update: function () {
    // TODO: update binaural
    // TODO: update synths

    return this
  },
}
