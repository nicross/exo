content.audio.music.chord = (() => {
  const chordField = engine.utility.perlin1d.create('music', 'chord'),
    chordCache = new Map(),
    chordScale = 15,
    harmonicsField = engine.utility.perlin1d.create('music', 'harmonics'),
    harmonicsTimeScale = 1,
    harmonicsZScale = 10,
    inversionField = engine.utility.perlin1d.create('music', 'inversion'),
    inversionScale = 5,
    timeScale = 12,
    zScale = 50

  const chords = [
    [-9, -5, -2],
    [-5, -2, 2],
    [-4, 0, 3],
    [-2, 2, 5],
    [0, 3, 7],
    [3, 7, 10],
    [7, 10, 14],
    [8, 12, 15],
    [10, 14, 17],
  ]

  const harmonics = [
    1,
    2,
    3,
    4,
    6,
    8,
  ]

  const inversions = [
    [1, 1, 0],
    [1, 0, 0],
    [0, 0, 0],
    [0, 0, -1],
    [0, -1, -1],
  ]

  content.utility.ephemeralNoise
    .manage(chordField)
    .manage(harmonicsField)
    .manage(inversionField)

  function generate(index = 0) {
    const t = content.time.value() / timeScale,
      t0 = Math.floor(t),
      t1 = t0 + 1,
      tDelta = Math.sin((t - t0) * Math.PI/2),
      z = engine.position.getVector().z / zScale,
      z0 = Math.floor(z),
      z1 = z0 + 1,
      zDelta = Math.sin((z - z0) * Math.PI/2)

    const t0Chord = getChord(t0),
      t1Chord = getChord(t1)

    return {
      debug: {
        t0,
        t1,
        z0,
        z1,
        t0Chord,
        t1Chord,
      },
      t0: {
        z0: t0Chord[index] * getHarmonic(t0, z0, index),
        z1: t0Chord[index] * getHarmonic(t0, z1, index),
      },
      t1: {
        z0: t1Chord[index] * getHarmonic(t1, z0, index),
        z1: t1Chord[index] * getHarmonic(t1, z1, index),
      },
      t0Mix: 1 - tDelta,
      t1Mix: tDelta,
      z0Mix: 1 - zDelta,
      z1Mix: zDelta,
    }
  }

  function getChord(time) {
    if (chordCache.has(time)) {
      return chordCache.get(time)
    }

    const chord = generateChord(time)
    chordCache.set(time, chord)
    return chord
  }

  function getHarmonic(time, z, index) {
    index += 0.5
    time /= harmonicsTimeScale
    z /= harmonicsZScale

    let value = harmonicsField.value(time, z, index)
    value = engine.utility.wrapAlternate(value * 4, 0, 1)

    return engine.utility.choose(harmonics, value)
  }

  function getInversion(time = 0) {
    const value = inversionField.value(time / inversionScale)
    return engine.utility.choose(inversions, value)
  }

  function generateChord(time) {
    const inversion = getInversion(time),
      octave = 4,
      value = chordField.value(time / chordScale)

    return engine.utility.choose(chords, value).map((note, index) => {
      note += (4 * 12) + (inversion[index] * 12)
      return content.utility.frequency.fromMidi(note)
    })
  }

  return {
    getAll: function () {
      return [
        this.getIndex(0),
        this.getIndex(1),
        this.getIndex(2),
      ]
    },
    getIndex: (index = 0) => generate(index),
    reset: function () {
      chordCache.clear()
      return this
    },
  }
})()

engine.state.on('reset', () => content.audio.music.chord.reset())
