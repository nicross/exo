app.access = (() => {
  const hotkeys = {
    coordinates: () => {
      const position = engine.position.getVector()
      return app.utility.format.coordinates(position)
    },
    heading: () => {
      const {yaw} = engine.position.getEuler()
      return app.utility.format.angle(yaw)
    },
    height: () => {
      const {z} = engine.position.getVector()
      const terrain = content.terrain.current()
      const height = Math.max(z - terrain, 0)
      return app.utility.format.number(height)
    },
    velocity: () => {
      const velocity = engine.position.getVelocity()
      return app.utility.format.velocity(velocity)
    },
    x: () => {
      const {x} = engine.position.getVector()

      if (!Math.round(x)) {
        return 0
      }

      return x > 0
        ? `${app.utility.format.number(x)} east`
        : `${app.utility.format.number(-x)} west`
    },
    y: () => {
      const {y} = engine.position.getVector()

      if (!Math.round(z)) {
        return 0
      }

      return y >= 0
        ? `${app.utility.format.number(y)} north`
        : `${app.utility.format.number(-y)} south`
    },
    z: () => {
      const {z} = engine.position.getVector()
      return app.utility.format.number(z)
    },
  }

  let root

  engine.ready(() => {
    root = document.querySelector('.a-app--access')
  })

  return {
    handle: function (hotkey) {
      const value = hotkey in hotkeys
        ? hotkeys[hotkey]()
        : undefined

      if (value) {
        this.set(value)
      }

      return this
    },
    set: function (value = '') {
      root.innerHTML = ''
      root.innerHTML = value
      return this
    },
  }
})()
