content.scan = (() => {
  const cooldown = 2000, // ms for scan cue to end
    maxDistance = 100,
    pubsub = engine.utility.pubsub.create(),
    unitX = engine.utility.vector2d.unitX()

  let isCooldown = false

  function doRaycast(position, direction) {
    const results = []

    let {
      x: dx,
      y: dy,
    } = engine.utility.vector3d.create(direction).rotateQuaternion(position.quaternion)

    let {x, y, z} = position.vector

    for (let d = 0; d < maxDistance; d += 1) {
      x += dx
      y += dy
      results.push(content.terrain.value(x, y) - z)
    }

    return results
  }

  async function scan() {
    const position = {
      quaternion: engine.position.getQuaternion(),
      vector: engine.position.getVector(),
    }

    return {
      forward: await scheduleRaycast(position, unitX.clone()),
      forwardForwardLeft: await scheduleRaycast(position, unitX.rotate(Math.PI / 6)),
      forwardLeftLeft: await scheduleRaycast(position, unitX.rotate(Math.PI / 3)),
      forwardForwardRight: await scheduleRaycast(position, unitX.rotate(-Math.PI / 6)),
      forwardRightRight: await scheduleRaycast(position, unitX.rotate(-Math.PI / 3)),
      left: await scheduleRaycast(position, unitX.rotate(Math.PI / 2)),
      right: await scheduleRaycast(position, unitX.rotate(-Math.PI / 2)),
    }
  }

  async function scheduleRaycast(...args) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(doRaycast(...args))
      })
    })
  }

  return engine.utility.pubsub.decorate({
    benchmark: function () {
      const start = performance.now()
      this.trigger()
      return performance.now() - start
    },
    isCooldown: () => isCooldown,
    trigger: async function () {
      if (isCooldown) {
        return this
      }

      isCooldown = true
      pubsub.emit('trigger', {forward: true})

      const results = await scan()

      pubsub.emit('complete', results)

      engine.utility.timing.promise(cooldown).then(() => {
        isCooldown = false
        pubsub.emit('recharge', results)
      })

      return this
    },
  }, pubsub)
})()

content.scan.on('trigger', () => engine.loop.pause())

content.scan.on('recharge', () => {
  if (app.state.game.is('running')) {
    engine.loop.resume()
  }
})
