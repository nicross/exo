# TODO
## v1.2.0
- Upgrade to latest version of syngen
- Expand draw distance slider values
- Increase strength of attractors
- Fix coordinates formatting on status screen
- Add stabilizers and shocks upgrades
- Better haptics

## Wishlist features
- Terrain generation
  - Crater generation
    - Chunked
    - Subtract hole from terrain with radius, never below sea level
    - Raised edges
    - Central peak
- Better haptics
  - Current implementation allows new events to override active events
  - This blocks adding wind at high velocities and other simultaneous feedback
  - Two options
    - Track internal state and send combined haptic events each frame
    - Listen to certain buses with an FFT and use audio levels for haptic strengths
- Audio cues
  - Attractors
  - Dust particles
  - Jump jet recharge
  - Correlate vehicle sounds to upgrade progress
  - Ice creaks
- Status and Statistics
  - Materials collected and recycled by type
  - Time spent broken down by activity
- Upgrades
  - Fuel, refills jets
  - Shop screen to buy materials from recycler
  - Shocks, reduce collision bounce
  - Stabilizers, angular deceleration in-air when not using RCS
