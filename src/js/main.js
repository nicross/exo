engine.ready(() => {
  engine.loop.start().pause()
  app.activate()

  // Boosted dynamic range
  engine.audio.mixer.master.param.limiter.attack.value = 0.003
  engine.audio.mixer.master.param.limiter.gain.value = 1
  engine.audio.mixer.master.param.limiter.knee.value = 15
  engine.audio.mixer.master.param.limiter.ratio.value = 15
  engine.audio.mixer.master.param.limiter.release.value = 0.125
  engine.audio.mixer.master.param.limiter.threshold.value = -30
})
