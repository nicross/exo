content.upgrades.vectors = content.upgrades.invent({
  name: 'Vectors',
  describe: function (level = this.level) {
    if (!level) {
      return 'Air strafing offline'
    }

    if (level == 1) {
      return 'Air strafing online'
    }

    return `+${Math.round(this.levels[level].bonus / (Math.PI / 2) * 100)}% air strafing`
  },
  levels: [
    {
      bonus: Math.PI / 8,
      cost: {
        'common/carbon': 5,
        'common/silicon': 5,
        'metal/copper': 1,
        'metal/silver': 1,
      },
      name: 'Vectors',
    },
    {
      bonus: Math.PI / 4,
      cost: {
        'common/carbon': 10,
        'common/silicon': 10,
        'metal/copper': 5,
        'metal/silver': 5,
        'exotic/thorium': 1,
        'xenotech/artifact': 1,
      },
      name: 'Vectors +1',
    },
    {
      bonus: Math.PI / 2,
      cost: {
        'common/carbon': 20,
        'common/silicon': 20,
        'metal/copper': 10,
        'metal/silver': 10,
        'exotic/thorium': 5,
        'xenotech/artifact': 2,
      },
      name: 'Vectors +2',
    },
  ],
})
