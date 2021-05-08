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
  - Time scale of music slows, a parallel timebase (affects amod frequency, amod depth, and notes)
  - Highpass music at extreme altitudes
  - Fade in sub bass, two sound sources producing a binaural beat, panned to gas giant
  - Increase z-scale of music exponentially
  - Add slight drag to flight based on atmosphere
- Statistics
  - Collected materials broken down by type (Commons, Metals, Exotics, Xenotech)
  - Grounded and flight times
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
