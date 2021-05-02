content.upgrades.gyroscopes = content.upgrades.invent({
  name: 'Gyroscopes',
  describe: function (level = this.level) {
    switch (level) {
      case 0:
        return 'Normal slope acceleration'
      case 1:
        return '+25% slope acceleration'
      case 2:
        return '+50% slope acceleration'
      case 3:
        return '+75% slope acceleration'
      case 4:
        return 'Maximum slope acceleration'
    }
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
        'xenotech/tesseract': 1,
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
        'xenotech/tesseract': 2,
      },
      name: 'Gyroscopes +3',
    },
    {
      bonus: 0,
      cost: {
        'common/hydrogen': 25,
        'common/lithium': 25,
        'metal/iron': 20,
        'metal/silver': 20,
        'exotic/neodymium': 10,
        'xenotech/tesseract': 3,
      },
      name: 'Gyroscopes +4',
    },
  ],
})
