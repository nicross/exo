app.updates.register('1.1.1', () => {
  updateSettings()

  function updateSettings() {
    const settings = app.storage.getSettings()

    if (!settings) {
      return
    }

    if (settings.drawDistance) {
      settings.drawDistance = engine.utility.lerp(25, 50, settings.drawDistance)
      settings.drawDistance = Math.round(settings.drawDistance / 5) * 5
      settings.drawDistance = engine.utility.scale(settings.drawDistance, 25, 100, 0, 1)
    }

    app.storage.setSettings(settings)
  }
})
