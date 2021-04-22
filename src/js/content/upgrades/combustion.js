content.upgrades.combustion = content.upgrades.invent({
  name: 'Combustion',
  levels: [
    {
      bonus: 1/8,
      cost: {
        'common/nitrogen': 5,
        'common/oxygen': 5,
        'metal/gold': 1,
        'metal/silver': 1,
      },
      name: 'Combustion +1',
    },
    {
      bonus: 1/4,
      cost: {
        'common/nitrogen': 10,
        'common/oxygen': 10,
        'metal/gold': 5,
        'metal/silver': 5,
        'exotic/uranium': 1,
        'xenotech/artifact': 1,
      },
      name: 'Combustion +2',
    },
    {
      bonus: 1/2,
      cost: {
        'common/nitrogen': 20,
        'common/oxygen': 20,
        'metal/gold': 10,
        'metal/silver': 10,
        'exotic/uranium': 5,
        'xenotech/artifact': 2,
      },
      name: 'Combustion +3',
    },
  ],
})
