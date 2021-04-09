app.canvas.surface = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas

  let nodeRadius

  main.on('resize', () => {
    const height = main.height(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    nodeRadius = Math.max(1, (width / 1920) * 8)

    clear()
  })

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function drawNodes() {
    const drawDistance = app.settings.computed.drawDistance,
      height = main.height(),
      hfov = main.hfov(),
      position = engine.position.getVector(),
      vfov = main.vfov(),
      width = main.width(),
      zOffset = 2 // TODO: change player height based on vehicle mode

    position.x = Math.round(position.x)
    position.y = Math.round(position.y)

    // TODO: Optimize as cone ahead
    for (let x = -drawDistance; x < drawDistance; x += 1) {
      for (let y = -drawDistance; y < drawDistance; y += 1) {
        const grid = position.add({x, y}),
          relative = main.toRelative(grid)

        const hangle = Math.atan2(relative.y, relative.x)

        if (Math.abs(hangle) > hfov / 2) {
          continue
        }

        if (relative.distance() > drawDistance) {
          continue
        }

        relative.z = content.surface.value(grid.x, grid.y) - (position.z + zOffset)

        const vangle = Math.atan2(relative.z, relative.x)

        if (Math.abs(vangle) > vfov / 2) {
          continue
        }

        const distance = relative.distance()

        if (distance > drawDistance) {
          continue
        }

        const screen = engine.utility.vector2d.create({
          x: (width / 2) - (width * hangle / hfov),
          y: (height / 2) - (height * vangle / vfov),
        })

        const distanceRatio = engine.utility.scale(distance, 0, drawDistance, 1, 0)

        const alpha = distanceRatio,
          radius = engine.utility.lerpExp(0.5, nodeRadius, distanceRatio, 4)

        context.fillStyle = `rgba(0, 0, 0, ${alpha})`
        context.fillRect(screen.x - radius, screen.y - radius, radius * 2, radius * 2)
      }
    }
  }

  function shouldDraw() {
    // TODO: Optimize by returning false when surface isn't visible
    return true
  }

  return {
    draw: function () {
      if (!shouldDraw()) {
        return this
      }

      clear()
      drawNodes()

      // Draw to main canvas, assume identical dimensions
      main.context().drawImage(canvas, 0, 0)

      return this
    },
  }
})()
