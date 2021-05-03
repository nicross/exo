content.upgrades.attractors = content.upgrades.invent({
  name: 'Attractors',
  describe: function (level = this.level) {
    if (!level) {
      return 'Material attraction offline'
    }

    if (level == 1) {
      return 'Material attraction online'
    }

    return `+${this.levels[level].bonus * 100}% material attraction`
  },
  levels: [
    {
      bonus: 1/8,
      cost: {
        'common/carbon': 1,
        'common/hydrogen': 1,
        'common/lithium': 1,
        'common/nitrogen': 1,
        'common/oxygen': 1,
        'common/silicon': 1,
      },
      name: 'Attractors',
    },
    {
      bonus: 1/4,
      cost: {
        'common/carbon': 5,
        'common/hydrogen': 5,
        'common/lithium': 5,
        'common/nitrogen': 5,
        'common/oxygen': 5,
        'common/silicon': 5,
        'metal/aluminum': 1,
        'metal/copper': 1,
        'metal/gold': 1,
        'metal/iron': 1,
        'metal/silver': 1,
      },
      name: 'Attractors +1',
    },
    {
      bonus: 1/2,
      cost: {
        'common/carbon': 10,
        'common/hydrogen': 10,
        'common/lithium': 10,
        'common/nitrogen': 10,
        'common/oxygen': 10,
        'common/silicon': 10,
        'metal/aluminum': 5,
        'metal/copper': 5,
        'metal/gold': 5,
        'metal/iron': 5,
        'metal/silver': 5,
        'exotic/neodymium': 1,
        'exotic/thorium': 1,
        'exotic/uranium': 1,
      },
      name: 'Attractors +2',
    },
    {
      bonus: 1,
      cost: {
        'common/carbon': 20,
        'common/hydrogen': 20,
        'common/lithium': 20,
        'common/nitrogen': 20,
        'common/oxygen': 20,
        'common/silicon': 20,
        'metal/aluminum': 10,
        'metal/copper': 10,
        'metal/gold': 10,
        'metal/iron': 10,
        'metal/silver': 10,
        'exotic/neodymium': 5,
        'exotic/thorium': 5,
        'exotic/uranium': 5,
        'xenotech/tesseract': 1,
      },
      name: 'Attractors +3',
    },
  ],
})
