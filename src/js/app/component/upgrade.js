'use strict'

app.component.upgrade = {}

app.component.upgrade.create = function (...args) {
  return Object.create(this.prototype).construct(...args)
}

app.component.upgrade.prototype = {
  attach: function (element) {
    element.appendChild(this.rootElement)
    return this
  },
  construct: function (upgrade = {}) {
    engine.utility.pubsub.decorate(this)
    this.upgrade = upgrade

    this.rootElement = document.createElement('button')
    this.rootElement.className = 'c-upgrade'
    this.rootElement.type = 'button'

    this.rootElement.addEventListener('click', (e) => this.onClick(e))

    const title = document.createElement('p')
    title.classList.add('c-upgrade--name')
    title.innerHTML = upgrade.name
    this.rootElement.appendChild(title)

    if (upgrade.canUpgrade()) {
      const available = document.createElement('p')
      available.classList.add('c-upgrade--available')
      available.innerHTML = 'Upgrade Available'
      this.rootElement.append(progress)
    }

    const progress = document.createElement('p')
    progress.classList.add('c-upgrade--progress')
    progress.innerHTML = `${upgrade.level} <abbr aria-label="of">/</abbr> ${upgrade.levels.length - 1}`
    this.rootElement.append(progress)

    return this
  },
  onClick: function (e) {
    e.preventDefault()
    e.stopPropagation()

    this.emit('click')

    return this
  },
}
