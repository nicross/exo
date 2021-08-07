app.canvas.terrain = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas,
    maxDrawDistance = 100

  /**
   * The gridCache allows quick lookup for the vertices to draw given a heading and horizontal field of view.
   * Vertices are converted to polar coordinates and indexed by their angle within a bitree.
   * For simplicity, three complete rotations of the grid are stored so values always exist for every possible input.
   * Coordinates for vertices are expressed relative to the camera.
   */
  const gridCache = engine.utility.bitree.create({
    dimension: 'angle',
    maxItems: maxDrawDistance,
    minValue: -engine.const.tau * 1.5,
    range: engine.const.tau * 3,
  })

  // Fill gridCache to maximum draw distance
  for (let x = -maxDrawDistance; x < maxDrawDistance; x += 1) {
    for (let y = -maxDrawDistance; y < maxDrawDistance; y += 1) {
      const distance = Math.sqrt((x * x) + (y * y))

      if (distance > maxDrawDistance) {
        continue
      }

      const angle = Math.atan2(y, x)

      gridCache.insert({
        angle: angle - engine.const.tau,
        distance,
        x,
        y,
      })

      gridCache.insert({
        angle,
        distance,
        x,
        y,
      })

      gridCache.insert({
        angle: angle + engine.const.tau,
        distance,
        x,
        y,
      })
    }
  }

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
      heading = engine.utility.vector3d.unitX().rotateQuaternion(engine.position.getQuaternion()),
      headingConjugate = engine.utility.vector3d.unitX().rotateQuaternion(engine.position.getQuaternion().conjugate()),
      hfov = main.hfov(),
      hfovLeeway = hfov / 8,
      position = main.cameraVector(),
      positionGrid = position.clone(),
      rotateYaw = Math.atan2(headingConjugate.y, headingConjugate.x),
      vertices = gridCache.retrieve(Math.atan2(heading.y, heading.x) - ((hfov + hfovLeeway) / 2), hfov + hfovLeeway)

    positionGrid.x = Math.round(positionGrid.x)
    positionGrid.y = Math.round(positionGrid.y)

    for (const vertex of vertices) {
      // Convert to relative space
      const global = positionGrid.add(vertex)

      const relative = engine.utility.vector3d.create(
        engine.utility.vector2d.create({
          x: global.x - position.x,
          y: global.y - position.y,
        }).rotate(rotateYaw)
      )

      // Calculate true position
      global.z = content.terrain.value(global.x, global.y)
      relative.z = global.z - position.z

      // Calculate true distance
      const distance = relative.distance()

      // Optimization: only draw within draw distance
      if (distance > drawDistance) {
        continue
      }

      // Convert to screen space and draw
      const screen = main.toScreenFromRelative(relative)

      const alpha = engine.utility.scale(distance, 0, drawDistance, 1, 0),
        radiusRatio = engine.utility.scale(distance, 0, maxDrawDistance, 1, 0),
        radius = engine.utility.lerpExp(0.5, nodeRadius, radiusRatio, 8)

      context.globalAlpha = alpha
      context.fillRect(screen.x - radius, screen.y - radius, radius * 2, radius * 2)
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
