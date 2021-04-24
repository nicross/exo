content.upgrades.actuators = content.upgrades.invent({
  name: 'Actuators',
  describe: function (level = this.level) {
    if (!level) {
      return 'Normal velocity'
    }

    return `+${this.levels[level].bonus * 100}% velocity`
  },
  levels: [
    {
      bonus: 1/8,
      cost: {
        'common/hydrogen': 5,
        'common/lithium': 5,
        'metal/copper': 1,
        'metal/iron': 1,
      },
      name: 'Actuators +1',
    },
    {
      bonus: 1/4,
      cost: {
        'common/hydrogen': 10,
        'common/lithium': 10,
        'metal/copper': 5,
        'metal/iron': 5,
        'exotic/neodymium': 1,
        'xenotech/artifact': 1,
      },
      name: 'Actuators +2',
    },
    {
      bonus: 1/2,
      cost: {
        'common/hydrogen': 20,
        'common/lithium': 20,
        'metal/copper': 10,
        'metal/iron': 10,
        'exotic/neodymium': 5,
        'xenotech/artifact': 2,
      },
      name: 'Actuators +3',
    },
  ],
})
