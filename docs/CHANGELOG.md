# E.X.O. Changelog

## v1.2.0
- Graphics
  - Added variable radius to stars
  - Improved performance of terrain rendering
  - Increased default and maximum draw distance values
  - Fixed star projection
- Simulation
  - Added stellar parallax to stars
  - Reduced year duration from 30 to 22 minutes
- User interface
  - Fixed formatting of coordinates on Status screen
  - Improved accessibility of tables in manual
  - Redesigned application icon
  - Added dismissible ad for Periphery Synthetic EP
- Miscellaneous
  - Upgraded to latest version of syngen
  - Upgraded desktop builds to Electron 27

## v1.1.0
- Accessibility
  - Added access hotkeys for height and velocity
  - Added height and velocity to Status screen
  - Added cue for when synthesis is complete
  - Added z-coordinate to coordinates hotkey
  - Exposed unavailable upgrades to screen readers
  - Fixed access hotkeys clicking first item instead of focusing
  - Improved verbosity of access hotkey alerts
  - Rearranged coordinates and heading on Status screen
- Audio
  - Added cue for jets running out of fuel
  - Added cues for nearby materials when sonifying terrain
  - Added binaural sub bass that fades in at extreme altitudes
  - Added support for wind at extreme velocities
  - Boosted faraway material sounds
  - Tweaked some material sounds for clarity
- Graphics
  - Added nearby material cues
  - Added procedurally generated stars
  - Added total eclipse of main star behind parent planet
  - Faded out background to black on high altitudes
  - Increased default draw distance to 35
- Materials
  - Added gravitation toward player when attractors are online
  - Fixed materials sometimes spawning abruptly
  - Reweighted spawn chances based on cost demands
- Movement
  - Applied atmospheric drag proportional to pressure and speed
  - Reduced recharge of jump jets at lower atmospheric pressures
- Simulation
  - Simulate atmospheric pressure and gravity as functions of altitude
- Terrain
  - Added lowland and highland biomes for better extremes
  - Adjusted range of mountain slopes
  - Increased overall detail of generated terrain
- Upgrades
  - Added ability to downgrade upgrades
  - Added attractors upgrade which attracts nearby materials
  - Added fifth level cargo racks
  - Added fourth level upgrades for most upgrade tracks
  - Fixed recycled materials not saving correctly
  - Recoup some material costs when downgrading upgrades
- User interface
  - Added confirmation when starting a new game
  - Added exosuit level to Status screen
  - Added New Game Plus option to keep upgrades when starting a new game
  - Added downgrades to Statistics screen

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
