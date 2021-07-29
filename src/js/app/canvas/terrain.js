app.canvas.terrain = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas

  let nodeRadius

  context.fillStyle = '#000000'

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
      hfov = main.hfov(),
      position = engine.position.getVector(),
      vfov = main.vfov()

    position.x = Math.round(position.x)
    position.y = Math.round(position.y)

    // TODO: Optimize as cone ahead
    for (let x = -drawDistance; x < drawDistance; x += 1) {
      for (let y = -drawDistance; y < drawDistance; y += 1) {
        const grid = position.add({x, y})

        // Optimization: only draw within draw distance
        if (engine.utility.distance(position, grid) > drawDistance) {
          continue
        }

        // Optimization: only draw if visible horizontally
        let relative = main.toRelative(grid)
        const hangle = Math.atan2(relative.y, relative.x)

        if (Math.abs(hangle) > hfov / 2) {
          continue
        }

        // Calculate true position
        grid.z = content.terrain.value(grid.x, grid.y)
        relative = main.toRelative(grid)

        // Optimization: only draw if visible vertically
        const vangle = Math.atan2(relative.z, relative.x)

        if (Math.abs(vangle) > vfov / 2) {
          continue
        }

        // Calculate true distance
        const distance = relative.distance()

        // Optimization: again, only draw within draw distance
        if (distance > drawDistance) {
          continue
        }

        // Convert to screen space and draw
        const screen = main.toScreenFromRelative(relative)
        const distanceRatio = engine.utility.scale(distance, 0, drawDistance, 1, 0)

        const alpha = distanceRatio,
          radius = engine.utility.lerpExp(0.5, nodeRadius, distanceRatio, 4)

        context.globalAlpha = alpha
        context.fillRect(screen.x - radius, screen.y - radius, radius * 2, radius * 2)
      }
    }
  }

  function shouldDraw() {
    // TODO: Optimize by returning false when terrain isn't visible
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
