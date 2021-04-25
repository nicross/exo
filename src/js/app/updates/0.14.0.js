app.updates.register('0.14.0', () => {
  updateGame()
  updateSettings()

  function updateGame() {
    const game = app.storage.getGame()

    if (!game) {
      return
    }

    app.storage.setGame(game)
  }
})
