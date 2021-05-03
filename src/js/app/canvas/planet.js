app.canvas.planet= (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    horizonDistance = 10000,
    main = app.canvas

  let radius

  main.on('resize', () => {
    const height = main.height(),
      hfov = main.hfov(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    radius = 1 * width / hfov / Math.PI

    clear()
  })

  function calculatePosition() {
    const relative = engine.utility.vector3d.create({
      x: horizonDistance,
    }).rotateEuler({
      pitch: -Math.PI / 6,
    }).rotateQuaternion(
      engine.position.getQuaternion().conjugate()
    )

    return main.toScreenFromRelative(relative)
  }

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function draw() {
    const position = calculatePosition()

    if (!engine.utility.between(position.y, -radius, main.height() + radius)) {
      return
    }

    const value = Math.round(content.environment.atmosphere() * 255)

    context.fillStyle = `rgb(${value}, ${value}, ${value})`
    context.lineWidth = 2
    context.shadowBlur = radius
    context.shadowColor = '#FFFFFF'
    context.strokeStyle = '#FFFFFF'

    context.beginPath()
    context.arc(position.x, position.y, radius, 0, Math.PI * 2)
    context.fill()
    context.stroke()
  }

  return {
    draw: function () {
      clear()
      draw()

      // Draw to main canvas, assume identical dimensions
      main.context().drawImage(canvas, 0, 0)

      return this
    },
  }
})()
