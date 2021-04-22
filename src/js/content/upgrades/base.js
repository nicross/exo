content.upgrades.base = {
  level: 0,
  levels: [],
  canUpgrade: function () {
    const next = this.getNextLevel()

    if (!next) {
      return false
    }

    return content.inventory.canConsume(next.cost)
  },
  getBonus: function () {
    const current = this.getCurrentLevel()
    return current ? current.bonus : 0
  },
  getCost: function () {
    const current = this.getCurrentLevel()
    return current ? current.cost : {}
  },
  getLevel: function () {
    return this.levels[this.level]
  },
  getNextLevel: function () {
    return this.levels[this.level + 1]
  },
  getProgress: function () {
    return this.level / (this.levels.length - 1)
  },
}
