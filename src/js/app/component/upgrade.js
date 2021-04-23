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

    this.rootElement = document.createElement('li')
    this.rootElement.className = 'a-synthesis--upgrade'

    const button = document.createElement('button')
    button.className = 'c-upgrade'
    button.type = 'button'
    button.addEventListener('click', (e) => this.onClick(e))
    this.rootElement.append(button)

    const title = document.createElement('p')
    title.classList.add('c-upgrade--name')
    title.innerHTML = upgrade.name
    button.appendChild(title)

    if (upgrade.canUpgrade()) {
      const available = document.createElement('p')
      available.classList.add('c-upgrade--available')
      available.innerHTML = '<span>Upgrade Available</span>'
      button.append(available)
    }

    const progress = document.createElement('p')
    progress.classList.add('c-upgrade--progress')
    progress.innerHTML = `${upgrade.level} <abbr aria-label="of">/</abbr> ${upgrade.levels.length - 1}`
    button.append(progress)

    return this
  },
  destroy: function () {
    this.rootElement.remove()
    this.off()
    return this
  },
  onClick: function (e) {
    e.preventDefault()
    e.stopPropagation()

    this.emit('click')

    return this
  },
}
