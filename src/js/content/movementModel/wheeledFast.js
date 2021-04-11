content.movementModel.wheeledFast = {
  calculate: function () {
    return {
      angularAcceleration: Math.PI / 2,
      angularDeceleration: Math.PI * 2,
      angularVelocity: Math.PI / 2,
      depth: 2,
      height: 1,
      jetAcceleration: 5,
      jetCapacity: 5,
      jetVelocity: 5,
      jumpForce: 0,
      lateralAcceleration: 10,
      lateralDeceleration: 10,
      lateralVelocity: 20,
      rotateScale: 1,
      width: 2,
      xScale: 1,
      yScale: 0,
    }
  },
  id: 'wheeledFast',
  type: 'wheeled',
}
