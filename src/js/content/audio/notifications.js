content.audio.notifications = (() => {
  const bus = content.audio.createBus()

  bus.gain.value = engine.utility.fromDb(-9)

  function materialCollect() {
    // TODO: pleasant sound
  }

  function materialFull() {
    // TODO: error sound
  }

  return {
    materialCollect: function () {
      materialCollect()
      return this
    },
    materialFull: function () {
      materialFull()
      return this
    },
  }
})()

engine.ready(() => {
  content.inventory.on('full', () => app.audio.notifications.materialFull())
  content.materials.on('collect', () => app.audio.notifications.materialCollect())
})
