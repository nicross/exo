content.upgrades.heatSinks = content.upgrades.invent({
  name: 'Heat Sinks',
  describe: function (level = this.level) {
    if (!level) {
      return 'Normal jet capacity'
    }

    return `+${this.levels[level].bonus * 100}% jet capacity`
  },
  levels: [
    {
      bonus: 1/4,
      cost: {
        'common/nitrogen': 5,
        'common/silicon': 5,
        'metal/aluminum': 1,
        'metal/copper': 1,
      },
      name: 'Heat Sinks +1',
    },
    {
      bonus: 1/2,
      cost: {
        'common/nitrogen': 10,
        'common/silicon': 10,
        'metal/aluminum': 5,
        'metal/copper': 5,
        'exotic/thorium': 1,
        'xenotech/artifact': 1,
      },
      name: 'Heat Sinks +2',
    },
    {
      bonus: 1,
      cost: {
        'common/nitrogen': 20,
        'common/silicon': 20,
        'metal/aluminum': 10,
        'metal/copper': 10,
        'exotic/thorium': 5,
        'xenotech/artifact': 2,
      },
      name: 'Heat Sinks +3',
    },
  ],
})
