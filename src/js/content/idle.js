content.idle = (() => {
  const duration = 10,
    pubsub = engine.utility.pubsub.create()

  let state = false,
    timer = 0

  function isZero(mixed) {
    return engine.utility.round(mixed.x + mixed.y + mixed.z, 10) == 0
  }

  return engine.utility.pubsub.decorate({
    is: () => state,
    progress: () => engine.utility.clamp(timer / duration),
    reset: function () {
      state = false
      timer = 0
      return this
    },
    update: function () {
      const delta = engine.loop.delta(),
        newState = isZero(engine.position.getAngularVelocity()) && isZero(engine.position.getVelocity())

      if (state != newState) {
        timer = newState
          ? Math.min(timer + delta, duration)
          : 0

        if (!newState || timer >= duration) {
          state = newState
          pubsub.emit('change', state)
        }
      }

      return this
    },
  }, pubsub)
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.idle.update()
})

engine.state.on('reset', () => content.idle.reset())
