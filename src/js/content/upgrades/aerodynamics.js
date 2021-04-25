content.upgrades.aerodynamics = content.upgrades.invent({
  name: 'Aerodynamics',
  describe: function (level = this.level) {
    if (!level) {
      return 'Normal acceleration'
    }

    return `+${this.levels[level].bonus * 100}% acceleration`
  },
  levels: [
    {
      bonus: 1/4,
      cost: {
        'common/carbon': 5,
        'common/silicon': 5,
        'metal/aluminum': 1,
        'metal/silver': 1,
      },
      name: 'Aerodynamics +1',
    },
    {
      bonus: 1/2,
      cost: {
        'common/carbon': 10,
        'common/silicon': 10,
        'metal/aluminum': 5,
        'metal/silver': 5,
        'exotic/thorium': 1,
        'xenotech/tesseract': 1,
      },
      name: 'Aerodynamics +2',
    },
    {
      bonus: 1,
      cost: {
        'common/carbon': 20,
        'common/silicon': 20,
        'metal/aluminum': 10,
        'metal/silver': 10,
        'exotic/thorium': 5,
        'xenotech/tesseract': 2,
      },
      name: 'Aerodynamics +3',
    },
  ],
})
