# E.X.O.
Exoskeletal exomoon explorer submitted to [No Video Jam 2](https://itch.io/jam/no-video-jam-2).
Developed with [syngen](https://github.com/nicross/syngen).

## Now Available
This game has been remade as part of [Periphery Synthetic EP](https://periphery-synthetic-ep.shiftbacktick.io).

Survey a planetary system in an upgradable exosuit and uncover its mysterious past.
This interactive EP offers a chill and non-violent metroidvania experience across otherworldly musical playgrounds.

## Getting started
To get started, please  use [npm](https://nodejs.org) to install the required dependencies:
```sh
npm install
```

### Common tasks
Common tasks have been automated with [Gulp](https://gulpjs.com):

#### Build once
```sh
gulp build
```

#### Build continuously
```sh
gulp watch
```

#### Create distributables
```sh
gulp dist
```

#### Open in Electron
```sh
gulp electron
```

#### Build and open in Electron
```sh
gulp electron-build
```

#### Start web server
```sh
gulp serve
```

#### Start web server and build continuously
```sh
gulp dev
```

#### Command line flags
| Flag | Description |
| - | - |
| `--debug` | Suppresses minification, enables cheats. |

##### Cheats
Cheats are enabled while the `--debug` command line flag is active:

| Console command | Description |
| - | - |
| `content.inventory.giveAll()` | Fills all materials to maximum capacity. |
| `content.upgrades.giveAll()` | Grants all upgrades. |

## Credits
These fonts are free for noncommercial use and not covered by the license of this project:
- **Beuve** by Axel Lymphos
- **Fira Mono** by Mozilla
- **Roboto** by Google

Thanks for playing!
