app.canvas.grain = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas,
    pattern = document.createElement('canvas'),
    patternContext = pattern.getContext('2d'),
    period = 1/24,
    scale = 1,
    size = 128

  const patternData = patternContext.createImageData(size, size),
    patternDataLength = 4 * (size ** 2)

  let timer = 0

  context.scale(scale, scale)
  pattern.height = size
  pattern.width = size

  main.on('resize', () => {
    canvas.height = main.height()
    canvas.width = main.width()
  })

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function update() {
    for (let i = 0; i < patternDataLength; i += 4) {
      patternData.data[i] = 255
      patternData.data[i + 1] = 255
      patternData.data[i + 2] = 255
      patternData.data[i + 3] = engine.utility.random.integer(0, 64)
    }

    clear()
    patternContext.putImageData(patternData, 0, 0)

    context.fillStyle = context.createPattern(pattern, 'repeat')
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  return {
    draw: function () {
      timer += engine.loop.delta()

      if (timer >= period) {
        timer = 0
        update()
      }

      // Draw to main canvas, assume identical dimensions
      main.context().drawImage(canvas, 0, 0)

      return this
    },
  }
})()
