content.upgrades.pneumatics = content.upgrades.invent({
  name: 'Pneumatics',
  describe: function (level = this.level) {
    return `+${this.levels[level].bonus * 100}% jump height`
  },
  levels: [
    {
      bonus: 1/8,
      cost: {
        'common/carbon': 5,
        'common/hydrogen': 5,
        'metal/aluminum': 1,
        'metal/iron': 1,
      },
      name: 'Pneumatics +1',
    },
    {
      bonus: 1/4,
      cost: {
        'common/carbon': 10,
        'common/hydrogen': 10,
        'metal/aluminum': 5,
        'metal/iron': 5,
        'exotic/thorium': 1,
        'xenotech/artifact': 1,
      },
      name: 'Pneumatics +2',
    },
    {
      bonus: 1/2,
      cost: {
        'common/carbon': 20,
        'common/hydrogen': 20,
        'metal/aluminum': 10,
        'metal/iron': 10,
        'exotic/thorium': 5,
        'xenotech/artifact': 2,
      },
      name: 'Pneumatics +3',
    },
  ],
})
