content.movementModel.bipedalFast = {
  calculate: function () {
    return {
      angularAcceleration: Math.PI / 2,
      angularDeceleration: engine.const.tau,
      angularVelocity: Math.PI / 2,
      collisionVelocity: 5,
      depth: 1,
      height: 2,
      jetAcceleration: 5,
      jetCapacity: 10,
      jetVelocity: 2.5,
      jumpForce: 2,
      lateralAcceleration: 5,
      lateralDeceleration: 10,
      lateralVelocity: 10 * (1 + content.upgrades.actuators.getBonus()),
      rotateScale: 1,
      strideLength: 10/3,
      width: 1,
      xScale: 1,
      yScale: 0.5,
    }
  },
  id: 'bipedalFast',
  type: 'bipedal',
}
