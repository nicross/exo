app.updates.register('0.14.0', () => {
  updateGame()
  updateStats()

  function updateGame() {
    const game = app.storage.getGame()

    if (!game) {
      return
    }

    if (game.inventory && game.inventory['xenotech/artifact']) {
      game.inventory['xenotech/tesseract'] = game.inventory['xenotech/artifact']
    }

    app.storage.setGame(game)
  }

  function updateStats() {
    const stats = app.storage.getStats()

    if (!stats) {
      return
    }

    if (stats.materials && stats.materials.type && stats.materials.type['xenotech/artifact']) {
      stats.materials.type['xenotech/tesseract'] = stats.materials.type['xenotech/artifact']
    }

    app.storage.setStats(stats)
  }
})
