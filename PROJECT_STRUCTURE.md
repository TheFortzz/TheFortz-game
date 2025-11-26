# Project Structure

This document describes the organized structure of The Fortz Tank game.

## Root Directory
```
TheFortz/
├── assets/              # All game assets
├── src/                 # Source code
├── docs/                # Documentation files
├── node_modules/        # Dependencies
├── package.json         # Project configuration
├── start.sh            # Start script
└── README.md           # Main readme
```

## Assets Structure
```
assets/
└── images/
    ├── tanks/          # Tank sprites organized by color
    │   ├── blue/       # Blue tank variants
    │   ├── red/        # Red tank variants
    │   ├── purple/     # Purple tank variants
    │   ├── camo/       # Camo tank variants
    │   ├── desert/     # Desert tank variants
    │   └── default/    # Default tank sprites
    ├── powerups/       # Powerup icons (speed, health, etc.)
    ├── terrain/        # Terrain and hex tiles
    └── ui/             # UI elements (logos, levels, coins, etc.)
```

## Source Code Structure
```
src/
├── client/
│   ├── js/
│   │   ├── game/           # Core game logic
│   │   │   ├── main.js
│   │   │   ├── state.js
│   │   │   ├── renderer.js
│   │   │   ├── input.js
│   │   │   └── network.js
│   │   ├── maps/           # Game mode maps
│   │   │   ├── BattleRoyaleMap.js
│   │   │   ├── CaptureTheFlagMap.js
│   │   │   ├── FreeForAllMap.js
│   │   │   ├── KingOfTheHillMap.js
│   │   │   └── TeamDeathMatchMap.js
│   │   ├── lobby/          # Lobby features
│   │   │   ├── friends.js
│   │   │   └── pass.js
│   │   ├── shop/           # Shop system
│   │   │   ├── shop.js
│   │   │   └── shop-optimized.js
│   │   ├── locker/         # Locker/inventory
│   │   │   └── locker.js
│   │   ├── ui/             # UI components
│   │   │   ├── auth.js
│   │   │   └── lobby.js
│   │   ├── game.js         # Main game file
│   │   ├── script.js       # Entry point
│   │   ├── terrainSystem.js
│   │   ├── hexTerrainSystem.js
│   │   ├── settings.js
│   │   ├── storage.js
│   │   └── utils.js
│   ├── styles/
│   │   └── index.css
│   ├── index.html
│   └── index.css
└── server/
    ├── data/               # Server data files
    │   ├── users.json
    │   ├── sessions.json
    │   ├── friends.json
    │   ├── friend_requests.json
    │   ├── parties.json
    │   └── party_invites.json
    ├── server.js
    ├── backend-server.js
    └── storage.js
```

## Documentation
```
docs/
├── QUICKSTART.md
├── START_HERE.md
├── GAME_READY.md
├── IMPROVEMENTS.md
└── ... (other documentation files)
```

## Key Benefits of This Structure

1. **Clear Separation**: Assets, source code, and docs are clearly separated
2. **Organized Assets**: Tank images grouped by color, powerups separate from UI
3. **Modular Code**: Shop, locker, and lobby have their own folders
4. **Game Modes**: All map files in one place
5. **Server Data**: JSON data files organized in server/data folder
6. **Scalability**: Easy to add new features in their own folders
