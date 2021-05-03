app.canvas.atmosphere = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas

  canvas.height = 1
  canvas.width = 1

  return {
    draw: function () {
      context.fillStyle = '#000000'
      context.fillRect(0, 0, canvas.width, canvas.height)

      context.fillStyle = `rgba(255, 255, 255, ${content.environment.atmosphere()})`
      context.fillRect(0, 0, canvas.width, canvas.height)

      // Draw to main canvas
      main.context().drawImage(canvas, 0, 0, main.width(), main.height())

      return this
    },
  }
})()
