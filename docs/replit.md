# TheFortz - Tank Battle Arena

## Overview
TheFortz is a multiplayer tank battle game featuring real-time PvP combat across various game modes. Players can customize their tanks, battle in different arenas, and compete with friends.

## Project Structure

### Backend
- **backend-server.js**: Main Express/WebSocket server (port 5000)
- **storage.js**: Data persistence layer using JSON files
- **auth.js**: Client-side authentication logic

### Frontend
- **index.html**: Main HTML lobby and game UI
- **game.js**: Client-side game logic and rendering (7597 lines)
- **index.css**: Main stylesheet

### Game Modes
- **FreeForAllMap.js**: Free-for-all mode
- **TeamDeathMatchMap.js**: Team-based combat
- **CaptureTheFlagMap.js**: CTF mode
- **KingOfTheHillMap.js**: KOTH mode
- **BattleRoyaleMap.js**: Battle royale mode

### UI Modules
- **shop.js**: In-game shop
- **locker.js**: Tank customization
- **settings.js**: User settings
- **pass.js**: Battle pass system
- **friends.js**: Friend management
- **creatmap.js**: Custom map creator

### Terrain System
- **terrainSystem.js**: Terrain rendering and biome definitions
- **hexTerrainSystem.js**: Enhanced hexagonal ground texture system with improved world generation

## Technology Stack
- **Backend**: Node.js, Express.js v5.1.0, WebSocket (ws v8.18.3)
- **Frontend**: HTML5 Canvas, Vanilla JavaScript
- **Security**: bcrypt v6.0.0 for password hashing
- **Data Storage**: JSON files (file-based persistence)
- **CrazyGames SDK**: v2 (HTML5) - Integrated for monetization and cloud saves

## Key Features
- Real-time multiplayer tank combat
- Multiple game modes (FFA, TDM, CTF, KOTH, BR)
- Tank customization system
- Friends and party system
- In-game currency (Fortz)
- Power-ups and upgrades
- Hexagonal terrain rendering
- **CrazyGames SDK Integration**:
  - Gameplay tracking (gameplayStart/gameplayStop events)
  - Midgame ads (shown after player death)
  - Rewarded ads (watch for 100 Fortz)
  - Cloud saves for guest and CrazyGames users
  - CrazyGames user account integration

## Server Configuration
- **Host**: 0.0.0.0 (allows external connections)
- **Port**: 5000 (frontend and backend unified)
- **WebSocket Path**: /ws
- **Cache Control**: Disabled for development

## Data Files
User data is persisted in JSON files:
- users.json
- sessions.json
- friends.json
- friend_requests.json
- parties.json
- party_invites.json

## CrazyGames SDK Integration

### Integration Files
- **crazygames-integration.js**: Main SDK integration module
- **index.html**: SDK script loaded in `<head>` section
- **game.js**: Gameplay events, ad calls, and cloud saves
- **auth.js**: CrazyGames user authentication

### SDK Features Implemented

#### 1. Gameplay Events
- `gameplayStart()`: Called when player joins a game
- `gameplayStop()`: Called when player returns to lobby
- Tracks player engagement metrics for CrazyGames analytics

#### 2. Advertisement System
- **Midgame Ads**: Automatically shown after player death
- **Rewarded Ads**: "Free Fortz" button in lobby - players watch ad for 100 Fortz
- Ad cooldown: 60 seconds between midgame ads
- Game pauses during ads, resumes after completion

#### 3. Cloud Save System
- Saves player data (Fortz currency, owned items, selected tank)
- Works for both CrazyGames users and guests
- Auto-syncs when CrazyGames user logs in
- Falls back to localStorage if SDK unavailable

#### 4. User Account Integration
- Checks for CrazyGames user on page load
- Uses CrazyGames username and profile picture
- Automatic guest-to-user progression
- No separate login required for CrazyGames users

### Testing the SDK
- SDK detects localhost automatically
- Ads show as overlay text in development
- Full functionality available when deployed on CrazyGames
- Use CrazyGames QA tool for testing before submission

## Recent Changes (October 31, 2025)

### Initial Setup
- Imported from GitHub
- Configured for Replit environment
- Workflow created for development server
- Node.js dependencies installed (express, ws, bcrypt)

### CrazyGames Integration (October 31, 2025)
- Added CrazyGames SDK v2 script to index.html
- Created crazygames-integration.js module
- Integrated gameplay events into game flow
- Added midgame ads after player death
- Added rewarded ad button for free Fortz
- Implemented cloud save system with auto-sync
- Added CrazyGames user authentication
- Ready for CrazyGames submission

### Terrain Visual Improvements (October 31, 2025)
- Enhanced terrain generation algorithm with 23 strategic biome zones
- Added priority-based layering system for natural biome stacking
- Implemented gradient transitions between biomes (core → middle → edge zones)
- Improved rendering quality with high-quality image smoothing
- Created diverse world layout:
  - Central grasslands (peaceful area)
  - 4 major forest regions  
  - 3 desert zones
  - 3 water bodies (lakes/rivers)
  - 2 arctic/snow regions
  - 3 rocky mountain areas
  - 3 muddy swamp zones
  - 2 urban/industrial zones
  - 2 volcanic lava zones (dangerous areas)
- Enhanced hexagon rendering with better coverage and interpolation
