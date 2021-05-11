app.canvas.materials = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas,
    phases = new Map()

  let materialRadius

  main.on('resize', () => {
    const height = main.height(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    materialRadius = (width / 1920) * 64

    clear()
  })

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function draw() {
    const drawDistance = Math.max(app.settings.computed.drawDistance, engine.streamer.getRadius()),
      hfov = main.hfov(),
      position = engine.position.getVector(),
      propRadius = content.prop.material.base.radius,
      time = content.time.value(),
      vfov = main.vfov()

    const materials = content.materials.nearby.retrieveAll({
      depth: drawDistance * 2,
      height: drawDistance * 2,
      width: drawDistance * 2,
      x: position.x - drawDistance,
      y: position.y - drawDistance,
      z: position.z - drawDistance,
    })

    for (const material of materials) {
      // Offset coordinates by a slight vertical bouncing effect
      const phase = getPhase(material.token)

      material.z -= propRadius / 2
      material.z += 1
      material.z += Math.sin(time + phase) / 4

      const distance = Math.max(0, engine.utility.distance(position, material) - propRadius)

      // Optimization: only draw within draw distance
      if (distance > drawDistance) {
        continue
      }

      // Optimization: only draw if visible horizontally, with some leeway
      let relative = main.toRelative(material)
      const hangle = Math.atan2(relative.y, relative.x)

      if (Math.abs(hangle) > hfov / 1.75) {
        continue
      }

      // Optimization: only draw if visible vertically, with some leeway
      const vangle = Math.atan2(relative.z, relative.x)

      if (Math.abs(vangle) > vfov / 1.75) {
        continue
      }

      // Convert to screen space and draw
      const screen = main.toScreenFromRelative(relative)
      const distanceRatio = engine.utility.scale(distance, 0, drawDistance, 1, 0)

      const alpha = smooth(distanceRatio ** 0.5),
        radius = engine.utility.lerpExp(1, materialRadius, distanceRatio, 8)

      context.fillStyle = `rgba(0, 0, 0, ${alpha})`
      context.lineWidth = radius / 16
      context.shadowBlur = radius / 4
      context.shadowColor = '#FFFFFF'
      context.strokeStyle = '#FFFFFF'

      context.beginPath()
      context.arc(screen.x, screen.y, radius, 0, Math.PI * 2)
      context.fill()
      context.stroke()
    }
  }

  function getPhase(token) {
    if (phases.has(token)) {
      return phases.get(token)
    }

    const phase = engine.utility.choose([0, 1/3, 2/3], Math.random())
    phases.set(token, phase)

    return phase
  }

  function smooth(value) {
    // generalized logistic function
    return 1 / (1 + (Math.E ** (-10 * (value - 0.5))))
  }

  return {
    draw: function () {
      clear()
      draw()

      // Draw to main canvas, assume identical dimensions
      main.context().drawImage(canvas, 0, 0)

      return this
    },
    reset: function () {
      phases.clear()
      return this
    },
  }
})()

engine.state.on('reset', () => app.canvas.materials.reset())
