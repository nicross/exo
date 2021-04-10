content.movementModel.bipedalFast = {
  calculate: function () {
    return {
      angularAcceleration: Math.PI / 2,
      angularDeceleration: Math.PI * 2,
      angularVelocity: Math.PI / 4,
      jumpForce: 5,
      lateralAcceleration: 5,
      lateralDeceleration: 10,
      lateralVelocity: 10,
      reference: this,
      rotateScale: 1,
      xScale: 1,
      yScale: 0.5,
    }
  },
}
