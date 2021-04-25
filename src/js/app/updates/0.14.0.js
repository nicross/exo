app.updates.register('0.14.0', () => {
  updateGame()
  updateStats()

  function updateGame() {
    const game = app.storage.getGame()

    if (!game) {
      return
    }

    // Rename artifact to tesseract
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

    // Rename artifact to tesseract
    if (stats.materials && stats.materials.type && stats.materials.type['xenotech/artifact']) {
      stats.materials.type['xenotech/tesseract'] = stats.materials.type['xenotech/artifact']
    }

    // Rework materials stat structure
    if (stats.materials) {
      stats.materials.collected = {
        count: stats.materials.count || 0,
        type: stats.materials.type || {},
      }

      delete stats.materials.count
      delete stats.materials.type
    }

    app.storage.setStats(stats)
  }
})
