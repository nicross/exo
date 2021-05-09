# TODO
## Planned versions
### v1.1.0
- Audio cues
  - Attractors
  - Dust particles
  - Jump jet recharge
- Space and atmosphere
  - Add slight drag to flight based on atmosphere
- Synthesis UI
  - Asertive success indicator

## Wishlist features
- Terrain generation
  - Crater generation
    - Chunked
    - Subtract hole from terrain with radius, never below sea level
    - Raised edges
    - Central peak
- Better haptics
  - Current implementation allows events to override previous events
  - This blocks adding wind at high velocities
  - Two options
    - Track internal state and send combined haptic events each frame
    - Listen to certain buses with an FFT and use audio levels for haptic strength
- Audio cues
  - Correlate vehicle sounds to upgrade progress
  - Ice creaks
- Upgrades
  - Recycler
    - Shop screen to buy materials from recycler
