content.audio.collision = (() => {
  const bus = content.audio.createBus()

  bus.gain.value = engine.utility.fromDb(-12)

  function play() {

  }

  return {
    trigger: function () {
      play()
      return this
    },
  }
})()

engine.ready(() => {
  content.movement.on('collision', () => content.audio.collision.trigger())
})
