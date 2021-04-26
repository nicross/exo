content.upgrades.recycler = content.upgrades.invent({
  name: 'Recycler',
  describe: function (level = this.level) {
    if (!level) {
      return 'Recycling offline'
    }

    return 'Recycling online'
  },
  levels: [
    {
      bonus: 0,
      cost: {
        'common/carbon': 1,
        'common/hydrogen': 1,
        'common/lithium': 1,
        'common/nitrogen': 1,
        'common/oxygen': 1,
        'common/silicon': 1,
        'metal/aluminum': 1,
        'metal/copper': 1,
        'metal/gold': 1,
        'metal/iron': 1,
        'metal/silver': 1,
        'exotic/neodymium': 1,
        'exotic/thorium': 1,
        'exotic/uranium': 1,
        'xenotech/tesseract': 1,
      },
      name: 'Recycler',
    },
  ],
  isActive: function () {
    return this.level > 0
  },
})
