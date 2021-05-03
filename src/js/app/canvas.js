app.canvas = (() => {
  const pubsub = engine.utility.pubsub.create()

  let aspect,
    cameraQuaternion,
    cameraVector,
    context,
    height,
    hfov,
    root,
    vfov,
    width

  engine.ready(() => {
    root = document.querySelector('.a-game--canvas')
    context = root.getContext('2d')

    window.addEventListener('resize', onResize)

    app.state.screen.on('enter-game', onEnterGame)
    app.state.screen.on('exit-game', onExitGame)
  })

  function cacheValues() {
    cameraQuaternion = engine.position.getQuaternion().conjugate()

    cameraVector = engine.position.getVector().add({
      z: content.movement.model().height,
    })

    // TODO: mouse vertical look?
  }

  function clear() {
    context.clearRect(0, 0, width, height)
  }

  function draw() {
    app.canvas.atmosphere.draw()
    app.canvas.planet.draw()
    app.canvas.terrain.draw()
    app.canvas.grain.draw()
  }

  function onEnterGame() {
    onResize()
    engine.loop.on('frame', onFrame)
  }

  function onExitGame() {
    engine.loop.off('frame', onFrame)
  }

  function onFrame({paused}) {
    if (paused || !app.settings.computed.graphicsOn || document.visibilityState == 'hidden') {
      return
    }

    cacheValues()

    clear()
    draw()
  }

  function onResize() {
    recalculate()
    pubsub.emit('resize')
  }

  function recalculate() {
    height = root.height = root.clientHeight
    width = root.width = root.clientWidth
    aspect = width / height
    hfov = app.settings.computed.graphicsFov
    vfov = hfov / aspect
  }

  return engine.utility.pubsub.decorate({
    aspect: () => aspect,
    cameraQuaternion: () => cameraQuaternion,
    cameraVector: () => cameraVector,
    context: () => context,
    height: () => height,
    hfov: () => hfov,
    toRelative: (vector) => {
      return vector
        .subtract(cameraVector)
        .rotateQuaternion(cameraQuaternion)
    },
    toScreenFromGlobal: function (vector) {
      return this.toScreenFromRelative(
        this.toRelative(vector)
      )
    },
    toScreenFromRelative: (relative) => {
      const hangle = Math.atan2(relative.y, relative.x),
        vangle = Math.atan2(relative.z, relative.x)

      return engine.utility.vector2d.create({
        x: (width / 2) - (width * hangle / hfov),
        y: (height / 2) - (height * vangle / vfov),
      })
    },
    vfov: () => vfov,
    width: () => width,
  }, pubsub)
})()
