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
  describe: () => '',
  describeNext: function () {
    if (!this.getNextLevel()) {
      return 'Fully upgraded'
    }

    return this.describe(this.level + 1)
  },
  getBonus: function () {
    const current = this.getLevel()
    return current ? current.bonus : 0
  },
  getCost: function () {
    const current = this.getLevel()
    return current ? current.cost : {}
  },
  getLevel: function () {
    return this.levels[this.level]
  },
  getNextCost: function () {
    const next = this.getNextLevel()
    return next ? next.cost : {}
  },
  getNextLevel: function () {
    return this.levels[this.level + 1]
  },
  getProgress: function () {
    return this.level / (this.levels.length - 1)
  },
}
