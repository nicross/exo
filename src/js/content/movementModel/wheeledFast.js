content.movementModel.wheeledFast = {
  calculate: function () {
    return {
      angularAcceleration: Math.PI / 2,
      angularDeceleration: Math.PI * 2,
      angularVelocity: Math.PI / 2,
      jumpForce: 0,
      lateralAcceleration: 10,
      lateralDeceleration: 10,
      lateralVelocity: 20,
      reference: this,
      rotateScale: 1,
      xScale: 1,
      yScale: 0,
    }
  },
}
