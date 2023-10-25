app.updates.register('1.2.0', () => {
  updateSettings()

  function updateSettings() {
    const settings = app.storage.getSettings()

    if (!settings) {
      return
    }

    if (settings.drawDistance) {
      settings.drawDistance = 1
    }

    app.storage.setSettings(settings)
  }
})
