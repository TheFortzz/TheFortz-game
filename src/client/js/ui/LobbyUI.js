/**
 * LobbyUI.js - Lobby interface management
 * Handles lobby background rendering, vehicle selection, and lobby state management
 */

import gameStateManager from '../core/GameState.js';
import imageLoader from '../assets/ImageLoader.js';
import { NETWORK_CONFIG } from '../core/Config.js';

// Lobby state variables
let lobbySocket = null;
let lobbyWalls = [];
let lobbyPlayers = {};
let gameModePlayers = {}; // Track player counts for each game mode
let lobbyMapData = {
  walls: [],
  shapes: [],
  players: [],
  bullets: [],
  gameWidth: 7500,
  gameHeight: 7500
};

// Ensure dimensions are exactly 7500x7500 (never changes)
Object.defineProperty(lobbyMapData, 'gameWidth', {
  value: 7500,
  writable: false,
  configurable: false
});
Object.defineProperty(lobbyMapData, 'gameHeight', {
  value: 7500,
  writable: false,
  configurable: false
});

/**
 * LobbyUI class - manages all lobby interface functionality
 */
class LobbyUI {
  constructor() {
    this.animationId = null;
    this.vehicleHexagonInterval = null;
    this.friendVehicleInterval = null;
  }

  /**
   * Get the correct lobby canvas based on vehicle type
   */
  getCurrentLobbyCanvas() {
    const vehicleType = window.currentLobbyVehicleType || gameStateManager.getGameState().selectedVehicleType || 'tank';

    if (vehicleType === 'jet') {
      return document.getElementById('jetLobbyBackground');
    } else if (vehicleType === 'race') {
      return document.getElementById('raceLobbyBackground');
    } else {
      return document.getElementById('tankLobbyBackground');
    }
  }

  /**
   * Render lobby background
   */
  renderLobbyBackground() {
    const canvas = this.getCurrentLobbyCanvas();
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Render the full map background
    if (window.MapRenderer && window.MapRenderer.currentMap) {
      ctx.save();
      const lobbyCamera = { x: 0, y: 0 };
      window.MapRenderer.render(ctx, lobbyCamera, canvas);
      ctx.restore();
    }
  }

  /**
   * Initialize lobby background
   */
  initializeLobbyBackground() {
    const canvas = document.getElementById('tankLobbyBackground');
    if (!canvas) {
      console.warn('Tank lobby background canvas not found');
      return;
    }

    // If jet or race mode is active, don't override their backgrounds
    if (window.currentLobbyVehicleType === 'jet' || window.currentLobbyVehicleType === 'race') {
      console.log('Skipping tank background - vehicle mode active:', window.currentLobbyVehicleType);
      return;
    }

    // Clear any DOM maps when switching back to canvas mode
    if (window.DOMMapRenderer?.clearLobbyMap) {
      window.DOMMapRenderer.clearLobbyMap();
    }

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // First, render the full map background immediately
    this.renderLobbyBackground();

    // Connect to server to get live map data
    this.connectLobbyToServer();

    let time = 0;
    let cameraX = 0;
    let cameraY = 0;
    let targetCameraX = 0;
    let targetCameraY = 0;
    let lastCameraUpdate = 0;
    const CAMERA_UPDATE_INTERVAL = 5000; // 5 seconds between camera movements

    let lastFrameTime = performance.now();

    const drawBackground = (currentTime) => {
      // Stop if not in lobby or if jet/race mode is active
      const gameState = gameStateManager.getGameState();
      if (!gameState.isInLobby) return;
      if (window.currentLobbyVehicleType === 'jet' || window.currentLobbyVehicleType === 'race') {
        return; // Stop the tank background animation
      }

      // Limit to 30 FPS for lobby (performance optimization)
      const deltaTime = currentTime - lastFrameTime;
      if (deltaTime < 33) {// ~30 FPS
        window.tankBackgroundAnimationId = requestAnimationFrame(drawBackground);
        return;
      }
      lastFrameTime = currentTime;

      // Clear with dark background
      ctx.fillStyle = '#0a0a15';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update camera target every 5 seconds
      if (currentTime - lastCameraUpdate > CAMERA_UPDATE_INTERVAL) {
        targetCameraX = (Math.random() - 0.5) * 2000;
        targetCameraY = (Math.random() - 0.5) * 2000;
        lastCameraUpdate = currentTime;
      }

      // Smooth camera movement (very slow)
      const smoothing = 0.001; // Very slow smooth movement
      cameraX += (targetCameraX - cameraX) * smoothing;
      cameraY += (targetCameraY - cameraY) * smoothing;

      // Render created map ONLY (no water fallback)
      if (window.MapRenderer && window.MapRenderer.currentMap) {
        ctx.save();
        ctx.translate(-cameraX, -cameraY);

        const lobbyCamera = { x: cameraX, y: cameraY };
        window.MapRenderer.render(ctx, lobbyCamera, canvas);

        ctx.restore();
      }

      // Draw shapes and other elements on top
      ctx.save();
      ctx.translate(-cameraX, -cameraY);

      // Draw shapes (only visible ones)
      lobbyMapData.shapes.forEach((shape, index) => {
        const screenX = shape.x - cameraX;
        const screenY = shape.y - cameraY;

        // Skip shapes outside viewport
        if (screenX < -100 || screenX > canvas.width + 100 ||
        screenY < -100 || screenY > canvas.height + 100) {
          return;
        }

        const pulse = Math.sin(time * 0.0015 + index * 0.5) * 0.15 + 1;
        const rotation = time * 0.001 + index;

        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(rotation);
        ctx.scale(pulse, pulse);

        // Glow effect
        ctx.shadowColor = shape.color;
        ctx.shadowBlur = 15 + Math.sin(time * 0.003 + index) * 5;

        ctx.fillStyle = shape.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;

        if (shape.type === 'CIRCLE') {
          ctx.beginPath();
          ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (shape.type === 'TRIANGLE') {
          ctx.beginPath();
          ctx.moveTo(0, -shape.size / 2);
          ctx.lineTo(-shape.size / 2, shape.size / 2);
          ctx.lineTo(shape.size / 2, shape.size / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      });

      // Draw live players (tanks) - only visible ones
      const imagesLoaded = imageLoader.imagesLoaded;
      if (imagesLoaded && lobbyMapData.players && Array.isArray(lobbyMapData.players)) {
        lobbyMapData.players.forEach((player) => {
          if (!player || !player.selectedTank || typeof player.x !== 'number' || typeof player.y !== 'number') return;

          const screenX = player.x - cameraX;
          const screenY = player.y - cameraY;

          // Skip tanks outside viewport
          if (screenX < -100 || screenX > canvas.width + 100 ||
          screenY < -100 || screenY > canvas.height + 100) {
            return;
          }

          ctx.save();
          ctx.translate(player.x, player.y);

          // Smooth rotation animation
          const targetRotation = typeof player.rotation === 'number' ? player.rotation : 0;
          if (!player.smoothRotation) player.smoothRotation = targetRotation;
          player.smoothRotation += (targetRotation - player.smoothRotation) * 0.05;

          const weaponRotation = typeof player.weaponRotation === 'number' ? player.weaponRotation : 0;
          ctx.rotate(player.smoothRotation);

          // Get player's tank images
          const { tankImg, weaponImg } = imageLoader.getCurrentTankImages(player.selectedTank);

          // Draw tank body
          const tankSize = 40;
          if (tankImg && tankImg.complete) {
            ctx.drawImage(tankImg, -tankSize / 2, -tankSize / 2, tankSize, tankSize);
          }

          // Draw weapon
          if (weaponImg && weaponImg.complete) {
            ctx.rotate(weaponRotation - player.smoothRotation);
            ctx.drawImage(weaponImg, -tankSize / 2, -tankSize / 2, tankSize, tankSize);
          }

          ctx.restore();

          // Draw player name above tank
          if (player.name) {
            ctx.save();
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.strokeText(player.name, player.x, player.y - 25);
            ctx.fillText(player.name, player.x, player.y - 25);
            ctx.restore();
          }
        });
      }

      // Draw live bullets
      if (lobbyMapData.bullets && Array.isArray(lobbyMapData.bullets)) {
        ctx.fillStyle = '#ff0';
        ctx.shadowColor = '#ff0';
        ctx.shadowBlur = 10;
        lobbyMapData.bullets.forEach((bullet) => {
          if (!bullet) return;
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // Add subtle overlay
      ctx.fillStyle = 'rgba(26, 42, 65, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time++;
      window.tankBackgroundAnimationId = requestAnimationFrame(drawBackground);
    };

    window.tankBackgroundAnimationId = requestAnimationFrame(drawBackground);
  }

  /**
   * Connect to lobby server for live map data
   */
  connectLobbyToServer() {
    if (lobbySocket) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    let host = window.location.hostname;
    // Fix for 0.0.0.0 - use localhost instead
    if (host === '0.0.0.0') {
      host = 'localhost';
    }
    const port = NETWORK_CONFIG.port;
    const wsUrl = `${protocol}//${host}:${port}/ws?lobby=true`;

    try {
      lobbySocket = new WebSocket(wsUrl);

      lobbySocket.onopen = () => {
        console.log('Connected to lobby server');
        lobbySocket.send(JSON.stringify({ type: 'lobby_join' }));
      };

      lobbySocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'lobby_update') {
            lobbyMapData = data.mapData || lobbyMapData;
          }
        } catch (e) {
          console.error('Error parsing lobby message:', e);
        }
      };

      lobbySocket.onerror = (error) => {
        console.error('Lobby WebSocket error:', error);
      };

      lobbySocket.onclose = () => {
        console.log('Disconnected from lobby server');
        lobbySocket = null;
      };
    } catch (error) {
      console.error('Failed to connect to lobby server:', error);
    }
  }

  /**
   * Close all panels and restore lobby state
   */
  closeAllPanels() {
    const gameState = gameStateManager.getGameState();

    // Close all features
    gameStateManager.updateGameState({
      showShop: false,
      showLocker: false,
      showParty: false,
      showFriends: false,
      showSettings: false,
      showLeaderboard: false,
      showCreateMap: false,
      showPass: false,
      showChampions: false,
      showGameModes: false
    });

    // Hide all feature screens
    const featureScreens = [
    'shopScreen',
    'lockerScreen',
    'partyScreen',
    'friendsScreen',
    'settingsScreen',
    'leaderboardScreen',
    'createMapScreen',
    'passScreen',
    'championsScreen',
    'gameModesScreen'];

    featureScreens.forEach((screenId) => {
      const screen = document.getElementById(screenId);
      if (screen) {
        screen.classList.add('hidden');
        screen.style.display = 'none';
      }
    });

    // Stop any rendering animations (canvas shop removed)
    if (typeof window.stopLockerRendering === 'function') {
      window.stopLockerRendering();
    }
    if (typeof window.stopCreateMapRendering === 'function') {
      window.stopCreateMapRendering();
    }

    // Show lobby screen
    const lobbyScreen = document.getElementById('lobbyScreen');
    if (lobbyScreen) {
      lobbyScreen.classList.remove('hidden');
      lobbyScreen.style.display = 'block';
    }

    console.log('✅ All panels closed, returned to lobby');
  }

  /**
   * Animate lobby tank previews
   */
  animateLobbyTanks() {
    const gameState = gameStateManager.getGameState();
    if (gameState.isInLobby && imageLoader.imagesLoaded) {
      const canvas = document.getElementById('playerTankCanvas');
      if (canvas) {
        // Ensure tank config has valid values before rendering
        const tankConfig = window.GameStateValidator ? 
          window.GameStateValidator.ensureValidTankConfig(gameState.selectedTank) :
          {
            color: gameState.selectedTank?.color || 'blue',
            body: gameState.selectedTank?.body || 'body_halftrack',
            weapon: gameState.selectedTank?.weapon || 'turret_01_mk1'
          };
        
        imageLoader.renderTankOnCanvas('playerTankCanvas', tankConfig);
      }

      // Continue animation
      setTimeout(() => this.animateLobbyTanks(), 100);
    }
  }

  /**
   * Update lobby background with a specific map
   */
  updateLobbyBackgroundWithMap(mapData, vehicleType) {
    console.log(`🗺️ Updating lobby background with map: ${mapData.name} (${vehicleType})`);

    if (window.MapRenderer) {
      window.MapRenderer.loadMap(mapData);
      this.renderLobbyBackground();
    }
  }

  /**
   * Render vehicle on hexagon preview canvas
   */
  renderVehicleHexagon() {
    const canvas = document.getElementById('vehiclePreviewCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gameState = gameStateManager.getGameState();
    const vehicleType = gameState.selectedVehicleType || 'tank';
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Rotate 110 degrees to the left (counter-clockwise)
    const rotation = -110 * (Math.PI / 180);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    if (vehicleType === 'tank') {
      const selectedTank = gameState.selectedTank;
      if (selectedTank) {
        const tankImg = imageLoader.lobbyTankImages[selectedTank.color]?.[selectedTank.body];
        const weaponImg = imageLoader.lobbyWeaponImages[selectedTank.color]?.[selectedTank.weapon];

        if (tankImg && tankImg.complete) {
          const scale = 0.35;
          const w = tankImg.width * scale;
          const h = tankImg.height * scale;
          ctx.drawImage(tankImg, -w / 2, -h / 2, w, h);
        }

        if (weaponImg && weaponImg.complete) {
          const scale = 0.3;
          const w = weaponImg.width * scale;
          const h = weaponImg.height * scale;
          ctx.drawImage(weaponImg, -w / 2, -h / 2, w, h);
        }
      }
    }

    ctx.restore();
  }

  /**
   * Start continuous rendering for vehicle hexagon
   */
  startVehicleHexagonRendering() {
    if (this.vehicleHexagonInterval) return;
    this.vehicleHexagonInterval = setInterval(() => this.renderVehicleHexagon(), 50);
  }

  /**
   * Stop vehicle hexagon rendering
   */
  stopVehicleHexagonRendering() {
    if (this.vehicleHexagonInterval) {
      clearInterval(this.vehicleHexagonInterval);
      this.vehicleHexagonInterval = null;
    }
  }

  /**
   * Return to lobby from game
   */
  returnToLobby() {
    // Trigger CrazyGames gameplay stop event
    if (window.CrazyGamesIntegration) {
      window.CrazyGamesIntegration.gameplayStop();
    }

    // Set lobby state first to prevent reconnection attempts
    gameStateManager.updateGameState({
      isInLobby: true,
      isConnected: false
    });

    // Reset vehicle type to tank (default) when returning to lobby
    window.currentLobbyVehicleType = 'tank';
    gameStateManager.updateGameState({ selectedVehicleType: 'tank' });

    // Disconnect from current game
    if (window.networkSystem) {
      window.networkSystem.disconnect();
    }

    // Close lobby socket too if it exists
    if (lobbySocket) {
      lobbySocket.close();
      lobbySocket = null;
    }

    // Reset game state
    gameStateManager.updateGameState({
      playerId: null,
      players: {},
      shapes: [],
      walls: [],
      bullets: [],
      shapeSpawnTimers: {}
    });

    // Show lobby and restore all UI elements
    const lobbyScreen = document.getElementById('lobbyScreen');
    if (lobbyScreen) {
      lobbyScreen.classList.remove('hidden');
      const children = lobbyScreen.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.id !== 'tankLobbyBackground') {
          child.style.display = '';
        }
      }
      const tankCanvas = document.getElementById('tankLobbyBackground');
      if (tankCanvas) {
        tankCanvas.style.zIndex = '1';
      }
    }

    document.getElementById('gameMapArea').classList.add('hidden');

    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas) {
      gameCanvas.style.display = 'none';
    }

    document.getElementById('ui').classList.add('hidden');
    document.getElementById('scoreProgressContainer').classList.add('hidden');
    document.getElementById('centerBottomBoxes').classList.add('hidden');
    document.getElementById('respawnScreen').classList.add('hidden');

    // Render DOM map to lobby
    if (window.DOMMapRenderer && window.DOMMapRenderer.initialized) {
      window.DOMMapRenderer.renderToLobby();
    }

    // Initialize lobby background
    this.initializeLobbyBackground();

    console.log('Returned to lobby');
  }

  /**
   * Update lobby background showing "No maps created"
   */
  updateLobbyBackgroundNoMaps(vehicleType) {
    console.log(`🎨 Showing no maps message for ${vehicleType}`);

    const canvas = this.getCurrentLobbyCanvas();
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark background
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Message
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`No ${vehicleType} maps created yet`, canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '18px Arial';
    ctx.fillText('Create a map to start playing!', canvas.width / 2, canvas.height / 2 + 20);
  }

  /**
   * Update lobby vehicle preview based on selected type
   */
  updateLobbyVehiclePreview() {
    const canvas = document.getElementById('playerTankCanvas');
    if (!canvas) return;

    const gameState = gameStateManager.getGameState();
    const vehicleType = gameState.selectedVehicleType || 'tank';

    if (vehicleType === 'tank') {
      imageLoader.renderTankOnCanvas('playerTankCanvas', gameState.selectedTank);
    } else if (vehicleType === 'jet') {
      imageLoader.renderJetOnCanvas('playerTankCanvas', gameState.selectedJet);
    } else if (vehicleType === 'race') {
      imageLoader.renderRaceOnCanvas('playerTankCanvas', gameState.selectedRace);
    }
  }

  /**
   * Render tank in lobby
   */
  renderLobbyTank(ctx, centerX, centerY, tank) {
    // Create a temporary canvas for the tank rendering
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 200;
    tempCanvas.height = 200;

    // Render tank on temp canvas
    imageLoader.renderTankOnCanvas(tempCanvas, tank, {
      scale: 0.5,
      rotation: -Math.PI / 2
    });

    // Draw temp canvas to main context
    ctx.drawImage(tempCanvas, centerX - 100, centerY - 100);
  }

  /**
   * Render jet in lobby
   */
  renderLobbyJet(ctx, centerX, centerY, jet) {
    if (!jet) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 200;
    tempCanvas.height = 200;

    imageLoader.renderJetOnCanvas(tempCanvas, jet, {
      scale: 0.5,
      rotation: -Math.PI / 2
    });

    ctx.drawImage(tempCanvas, centerX - 100, centerY - 100);
  }

  /**
   * Render race car in lobby
   */
  renderLobbyRace(ctx, centerX, centerY, race) {
    if (!race) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 200;
    tempCanvas.height = 200;

    imageLoader.renderRaceOnCanvas(tempCanvas, race, {
      scale: 0.5,
      rotation: -Math.PI / 2
    });

    ctx.drawImage(tempCanvas, centerX - 100, centerY - 100);
  }
}

// Create singleton instance
const lobbyUI = new LobbyUI();

// Export for module usage
export default lobbyUI;

// Expose globally for backward compatibility
if (typeof window !== 'undefined') {
  window.lobbyUI = lobbyUI;
  window.renderLobbyBackground = () => lobbyUI.renderLobbyBackground();
  window.initializeLobbyBackground = () => lobbyUI.initializeLobbyBackground();
  window.closeAllPanels = () => lobbyUI.closeAllPanels();
  window.animateLobbyTanks = () => lobbyUI.animateLobbyTanks();
  window.updateLobbyBackgroundWithMap = (mapData, vehicleType) => lobbyUI.updateLobbyBackgroundWithMap(mapData, vehicleType);
  window.returnToLobby = () => lobbyUI.returnToLobby();
  window.getCurrentLobbyCanvas = () => lobbyUI.getCurrentLobbyCanvas();
  window.updateLobbyBackgroundNoMaps = (vehicleType) => lobbyUI.updateLobbyBackgroundNoMaps(vehicleType);
  window.updateLobbyVehiclePreview = () => lobbyUI.updateLobbyVehiclePreview();
  window.renderLobbyTank = (ctx, centerX, centerY, tank) => lobbyUI.renderLobbyTank(ctx, centerX, centerY, tank);
  window.renderLobbyJet = (ctx, centerX, centerY, jet) => lobbyUI.renderLobbyJet(ctx, centerX, centerY, jet);
  window.renderLobbyRace = (ctx, centerX, centerY, race) => lobbyUI.renderLobbyRace(ctx, centerX, centerY, race);

  // Vehicle selection function
  window.selectVehicleType = (type) => {
    console.log('Selecting vehicle type:', type);
    const gameState = gameStateManager.getGameState();
    gameStateManager.updateGameState({ selectedVehicleType: type });

    // Update button states
    document.querySelectorAll('.vehicle-btn').forEach((btn) => btn.classList.remove('active'));
    document.getElementById(`${type}Btn`)?.classList.add('active');

    // Update lobby background
    lobbyUI.updateLobbyVehiclePreview();
  };

  // Feature panel functions
  window.openFeature = (feature) => {
    console.log('🔧 Opening feature:', feature);
    
    // Close all panels first
    lobbyUI.closeAllPanels();

    // Convert kebab-case to camelCase for feature names
    const featureCamel = feature.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

    const featureMap = {
      'shop': 'shopScreen',
      'locker': 'lockerScreen',
      'createMap': 'createMapScreen',
      'create-map': 'createMapScreen',
      'pass': 'passScreen',
      'friends': 'friendsScreen',
      'settings': 'settingsScreen',
      'gameModes': 'gameModesScreen',
      'champions': 'championsScreen',
      'tanks': 'tanksScreen',
      'weapons': 'weaponsScreen'
    };

    const screenId = featureMap[feature] || featureMap[featureCamel];
    console.log(`📝 Feature: ${feature} -> Screen ID: ${screenId}`);
    
    if (screenId) {
      const screen = document.getElementById(screenId);
      if (screen) {
        console.log(`✅ Found screen element: ${screenId}`);
        
        // Force show the screen
        screen.classList.remove('hidden');
        screen.style.display = 'block';
        screen.style.visibility = 'visible';
        
        console.log(`📝 Screen classes after show: ${screen.className}`);
        console.log(`📝 Screen display style: ${screen.style.display}`);

        // Update game state
        const stateKey = `show${featureCamel.charAt(0).toUpperCase() + featureCamel.slice(1)}`;
        gameStateManager.updateGameState({ [stateKey]: true });
        console.log(`📝 Updated game state: ${stateKey} = true`);

        // Initialize specific features
        if (feature === 'create-map' || feature === 'createMap') {
          console.log('🗺️ Initializing map creator...');
          
          // Initialize map creator
          if (typeof window.startCreateMapRendering === 'function') {
            console.log('✅ Calling startCreateMapRendering()');
            window.startCreateMapRendering();
          } else {
            console.warn('⚠️ startCreateMapRendering function not found');
          }
          
          // Load saved maps
          if (typeof window.loadSavedMaps === 'function') {
            console.log('✅ Calling loadSavedMaps()');
            window.loadSavedMaps();
          } else {
            console.warn('⚠️ loadSavedMaps function not found');
          }
        }

        if (feature === 'shop') {
          // Initialize shop with items
          console.log('🛒 Initializing shop items...');
          if (typeof window.setupSimpleShop === 'function') {
            window.setupSimpleShop();
          } else if (typeof window.switchShopCategory === 'function') {
            window.switchShopCategory('tanks');
          }
        }

        if (feature === 'locker') {
          // Initialize locker
          if (typeof window.startLockerRendering === 'function') {
            window.startLockerRendering();
          }
        }

        console.log(`✅ Successfully opened ${feature} screen`);
      } else {
        console.error(`❌ Screen element not found: ${screenId}`);
      }
    } else {
      console.error(`❌ Unknown feature: ${feature}`);
    }
  };

  // Team mode dropdown (placeholder)
  window.toggleTeamModeDropdown = () => {
    console.log('Toggle team mode dropdown');
    // TODO: Implement team mode dropdown
  };

  // Debug function for create map issues
  window.debugCreateMap = () => {
    console.log('🔍 Debugging Create Map functionality...');
    
    // Check if createMapScreen exists
    const screen = document.getElementById('createMapScreen');
    console.log('📝 createMapScreen element:', screen);
    
    if (screen) {
      console.log('📝 Screen classes:', screen.className);
      console.log('📝 Screen display style:', screen.style.display);
      console.log('📝 Screen visibility:', screen.style.visibility);
      console.log('📝 Has hidden class:', screen.classList.contains('hidden'));
      
      // Check computed styles
      const computedStyle = window.getComputedStyle(screen);
      console.log('📝 Computed display:', computedStyle.display);
      console.log('📝 Computed visibility:', computedStyle.visibility);
      console.log('📝 Computed z-index:', computedStyle.zIndex);
    }
    
    // Check functions
    const functions = ['openFeature', 'startCreateMapRendering', 'loadSavedMaps', 'openBlankMapCreator'];
    functions.forEach(funcName => {
      const func = window[funcName];
      console.log(`📝 ${funcName}:`, typeof func === 'function' ? '✅ exists' : '❌ missing');
    });
    
    // Check game state
    const gameState = gameStateManager.getGameState();
    console.log('📝 Game state showCreateMap:', gameState.showCreateMap);
    
    return {
      screenExists: !!screen,
      screenVisible: screen && !screen.classList.contains('hidden') && screen.style.display !== 'none',
      functionsExist: {
        openFeature: typeof window.openFeature === 'function',
        startCreateMapRendering: typeof window.startCreateMapRendering === 'function',
        loadSavedMaps: typeof window.loadSavedMaps === 'function'
      }
    };
  };

  // Open map selection modal (Battle Royal / Game Mode Modal)
  window.openBattleRoyal = () => {
    console.log('Opening map selection modal');
    const modal = document.getElementById('gameModeModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'block';

      // Load available maps
      if (typeof window.loadAvailableMaps === 'function') {
        window.loadAvailableMaps();
      } else if (typeof window.loadGameModeMaps === 'function') {
        window.loadGameModeMaps();
      } else {
        // Load created maps from localStorage
        const STORAGE_KEYS = {
          TANK_MAPS: 'thefortz.customMaps',
          JET_MAPS: 'thefortz.jetMaps',
          RACE_MAPS: 'thefortz.raceMaps'
        };

        const vehicleType = gameStateManager.getGameState().selectedVehicleType || 'tank';
        const storageKey = vehicleType === 'jet' ? STORAGE_KEYS.JET_MAPS :
        vehicleType === 'race' ? STORAGE_KEYS.RACE_MAPS :
        STORAGE_KEYS.TANK_MAPS;

        const maps = JSON.parse(localStorage.getItem(storageKey) || '[]');
        console.log(`📍 Loaded ${maps.length} ${vehicleType} maps`);

        // Display maps in the modal
        const mapList = document.getElementById('gameModeList');
        if (mapList) {
          mapList.innerHTML = '';
          if (maps.length === 0) {
            mapList.innerHTML = '<div style="color: white; padding: 20px; text-align: center;">No maps available. Create one first!</div>';
          } else {
            maps.forEach((map, index) => {
              const mapCard = document.createElement('div');
              mapCard.className = 'map-card';
              mapCard.innerHTML = `
                                <div class="map-thumbnail" style="background: linear-gradient(135deg, #1a1a2e, #16213e);">
                                    ${map.thumbnail ? `<img src="${map.thumbnail}" alt="${map.name}">` : '🗺️'}
                                </div>
                                <div class="map-info">
                                    <h3>${map.name || 'Untitled Map'}</h3>
                                    <p>Plays: ${map.plays || 0} | Rating: ${map.rating || 0}⭐</p>
                                </div>
                            `;
              mapCard.onclick = () => {
                window.selectedCreatedMapId = map.id;
                console.log('Selected map:', map.name);
                closeGameModeModal();
              };
              mapList.appendChild(mapCard);
            });
          }
        }
      }
    } else {
      console.warn('⚠️ Game mode modal not found');
    }
  };

  // Party functions
  window.showPartyInviteMenu = () => {
    console.log('Show party invite menu');
    // TODO: Implement party invite menu
  };

  window.kickPartyMember = (slot) => {
    console.log('Kick party member from slot:', slot);
    // TODO: Implement kick party member
  };

  window.leaveParty = () => {
    console.log('Leave party');
    // TODO: Implement leave party
  };

  // Friend functions
  window.acceptFriendRequest = (username) => {
    console.log('Accept friend request from:', username);
    // TODO: Implement accept friend request
  };

  window.declineFriendRequest = (username) => {
    console.log('Decline friend request from:', username);
    // TODO: Implement decline friend request
  };

  window.inviteFriend = (username) => {
    console.log('Invite friend:', username);
    // TODO: Implement invite friend
  };

  window.messageFriend = (username) => {
    console.log('Message friend:', username);
    // TODO: Implement message friend
  };

  window.spectateFriend = (username) => {
    console.log('Spectate friend:', username);
    // TODO: Implement spectate friend
  };

  // Shop functions
  window.switchShopCategory = (category) => {
    console.log('Switch shop category:', category);
    document.querySelectorAll('.shop-category-tab').forEach((tab) => {
      tab.classList.remove('active');
      if (tab.dataset.category === category) {
        tab.classList.add('active');
      }
    });
    // TODO: Load shop items for category
  };

  // Locker functions
  window.scrollLockerItems = (direction) => {
    console.log('Scroll locker items:', direction);
    // TODO: Implement locker scroll
  };

  window.selectLockerItem = () => {
    console.log('Select locker item');
    // TODO: Implement select locker item
  };

  window.openCustomizationPanel = (type) => {
    console.log('Open customization panel:', type);
    // TODO: Implement customization panel
  };

  // Game mode functions
  window.selectTeamMode = (mode) => {
    console.log('Select team mode:', mode);
    document.querySelectorAll('.team-mode-btn').forEach((btn) => {
      btn.classList.remove('active');
    });
    document.querySelector(`[onclick*="${mode}"]`)?.classList.add('active');
    // TODO: Update game mode
  };

  window.scrollGameModeList = (direction) => {
    console.log('Scroll game mode list:', direction);
    // TODO: Implement game mode scroll
  };

  window.closeGameModeModal = () => {
    console.log('Close game mode modal');
    const modal = document.getElementById('gameModesScreen');
    if (modal) modal.classList.add('hidden');
  };

  window.closeStatsBox = () => {
    console.log('Close stats box');
    // TODO: Implement close stats box
  };

  // Champions/tabs functions
  window.switchChampionsTab = (tab) => {
    console.log('Switch champions tab:', tab);
    document.querySelectorAll('.champions-tab').forEach((t) => t.classList.remove('active'));
    document.querySelector(`[onclick*="${tab}"]`)?.classList.add('active');
    // TODO: Load champions tab content
  };

  // Game functions
  window.respawnPlayer = () => {
    console.log('Respawn player');
    // TODO: Implement respawn
  };

  // Map search functionality
  let allMaps = [];

  window.initializeMapSearch = () => {
    const searchInput = document.getElementById('gameModeSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterMaps(searchTerm);
      });
    }
  };

  function filterMaps(searchTerm) {
    const mapList = document.getElementById('gameModeList');
    if (!mapList) return;

    const filteredMaps = allMaps.filter((map) =>
    (map.name || '').toLowerCase().includes(searchTerm) ||
    (map.description || '').toLowerCase().includes(searchTerm)
    );

    displayMaps(filteredMaps);
  }

  function displayMaps(maps) {
    const mapList = document.getElementById('gameModeList');
    if (!mapList) return;

    mapList.innerHTML = '';

    if (maps.length === 0) {
      mapList.innerHTML = '<div style="color: white; padding: 20px; text-align: center;">No maps found</div>';
      return;
    }

    maps.forEach((map, index) => {
      const mapCard = document.createElement('div');
      mapCard.className = 'map-card';
      mapCard.style.cssText = `
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 2px solid rgba(0, 247, 255, 0.3);
                border-radius: 12px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s;
                margin: 10px;
                min-width: 200px;
            `;

      mapCard.innerHTML = `
                <div class="map-thumbnail" style="
                    width: 100%;
                    height: 120px;
                    border-radius: 8px;
                    overflow: hidden;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #0a0e27, #1a1a2e);
                ">
                    ${map.thumbnail ?
      `<img src="${map.thumbnail}" alt="${map.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
      '<span style="font-size: 48px;">🗺️</span>'}
                </div>
                <div class="map-info" style="color: white;">
                    <h3 style="margin: 5px 0; font-size: 16px; color: #00f7ff;">${
      map.name || 'Untitled Map'}</h3>
                    <p style="margin: 5px 0; font-size: 12px; color: rgba(255,255,255,0.7);">
                        👥 ${map.maxPlayers || 10} players | 
                        🎮 ${map.plays || 0} plays
                    </p>
                    <p style="margin: 5px 0; font-size: 12px; color: #FFD700;">
                        ⭐ ${map.rating || 0}/5
                    </p>
                </div>
            `;

      // Hover effect
      mapCard.addEventListener('mouseenter', () => {
        mapCard.style.borderColor = '#00f7ff';
        mapCard.style.transform = 'scale(1.05)';
        mapCard.style.boxShadow = '0 0 20px rgba(0, 247, 255, 0.5)';
      });

      mapCard.addEventListener('mouseleave', () => {
        mapCard.style.borderColor = 'rgba(0, 247, 255, 0.3)';
        mapCard.style.transform = 'scale(1)';
        mapCard.style.boxShadow = 'none';
      });

      // Click to select map
      mapCard.onclick = () => {
        window.selectedCreatedMapId = map.id;
        console.log('✅ Selected map:', map.name);

        // Highlight selected map
        document.querySelectorAll('.map-card').forEach((card) => {
          card.style.borderColor = 'rgba(0, 247, 255, 0.3)';
        });
        mapCard.style.borderColor = '#00ff00';

        // Close modal after short delay
        setTimeout(() => {
          closeGameModeModal();
        }, 300);
      };

      mapList.appendChild(mapCard);
    });
  }

  // Update openBattleRoyal to use the new display function
  const originalOpenBattleRoyal = window.openBattleRoyal;
  window.openBattleRoyal = () => {
    console.log('Opening map selection modal');
    const modal = document.getElementById('gameModeModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'block';

      // Load maps
      const STORAGE_KEYS = {
        TANK_MAPS: 'thefortz.customMaps',
        JET_MAPS: 'thefortz.jetMaps',
        RACE_MAPS: 'thefortz.raceMaps'
      };

      const vehicleType = gameStateManager.getGameState().selectedVehicleType || 'tank';
      const storageKey = vehicleType === 'jet' ? STORAGE_KEYS.JET_MAPS :
      vehicleType === 'race' ? STORAGE_KEYS.RACE_MAPS :
      STORAGE_KEYS.TANK_MAPS;

      allMaps = JSON.parse(localStorage.getItem(storageKey) || '[]');
      console.log(`📍 Loaded ${allMaps.length} ${vehicleType} maps`);

      displayMaps(allMaps);

      // Initialize search
      window.initializeMapSearch();
    } else {
      console.warn('⚠️ Game mode modal not found');
    }
  };
}