app.canvas.stars = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    count = 1000,
    firmament = 10000,
    main = app.canvas,
    stars = []

  main.on('resize', () => {
    const height = main.height(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    clear()
  })

  function calculateHorizon() {
    const horizon = main.toScreenFromRelative({
      x: firmament,
      y: 0,
      z: -engine.position.getVector().z,
    })

    return horizon.y
  }

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function drawStars() {
    const height = main.height(),
        hfov = main.hfov(),
        radius = 0.5,
        vfov = main.vfov(),
        width = main.width()

    const conjugate = engine.position.getQuaternion().conjugate(),
      horizon = calculateHorizon(),
      rotation = 2 * Math.PI * content.time.year()

    const horizonCutoff = horizon - (Math.max(1, (width / 1920) * 8))

    for (const star of stars) {
      const relative = engine.utility.vector3d.create({
        x: firmament,
      }).rotateEuler({
        pitch: rotation,
      }).rotateEuler({
        pitch: star.theta,
        yaw: star.delta,
      }).rotateQuaternion(conjugate)

      const hangle = Math.atan2(relative.y, relative.x)

      if (Math.abs(hangle) > hfov / 2) {
        continue
      }

      const vangle = Math.atan2(relative.z, relative.x)

      if (Math.abs(vangle) > vfov / 2) {
        continue
      }

      let alpha = star.alpha

      const screen = engine.utility.vector2d.create({
        x: (width / 2) - (width * hangle / hfov),
        y: (height / 2) - (height * vangle / vfov),
      })

      if (screen.y > horizon) {
        continue
      }

      if (screen.y > horizon - horizonCutoff) {
        alpha *= engine.utility.scale(screen.y, horizon - horizonCutoff, horizon, 1, 0)
      }

      context.fillStyle = `rgba(255, 255, 255, ${alpha})`
      context.fillRect(screen.x - radius, screen.y - radius, radius * 2, radius * 2)
    }
  }

  function generate() {
    const srand = engine.utility.srand('stars')

    for (let i = 0; i < count; i += 1) {
      const delta = srand(-1, 1)

      stars.push({
        alpha: srand(1/2, 1),
        delta: Math.PI / 2 * engine.utility.sign(delta) * (delta ** 2),
        phase: 2 * Math.PI * srand(),
        theta: 2 * Math.PI * srand(),
      })
    }
  }

  engine.state.on('import', () => {
    generate()
  })

  engine.state.on('reset', () => {
    stars.length = 0
  })

  return {
    draw: function () {
      clear()
      drawStars()

      // Draw to main canvas, assume identical dimensions
      main.context().drawImage(canvas, 0, 0)

      return this
    },
  }
})()
