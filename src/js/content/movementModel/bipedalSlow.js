content.movementModel.bipedalSlow = {
  calculate: function () {
    return {
      angularAcceleration: Math.PI / 2,
      angularDeceleration: Math.PI * 2,
      angularVelocity: Math.PI / 2,
      lateralAcceleration: 2.5,
      lateralDeceleration: 10,
      lateralVelocity: 2.5,
      reference: this,
      rotateScale: 1,
      xScale: 1,
      yScale: 1,
    }
  },
}
