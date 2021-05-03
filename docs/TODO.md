# TODO
## Known issues
- Access hotkeys click first item when not focused
- Rotation quaternion math doesn't work as expected
  - RCS Thrusters begin slowing and turning opposite direction at higher speeds
  - Colliding with ground when turning at higher speeds results in abrupt turns in unexpected directions

## Planned versions
### v1.1.0
- Audio cues
  - Attractors
  - Dust particles
  - Jump jet recharge
  - Material scanner cues (all materials ahead in 100m radius, tones play in sequence with scanner results)
  - Wind at extreme velocities
- Space and atmosphere
  - Gravity and wind decreases with distance from sea level
  - Jump jet recharge rate slows
  - Time scale of music slows, a parallel timebase (amod and chord)
  - Highpass music at extreme altitudes
  - Fade in sub bass, two sound sources producing a binaural beat, panned to gas giant
  - Increase z-scale of music exponentially
- Synthesis UI
  - Asertive success indicator

## Wishlist features
- Terrain generation
  - Crater generation
    - Chunked
    - Subtract hole from terrain with radius, never below sea level
    - Raised edges
    - Central peak
- Audio cues
  - Correlate vehicle sounds to upgrade progress
  - Ice creaks
- Upgrades
  - Recycler
    - Shop screen to buy materials from recycler
