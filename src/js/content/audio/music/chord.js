content.audio.music.chord = (() => {
  const chordField = engine.utility.perlin1d.create('music', 'chord'),
    chordCache = new Map(),
    chordScale = 15,
    harmonicsField = engine.utility.perlin3d.create('music', 'harmonics'),
    harmonicsTimeScale = 1,
    harmonicsZScale = 1,
    inversionField = engine.utility.perlin1d.create('music', 'inversion'),
    inversionScale = 5,
    timeScale = 12

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
    // Determine chords and harmonics
    const t = content.time.relative() / timeScale,
      t0 = Math.floor(t),
      t1 = t0 + 1,
      z = scaleZ(engine.position.getVector().z),
      z0 = Math.floor(z),
      z1 = z0 + 1

    const t0Chord = getChord(t0),
      t1Chord = getChord(t1)

    const t0z0 = t0Chord[index] * getHarmonic(t0, z0, index),
      t0z1 = t0Chord[index] * getHarmonic(t0, z1, index),
      t1z0 = t1Chord[index] * getHarmonic(t1, z0, index),
      t1z1 = t1Chord[index] * getHarmonic(t1, z1, index)

    // Swap values on even/odd so synths line up and don't hiccup on abrupt changes
    const swapT = Math.abs(t0 % 2) == 1,
      swapZ = Math.abs(z0 % 2) == 1

    const values = [
      t0z0,
      t0z1,
      t1z0,
      t1z1,
    ]

    let tDelta = Math.sin((t - t0) * Math.PI/2),
      zDelta = Math.sin((z - z0) * Math.PI/2)

    if (swapT) {
      [values[0], values[1], values[2], values[3]] = [values[2], values[3], values[0], values[1]]
      tDelta = 1 - tDelta
    }

    if (swapZ) {
      [values[0], values[1], values[2], values[3]] = [values[1], values[0], values[3], values[2]]
      zDelta = 1 - zDelta
    }

    // Return swapped values
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
        z0: values[0],
        z1: values[1],
      },
      t1: {
        z0: values[2],
        z1: values[3],
      },
      t0Mix: 1 - tDelta,
      t1Mix: tDelta,
      z0Mix: 1 - zDelta,
      z1Mix: zDelta,
    }
  }

  function generateChord(time) {
    const inversion = getInversion(time),
      octave = 4,
      value = chordField.value(time / chordScale)

    return engine.utility.choose(chords, value).map((note, index) => {
      note += (octave * 12) + (inversion[index] * 12)
      return content.utility.frequency.fromMidi(note)
    })
  }

  function generateRoot(time) {
    const value = chordField.value(time / chordScale)
    const chord = engine.utility.choose(chords, value)
    return content.utility.frequency.fromMidi(chord[0] + (4 * 12))
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

  function scaleZ(z) {
    // A000124, but with N-sized steps
    const step = 10

    let i = 0,
      max = step,
      min = 0,
      range = max - min

    while (z > max) {
      i += 1
      range += step
      min = max
      max += range
    }

    return engine.utility.scale(z, min, max, i, i + 1)
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
    getRoots: function () {
      const t = content.time.relative() / timeScale,
        t0 = Math.floor(t),
        t1 = t0 + 1

      return {
        tDelta: Math.sin((t - t0) * Math.PI/2),
        t0: generateRoot(t0),
        t1: generateRoot(t1),
      }
    },
    getSub: function () {
      const roots = this.getRoots()

      let frequency = engine.utility.lerp(roots.t0, roots.t1, roots.tDelta)

      while (frequency > 80) {
        frequency /= 2
      }

      while (frequency < 40) {
        frequency *= 2
      }

      return frequency
    },
    reset: function () {
      chordCache.clear()
      return this
    },
  }
})()

engine.state.on('reset', () => content.audio.music.chord.reset())
