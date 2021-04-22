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
      lateralDeceleration: 5,
      lateralVelocity: 20 * (1 + content.upgrades.actuators.getBonus()),
      rotateScale: 1,
      strideLength: engine.const.maxSafeFloat,
      width: 2,
      xScale: 1,
      yScale: 0,
    }
  },
  id: 'wheeledFast',
  type: 'wheeled',
}
