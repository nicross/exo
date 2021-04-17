app.state.screen = engine.utility.machine.create({
  state: 'none',
  transition: {
    audio: {
      back: function () {
        this.change('settings')
      },
    },
    controls: {
      back: function () {
        this.change('settings')
      },
    },
    crafting: {
      back: function () {
        this.change('gameMenu')
      },
      inventory: function () {
        this.change('inventory')
      },
      upgrades: function () {
        this.change('upgrades')
      },
    },
    game: {
      pause: function () {
        this.change('gameMenu')
      },
    },
    gameMenu: {
      crafting: function () {
        this.change('crafting')
      },
      mainMenu: function () {
        this.change('mainMenu')
      },
      misc: function () {
        this.change('misc')
      },
      quit: () => {
        ElectronApi.quit()
      },
      resume: function () {
        this.change('game')
      },
      status: function () {
        this.change('status')
      },
    },
    graphics: {
      back: function () {
        this.change('settings')
      },
    },
    inventory: {
      back: function () {
        this.change('crafting')
      },
    },
    mainMenu: {
      continue: function () {
        this.change('game')
      },
      misc: function () {
        this.change('misc')
      },
      newGame: function () {
        this.change('game')
      },
      quit: () => {
        ElectronApi.quit()
      },
    },
    misc: {
      back: function () {
        if (app.state.game.is('none')) {
          this.change('mainMenu')
        } else {
          this.change('gameMenu')
        }
      },
      settings: function () {
        this.change('settings')
      },
      stats: function () {
        this.change('stats')
      },
    },
    none: {
      activate: function () {
        this.change('splash')
      },
    },
    settings: {
      audio: function () {
        this.change('audio')
      },
      back: function () {
        this.change('misc')
      },
      controls: function () {
        this.change('controls')
      },
      graphics: function () {
        this.change('graphics')
      },
    },
    stats: {
      back: function () {
        this.change('misc')
      },
    },
    status: {
      back: function () {
        this.change('gameMenu')
      },
    },
    splash: {
      start: function () {
        this.change('mainMenu')
      },
    },
    upgrades: {
      back: function () {
        this.change('crafting')
      },
    },
  },
})

engine.ready(() => {
  [...document.querySelectorAll('.a-app--screen')].forEach((element) => {
    element.setAttribute('aria-hidden', 'true')
    element.setAttribute('role', 'persentation')
  })

  app.state.screen.dispatch('activate')
})

app.state.screen.on('exit', (e) => {
  const active = document.querySelector('.a-app--screen-active')
  const inactive = document.querySelector('.a-app--screen-inactive')

  if (active) {
    active.classList.remove('a-app--screen-active')
    active.classList.add('a-app--screen-inactive')
    active.setAttribute('aria-hidden', 'true')
    active.setAttribute('role', 'persentation')
  }

  if (inactive) {
    inactive.classList.remove('a-app--screen-inactive')
    inactive.hidden = true
  }
})

app.state.screen.on('enter', (e) => {
  const selectors = {
    audio: '.a-app--audio',
    controls: '.a-app--controls',
    crafting: '.a-app--crafting',
    game: '.a-app--game',
    gameMenu: '.a-app--gameMenu',
    graphics: '.a-app--graphics',
    inventory: '.a-app--inventory',
    mainMenu: '.a-app--mainMenu',
    misc: '.a-app--misc',
    settings: '.a-app--settings',
    splash: '.a-app--splash',
    stats: '.a-app--stats',
    status: '.a-app--status',
    upgrades: '.a-app--upgrades',
  }

  const selector = selectors[e.currentState]
  const element = document.querySelector(selector)

  element.removeAttribute('aria-hidden')
  element.removeAttribute('role')
  element.removeAttribute('hidden')

  window.requestAnimationFrame(() => {
    element.classList.add('a-app--screen-active')
  })
})
