app.updates.register('1.0.1', () => {
  updateGame()

  function fixCorruptQuaternion(quaternion) {
    quaternion = engine.utility.quaternion.create(quaternion)

    const distance = quaternion.distance()

    if (!distance || !isFinite(distance)) {
      quaternion = engine.utility.quaternion.identity()
    }

    return {...quaternion}
  }

  function updateGame() {
    const game = app.storage.getGame()

    if (!game) {
      return
    }

    if (game.position && game.position.quaternion) {
      game.position.quaternion = fixCorruptQuaternion(game.position.quaternion)
    }

    app.storage.setGame(game)
  }
})
