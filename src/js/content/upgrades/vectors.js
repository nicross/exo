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
        'common/oxygen': 5,
        'metal/aluminum': 1,
        'metal/silver': 1,
      },
      name: 'Vectors',
    },
    {
      bonus: Math.PI / 4,
      cost: {
        'common/carbon': 10,
        'common/oxygen': 10,
        'metal/aluminum': 5,
        'metal/silver': 5,
        'exotic/uranium': 1,
        'xenotech/tesseract': 1,
      },
      name: 'Vectors +1',
    },
    {
      bonus: Math.PI / 2,
      cost: {
        'common/carbon': 20,
        'common/oxygen': 20,
        'metal/aluminum': 10,
        'metal/silver': 10,
        'exotic/uranium': 5,
        'xenotech/tesseract': 2,
      },
      name: 'Vectors +2',
    },
  ],
})
