content.upgrades.pneumatics = content.upgrades.invent({
  name: 'Pneumatics',
  describe: function (level = this.level) {
    if (!level) {
      return 'Normal jump height'
    }

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
        'xenotech/tesseract': 1,
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
        'xenotech/tesseract': 2,
      },
      name: 'Pneumatics +3',
    },
    {
      bonus: 1,
      cost: {
        'common/carbon': 25,
        'common/hydrogen': 25,
        'metal/aluminum': 20,
        'metal/iron': 20,
        'exotic/thorium': 10,
        'xenotech/tesseract': 3,
      },
      name: 'Pneumatics +4',
    },
  ],
})
