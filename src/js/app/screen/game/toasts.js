app.screen.game.toasts = (() => {
  const duration = 3,
    queue = []

  let root,
    timeout = 0

  engine.ready(() => {
    root = document.querySelector('.a-game--toasts')

    engine.state.on('reset', onEngineStateReset)

    app.state.screen.on('enter-game', onEnterGame)
    app.state.screen.on('exit-game', onExitGame)
  })

  function enqueue(value) {
    queue.push(
      app.utility.dom.toElement(
        `<aside class="a-game--toast">${value}</aside>`
      )
    )
  }

  function onEnterGame() {
    engine.loop.on('frame', onFrame)
    root.setAttribute('aria-live', 'polite')
  }

  function onExitGame() {
    engine.loop.off('frame', onFrame)
    root.removeAttribute('aria-live')
  }

  function onFrame({delta, paused}) {
    if (paused) {
      return
    }

    if (timeout > 0) {
      timeout -= delta
      return
    }

    for (const child of root.children) {
      if (!child.hasAttribute('aria-hidden')) {
        child.setAttribute('aria-hidden', 'true')
        child.setAttribute('role', 'presentation')
        child.onanimationend = () => child.remove()
      }
    }

    if (!queue.length) {
      return
    }

    root.appendChild(queue.shift())
    timeout = duration
  }

  function onEngineStateReset() {
    queue.length = 0
    root.innerHTML = ''
  }

  return {
    toast: function (value) {
      enqueue(value)
      return this
    },
  }
})()

// XXX: Event subscriptions inside engine.ready() to escape race conditions with content modules
engine.ready(() => {
  // Material collect
  content.materials.on('collect', (prop) => {
    app.screen.game.toasts.toast(`<strong>${prop.type.name}</strong> collected`)
  })

  // Material recycle
  content.materials.on('recycle', (prop) => {
    app.screen.game.toasts.toast(`<strong>${prop.type.name}</strong> recycled`)
  })

  // Material storage full
  content.inventory.on('full', (prop) => {
    app.screen.game.toasts.toast(`<strong>${prop.type.name}</strong> storage full`)
  })

  // Upgrade available
  content.upgrades.on('available', (upgrade) => {
    app.screen.game.toasts.toast(`<strong>${upgrade.name}</strong> upgrade available`)
  })
})
