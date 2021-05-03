app.storage = (() => {
  const isSupported = 'localStorage' in window

  const storage = isSupported
    ? window.localStorage
    : {
        data: {},
        getItem: (key) => this.data[key],
        removeItem: (key) => delete this.data[key],
        setItem: (key) => this.data[key] = value,
      }

  const gameKey = 'exo_game',
    settingsKey = 'exo_settings',
    statsKey = 'exo_stats',
    versionKey = 'exo_version'

  function filterGame(game = {}) {
    // Prevent garbage in / garbage out with game saves
    if (game.position && game.position.quaternion) {
      game.position.quaternion = filterGameQuaternion(game.position.quaternion)
    }

    return game
  }

  function filterGameQuaternion(quaternion = {}) {
    // Prevent bad quaternions
    quaternion = engine.utility.quaternion.create(quaternion)

    const distance = quaternion.distance()

    quaternion = distance && isFinite(distance)
      ? quaternion.scale(1 / distance)
      : engine.utility.quaternion.identity()

    return {...quaternion}
  }

  function get(key) {
    try {
      const value = storage.getItem(key)
      return JSON.parse(value)
    } catch (e) {}
  }

  function remove(key) {
    return storage.removeItem(key)
  }

  function set(key, value) {
    try {
      storage.setItem(key, JSON.stringify(value))
    } catch (e) {}
  }

  return {
    clearGame: function () {
      remove(gameKey)
      return this
    },
    getGame: () => filterGame(get(gameKey) || {}),
    getSettings: () => get(settingsKey) || {},
    getStats: () => get(statsKey) || {},
    getVersion: () => get(versionKey) || '0.0.0',
    hasGame: () => Boolean(get(gameKey)),
    setGame: function (value) {
      set(gameKey, filterGame(value))
      return this
    },
    setStats: function (value) {
      set(statsKey, value)
      return this
    },
    setSettings: function (value) {
      set(settingsKey, value)
      return this
    },
    setVersion: function (value) {
      set(versionKey, value)
      return this
    },
  }
})()
