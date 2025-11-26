# Migration Guide - Updated File Paths

The project structure has been reorganized. Update your import paths as follows:

## Image Paths

### Tank Images
**Old:** `./blue_body_tracks.png`  
**New:** `./assets/images/tanks/blue/blue_body_tracks.png`

**Old:** `./red_turret_01_mk1.png`  
**New:** `./assets/images/tanks/red/red_turret_01_mk1.png`

**Old:** `./camo_body_halftrack.png`  
**New:** `./assets/images/tanks/camo/camo_body_halftrack.png`

### Powerups
**Old:** `./speed2x.png`  
**New:** `./assets/images/powerups/speed2x.png`

**Old:** `./infinitehealth.png`  
**New:** `./assets/images/powerups/infinitehealth.png`

### UI Elements
**Old:** `./logo.png`  
**New:** `./assets/images/ui/logo.png`

**Old:** `./fortz-coin.png`  
**New:** `./assets/images/ui/fortz-coin.png`

### Terrain
**Old:** `./hex-terrain-main.png`  
**New:** `./assets/images/terrain/hex-terrain-main.png`

## JavaScript Module Paths

### Maps
**Old:** `import './BattleRoyaleMap.js'`  
**New:** `import './maps/BattleRoyaleMap.js'`

### Shop
**Old:** `import './shop.js'`  
**New:** `import './shop/shop.js'`

### Locker
**Old:** `import './locker.js'`  
**New:** `import './locker/locker.js'`

### Lobby Features
**Old:** `import './friends.js'`  
**New:** `import './lobby/friends.js'`

**Old:** `import './pass.js'`  
**New:** `import './lobby/pass.js'`

### UI Components
**Old:** `import './auth.js'`  
**New:** `import './ui/auth.js'`

## Server Data Paths

**Old:** `./users.json`  
**New:** `./src/server/data/users.json`

**Old:** `./friends.json`  
**New:** `./src/server/data/friends.json`

**Old:** `./sessions.json`  
**New:** `./src/server/data/sessions.json`

## HTML File Path

**Old:** `./index.html`  
**New:** `./src/client/index.html`

## CSS File Path

**Old:** `./index.css`  
**New:** `./src/client/index.css` or `./src/client/styles/index.css`

---

**Note:** You may need to update your build scripts and server configuration to reflect these new paths.
