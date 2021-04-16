app.controls.haptic = (() => {
  const defaultEffect = {
    duration: 0,
    startDelay: 0,
    strongMagnitude: 0,
    weakMagnitude: 0,
  }

  function getActuators() {
    const actuators = [],
      gamepads = navigator.getGamepads()

    for (const gamepad of gamepads) {
      if (!gamepad) {
        continue
      }

      if (gamepad.vibrationActuator && gamepad.vibrationActuator.type == 'dual-rumble') {
        actuators.push(gamepad.vibrationActuator)
      }
    }

    return actuators
  }

  function isActive() {
    return app.settings.computed.gamepadVibration > 0
  }

  function trigger(effect) {
    const actuators = getActuators()

    effect = {...defaultEffect, ...effect}
    effect.strongMagnitude *= app.settings.computed.gamepadVibration
    effect.weakMagnitude *= app.settings.computed.gamepadVibration

    for (const actuator of actuators) {
      if (actuator.playEffect && actuator.type) {
        actuator.playEffect(actuator.type, effect)
      }
    }
  }

  return {
    getActuators,
    isActive,
    trigger: function (...args) {
      if (isActive()) {
        trigger(...args)
      }

      return this
    },
  }
})()

content.audio.collision.on('trigger', (strength) => {
  app.controls.haptic.trigger({
    duration: engine.utility.lerp(75, 300, strength),
    startDelay: 0,
    strongMagnitude: strength ** 0.5,
    weakMagnitude: strength ** 2,
  })
})

content.audio.footstep.on('crunch', (strength) => {
  app.controls.haptic.trigger({
    duration: engine.utility.lerp(50, 100, strength),
    startDelay: 0,
    strongMagnitude: strength / 2,
    weakMagnitude: 0,
  })
})

content.audio.footstep.on('piston', (strength) => {
  app.controls.haptic.trigger({
    duration: engine.utility.lerp(75, 150, strength),
    startDelay: 0,
    strongMagnitude: 0,
    weakMagnitude: strength,
  })
})

content.audio.jets.on('fire', () => {
  const progress = content.movement.jetProgress()

  app.controls.haptic.trigger({
    duration: engine.performance.delta() * 1000,
    startDelay: 0,
    strongMagnitude: (1 - progress) ** 6,
    weakMagnitude: (progress ** 6) * (1 - progress),
  })
})

content.audio.tires.on('grain', (strength) => {
  app.controls.haptic.trigger({
    duration: engine.utility.lerpExp(25, 100, strength, 2),
    startDelay: 0,
    strongMagnitude: 0,
    weakMagnitude: strength,
  })
})
