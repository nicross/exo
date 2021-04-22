content.upgrades.brakes = content.upgrades.invent({
  name: 'Brakes',
  levels: [
    {
      bonus: 1/4,
      cost: {
        'common/carbon': 5,
        'common/lithium': 5,
        'metal/copper': 1,
        'metal/gold': 1,
      },
      name: 'Brakes +1',
    },
    {
      bonus: 1/2,
      cost: {
        'common/carbon': 10,
        'common/lithium': 10,
        'metal/copper': 5,
        'metal/gold': 5,
        'exotic/neodymium': 1,
        'xenotech/artifact': 1,
      },
      name: 'Brakes +2',
    },
    {
      bonus: 1,
      cost: {
        'common/carbon': 20,
        'common/lithium': 20,
        'metal/copper': 10,
        'metal/gold': 10,
        'exotic/neodymium': 5,
        'xenotech/artifact': 2,
      },
      name: 'Brakes +3',
    },
  ],
})
