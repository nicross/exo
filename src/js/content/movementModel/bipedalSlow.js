content.movementModel.bipedalSlow = {
  calculate: function () {
    return {
      angularAcceleration: Math.PI / 2,
      angularDeceleration: Math.PI * 2,
      angularVelocity: Math.PI / 2,
      depth: 1,
      height: 2,
      jetAcceleration: 5,
      jetCapacity: 10,
      jetVelocity: 2.5,
      jumpForce: 2,
      lateralAcceleration: 2.5,
      lateralDeceleration: 10,
      lateralVelocity: 2.5,
      rotateScale: 1,
      width: 1,
      xScale: 1,
      yScale: 1,
    }
  },
  id: 'bipedalFast',
  type: 'bipedal',
}
