content.stress = (() => {
  const acceleration = 1/60,
    deceleration = 1/120,
    maxBpm = 180,
    minBpm = 60,
    stableLevel = 0.5

  let level = 0

  function getBpm() {
    return engine.utility.lerp(minBpm, maxBpm, level)
  }

  return {
    bpm: () => getBpm(),
    export: () => ({
      level,
    }),
    import: function (data = {}) {
      level = data.level || 0
      return this
    },
    level: () => level,
    reset: function () {
      level = 0
      return this
    },
    update: function () {
      const isBipedal = content.movement.isBipedal(),
        isFast = content.movement.isFast(),
        thrust = content.movement.normalThrust().distance()

      if (isBipedal && thrust > engine.const.zero) {
        if (isFast) {
          level = content.utility.accelerate.value(level, 1, acceleration * thrust)
        } else if (level > stableLevel) {
          level = content.utility.accelerate.value(level, stableLevel, deceleration / thrust)
        } else {
          level = content.utility.accelerate.value(level, stableLevel, acceleration * thrust)
        }
      } else {
        level = content.utility.accelerate.value(level, 0, deceleration)
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.stress.update()
})

engine.state.on('export', (data = {}) => data.stress = content.stress.export())
engine.state.on('import', ({stress}) => content.stress.import(stress))
engine.state.on('reset', () => content.stress.reset())
