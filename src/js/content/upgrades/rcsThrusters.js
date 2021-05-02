content.upgrades.rcsThrusters = content.upgrades.invent({
  name: 'RCS Thrusters',
  describe: function (level = this.level) {
    if (!level) {
      return 'Air turning offline'
    }

    if (level == 1) {
      return 'Air turning online'
    }

    return `+${Math.round(this.levels[level].bonus / (Math.PI / 2) * 100)}% air turning`
  },
  levels: [
    {
      bonus: Math.PI / 8,
      cost: {
        'common/oxygen': 5,
        'common/silicon': 5,
        'metal/copper': 1,
        'metal/gold': 1,
      },
      name: 'RCS Thrusters',
    },
    {
      bonus: Math.PI / 4,
      cost: {
        'common/oxygen': 10,
        'common/silicon': 10,
        'metal/copper': 5,
        'metal/gold': 5,
        'exotic/uranium': 1,
        'xenotech/tesseract': 1,
      },
      name: 'RCS Thrusters +1',
    },
    {
      bonus: Math.PI / 2.675,
      cost: {
        'common/oxygen': 20,
        'common/silicon': 20,
        'metal/copper': 10,
        'metal/gold': 10,
        'exotic/uranium': 5,
        'xenotech/tesseract': 2,
      },
      name: 'RCS Thrusters +2',
    },
    {
      bonus: Math.PI / 2,
      cost: {
        'common/oxygen': 25,
        'common/silicon': 25,
        'metal/copper': 20,
        'metal/gold': 20,
        'exotic/uranium': 10,
        'xenotech/tesseract': 3,
      },
      name: 'RCS Thrusters +3',
    },
  ],
})
