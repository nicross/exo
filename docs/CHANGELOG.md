# E.X.O. Changelog
## v1.1.0
- Accessibility
  - Added access hotkeys for height and velocity
  - Added height and velocity to Status screen
  - Added z-coordinate to coordinates hotkey
  - Exposed unavailable upgrades to screen readers
  - Fixed access hotkeys clicking first item instead of focusing
  - Rearranged coordinates and heading on Status screen
- Audio
  - Added cues for nearby materials when sonifying terrain
  - Added binaural sub bass that fades in at extreme altitudes
  - Added support for wind at extreme velocities
- Graphics
  - Added nearby material cues
  - Added procedurally generated stars
  - Added total eclipse of main star behind parent planet
  - Faded out background to black on high altitudes
- Materials
  - Added attraction when attractors are online
  - Reweight spawn chances based on cost demands
- Movement
  - Reduced recharge of jump jets at lower atmospheric pressures
- Simulation
  - Simulate atmospheric pressure and gravity as functions of altitude
- Terrain
  - Added low and high biomes for better extremes
  - Adjusted range of mountain slopes
  - Increased overall detail of generated terrain
- Upgrades
  - Added attractors upgrade
  - Added level 4 upgrades for most upgrade tracks
- User interface
  - Added confirmation when starting a new game
  - Added New Game Plus to keep upgrades when starting a new game

## v1.0.2
- Continuously normalized position to prevent bad states
- Prevented saving and loading known bad game states

## v1.0.1
- Accessibility
  - Fixed digit hotkeys not working as documented
- Documentation
  - Expanded the How to Play section with sections on movement, terrain sonification, materials, and synthesis
- Movement
  - Prevented extreme rotational velocities by enforcing a speed limit
- Miscellaneous
  - Fixed saves corrupted by extreme rotational velocities
