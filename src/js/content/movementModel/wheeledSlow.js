content.movementModel.wheeledSlow = {
  calculate: function () {
    return {
      angularAcceleration: Math.PI / 2,
      angularDeceleration: Math.PI * 2,
      angularVelocity: Math.PI / 2,
      jumpForce: 0,
      lateralAcceleration: 5,
      lateralDeceleration: 10,
      lateralVelocity: 10,
      reference: this,
      rotateScale: 1,
      velocity: 10,
      xScale: 1,
      yScale: 0,
    }
  },
}
