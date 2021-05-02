content.upgrades.brakes = content.upgrades.invent({
  name: 'Brakes',
  describe: function (level = this.level) {
    if (!level) {
      return 'Normal deceleration'
    }

    return `+${this.levels[level].bonus * 100}% deceleration`
  },
  levels: [
    {
      bonus: 1/4,
      cost: {
        'common/nitrogen': 5,
        'common/lithium': 5,
        'metal/copper': 1,
        'metal/gold': 1,
      },
      name: 'Brakes +1',
    },
    {
      bonus: 1/2,
      cost: {
        'common/nitrogen': 10,
        'common/lithium': 10,
        'metal/copper': 5,
        'metal/gold': 5,
        'exotic/neodymium': 1,
        'xenotech/tesseract': 1,
      },
      name: 'Brakes +2',
    },
    {
      bonus: 1,
      cost: {
        'common/nitrogen': 20,
        'common/lithium': 20,
        'metal/copper': 10,
        'metal/gold': 10,
        'exotic/neodymium': 5,
        'xenotech/tesseract': 2,
      },
      name: 'Brakes +3',
    },
    {
      bonus: 1.5,
      cost: {
        'common/nitrogen': 20,
        'common/lithium': 20,
        'metal/copper': 10,
        'metal/gold': 10,
        'exotic/neodymium': 5,
        'xenotech/tesseract': 2,
      },
      name: 'Brakes +4',
    },
  ],
})
