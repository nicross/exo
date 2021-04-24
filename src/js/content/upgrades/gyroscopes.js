content.upgrades.gyroscopes = content.upgrades.invent({
  name: 'Gyroscopes',
  describe: function (level = this.level) {
    if (!level) {
      return 'Normal slope acceleration'
    }

    return `+${(engine.utility.scale(this.levels[level].bonus, 1.5, 0.5, 0.5, 2)) * 100}% slope acceleration`
  },
  levels: [
    {
      bonus: 1.5,
      cost: {
        'common/hydrogen': 5,
        'common/lithium': 5,
        'metal/iron': 1,
        'metal/silver': 1,
      },
      name: 'Gyroscopes +1',
    },
    {
      bonus: 1,
      cost: {
        'common/hydrogen': 10,
        'common/lithium': 10,
        'metal/iron': 5,
        'metal/silver': 5,
        'exotic/neodymium': 1,
        'xenotech/artifact': 1,
      },
      name: 'Gyroscopes +2',
    },
    {
      bonus: 0.5,
      cost: {
        'common/hydrogen': 20,
        'common/lithium': 20,
        'metal/iron': 10,
        'metal/silver': 10,
        'exotic/neodymium': 5,
        'xenotech/artifact': 2,
      },
      name: 'Gyroscopes +3',
    },
  ],
})
