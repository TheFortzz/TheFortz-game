/**
 * Main Game Coordinator
 * This file orchestrates the game systems and handles initialization
 * All implementation details are delegated to specialized modules
 * 
 * Module Loading Order:
 * 1. Configuration (Config.js) - No dependencies
 * 2. Core modules (GameState, ImageLoader, GameLoop) - Depend on Config
 * 3. Systems (Input, Network, Particle, Weapon, Physics, Render) - Depend on Core
 * 4. Entities (Player, Tank, Bullet) - Depend on Config
 * 5. UI modules (Lobby, Shop, Locker) - Depend on Core and Systems
 */

// Import configuration (no dependencies)
import { STORAGE_KEYS } from './core/Config.js';

// Import core modules (depend on Config only)
import gameStateManager from './core/GameState.js';
import imageLoader from './assets/ImageLoader.js';
import GameLoop from './core/GameLoop.js';

// Import systems (depend on Core modules)
import InputSystem from './systems/InputSystem.js';
import NetworkSystem from './systems/NetworkSystem.js';
import ParticleSystem from './systems/ParticleSystem.js';
import WeaponSystem from './systems/WeaponSystem.js';
import PhysicsSystem from './systems/PhysicsSystem.js';
import RenderSystem from './systems/RenderSystem.js';

// Import entity modules (depend on Config)
import Player from './entities/Player.js';
import Tank from './entities/Tank.js';
import Bullet from './entities/Bullet.js';

// Import UI modules (depend on Core and Systems)
import lobbyUI from './ui/LobbyUI.js';
import lockerUI from './ui/LockerUI.js';

// Get centralized game state
const gameState = gameStateManager.getGameState();

// Initialize systems
const inputSystem = new InputSystem();
const networkSystem = new NetworkSystem(gameStateManager);
const physicsSystem = new PhysicsSystem(gameStateManager.getGameState());

// Systems that require canvas (initialized later)
let particleSystem = null;
let weaponSystem = null;
let renderSystem = null;
let gameLoop = null;

// Canvas references
let canvas, ctx, minimapCanvas, minimapCtx;

// Expose systems globally for backward compatibility
if (typeof window !== 'undefined') {
    window.gameState = gameState;
    window.inputSystem = inputSystem;
    window.networkSystem = networkSystem;
    window.physicsSystem = physicsSystem;
    
    // UI modules
    window.lobbyUI = lobbyUI;
    window.lockerUI = lockerUI;
    
    // Entity classes
    window.Player = Player;
    window.Tank = Tank;
    window.Bullet = Bullet;
    
    // Image loader functions
    window.renderTankOnCanvas = (canvasId, tankConfig, options) => {
        return imageLoader.renderTankOnCanvas(canvasId, tankConfig, options);
    };
    window.renderJetOnCanvas = (canvasId, jetConfig, options) => {
        return imageLoader.renderJetOnCanvas(canvasId, jetConfig, options);
    };
    window.renderRaceOnCanvas = (canvasId, raceConfig, options) => {
        return imageLoader.renderRaceOnCanvas(canvasId, raceConfig, options);
    };
}

/**
 * Initialize the game
 */
function initializeGame() {
    // Get canvas elements
    canvas = document.getElementById('gameCanvas');
    minimapCanvas = document.getElementById('minimapCanvas');
    
    if (canvas) {
        ctx = canvas.getContext('2d');
        
        // Initialize canvas-dependent systems
        particleSystem = new ParticleSystem(gameState, canvas, ctx);
        weaponSystem = new WeaponSystem(gameState, networkSystem, particleSystem, imageLoader);
        
        // Expose to window for backward compatibility
        window.particleSystem = particleSystem;
        window.weaponSystem = weaponSystem;
    }
    
    if (minimapCanvas) {
        minimapCtx = minimapCanvas.getContext('2d');
    }
    
    // Initialize render system
    renderSystem = new RenderSystem(gameState, canvas, ctx, minimapCanvas, minimapCtx);
    window.renderSystem = renderSystem;
    
    // Resize canvas
    if (renderSystem) {
        renderSystem.resizeCanvas();
    }
    
    // Connect to server
    if (!gameState.isConnected) {
        const gameMode = gameState.selectedGameMode || 'ffa';
        networkSystem.connectToServer(gameMode);
    }
    
    // Initialize input system
    inputSystem.initialize();
    
    // Create and start game loop
    gameLoop = new GameLoop(gameState, {
        inputSystem,
        physicsSystem,
        particleSystem,
        weaponSystem,
        renderSystem
    });
    gameLoop.start();
    
    // Trigger CrazyGames gameplay start event
    if (window.CrazyGamesIntegration) {
        window.CrazyGamesIntegration.gameplayStart();
    }
}

/**
 * Join game - transition from lobby to game
 */
function joinGame() {
    // Show loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
    
    // Close shop if open
    if (gameState.showShop) {
        gameStateManager.updateGameState({ showShop: false });
    }
    
    // Animate lobby screen out
    document.getElementById('lobbyScreen').style.animation = 'fadeOut 0.5s ease-out';
    
    setTimeout(() => {
        // Hide lobby elements
        const lobbyScreen = document.getElementById('lobbyScreen');
        if (lobbyScreen) {
            lobbyScreen.classList.add('hidden');
            lobbyScreen.style.display = 'none';
        }
        
        // Show game elements
        document.getElementById('gameMapArea').classList.remove('hidden');
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('scoreProgressContainer').classList.remove('hidden');
        document.getElementById('centerBottomBoxes').classList.remove('hidden');
        
        gameStateManager.updateGameState({ isInLobby: false });
        
        // Load selected map
        if (window.selectedCreatedMapId && window.MapRenderer) {
            window.MapRenderer.loadById(window.selectedCreatedMapId);
        } else if (window.DOMMapRenderer?.currentMap && window.MapRenderer) {
            window.MapRenderer.loadMap(window.DOMMapRenderer.currentMap);
        }
        
        // Show game canvas
        setTimeout(() => {
            const gameCanvas = document.getElementById('gameCanvas');
            if (gameCanvas) {
                gameCanvas.style.display = 'block';
            }
        }, 100);
        
        initializeGame();
    }, 500);
}

// Expose joinGame globally
window.joinGame = joinGame;

// Initialize image loading
imageLoader.initializeTankImages();

// Set up image loading completion callback
if (typeof window !== 'undefined') {
    window.onImageLoadingComplete = () => {
        console.log('🎮 Images loaded - rendering lobby');
        
        // Render tank in lobby
        if (typeof renderTankOnCanvas === 'function' && gameState.selectedTank) {
            renderTankOnCanvas('playerTankCanvas', gameState.selectedTank);
        }
        
        // Start lobby animations
        if (typeof animateLobbyTanks === 'function') {
            animateLobbyTanks();
        }
        
        // Initialize lobby background
        if (typeof initializeLobbyBackground === 'function') {
            const allMaps = JSON.parse(localStorage.getItem(STORAGE_KEYS.TANK_MAPS) || '[]');
            const tankMaps = allMaps.filter(map => !map.vehicleType || map.vehicleType === 'tank');
            
            if (tankMaps.length > 0) {
                initializeLobbyBackground();
            }
        }
    };
}

// Handle window resize
window.addEventListener('resize', () => {
    if (renderSystem) {
        renderSystem.resizeCanvas();
    }
    
    if (gameState.isInLobby && lobbyUI) {
        lobbyUI.renderLobbyBackground();
    }
});

// Clean up old maps with broken paths (runs once on load)
(function cleanupOldMaps() {
    try {
        // Clean race maps with old paths
        const raceMapsKey = STORAGE_KEYS.RACE_MAPS;
        const raceMaps = JSON.parse(localStorage.getItem(raceMapsKey) || '[]');
        if (raceMaps.length > 0) {
            const hasOldPaths = raceMaps.some(m => 
                JSON.stringify(m).includes('spr_car_') || 
                JSON.stringify(m).includes('spr_Track') ||
                JSON.stringify(m).includes('spr_tile_') ||
                JSON.stringify(m).includes('spr_house') ||
                JSON.stringify(m).includes('-4')
            );
            if (hasOldPaths) {
                localStorage.removeItem(raceMapsKey);
                console.log('🧹 Cleared old race maps with broken paths');
            }
        }
        
        // Clean tank maps with old broken paths
        const tankMapsKey = STORAGE_KEYS.TANK_MAPS;
        const tankMaps = JSON.parse(localStorage.getItem(tankMapsKey) || '[]');
        if (tankMaps.length > 0) {
            const mapStr = JSON.stringify(tankMaps);
            const hasOldGroundPaths = mapStr.includes('_Group_') || 
                                       /ground_\d+\.png/.test(mapStr) ||
                                       (mapStr.includes('Grounds/') && !mapStr.includes('/assets/tank/Grounds/'));
            if (hasOldGroundPaths) {
                localStorage.removeItem(tankMapsKey);
                console.log('🧹 Cleared old tank maps with broken ground paths');
            }
        }
    } catch (e) {
        console.warn('Failed to cleanup old maps:', e);
    }
})();

console.log('🚀 Game coordinator initialized');

// ===== MISSING FUNCTION IMPLEMENTATIONS =====
// These functions are called by HTML event handlers but were missing

/**
 * Show party invite menu
 * Called by party invite buttons in the lobby
 */
function showPartyInviteMenu() {
    console.log('🎉 Party invite menu requested');
    
    // TODO: Implement party invite functionality
    // For now, show a placeholder alert
    alert('Party invite feature coming soon! This will allow you to invite friends to join your party.');
    
    // Future implementation should:
    // 1. Show a modal with friend list
    // 2. Allow selecting friends to invite
    // 3. Send party invitations
    // 4. Handle invite responses
}

/**
 * Select vehicle type (jet, tank, race)
 * Called by vehicle selection buttons in the lobby
 */
function selectVehicleType(vehicleType) {
    console.log(`🚗 Vehicle type selected: ${vehicleType}`);
    
    // Update game state
    if (gameState) {
        gameState.selectedVehicleType = vehicleType;
    }
    
    // Update UI to show selected vehicle
    const buttons = document.querySelectorAll('.vehicle-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const selectedBtn = document.getElementById(`${vehicleType}Btn`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // Update any vehicle-specific UI elements
    updateVehicleUI(vehicleType);
    
    console.log(`✅ Vehicle type set to: ${vehicleType}`);
}

/**
 * Update UI based on selected vehicle type
 */
function updateVehicleUI(vehicleType) {
    // Update vehicle indicator if it exists
    const indicator = document.getElementById('vehicleTypeIndicator');
    if (indicator) {
        indicator.textContent = vehicleType.toUpperCase();
    }
    
    // Update any vehicle-specific elements
    const vehicleElements = document.querySelectorAll('[data-vehicle]');
    vehicleElements.forEach(element => {
        const elementVehicle = element.getAttribute('data-vehicle');
        if (elementVehicle === vehicleType) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
}

/**
 * OLD SHOP FUNCTION - DISABLED
 * Shop category switching now handled by Figma shop in missingHandlers.js
 */
// function switchShopCategory - REMOVED to prevent conflicts with Figma shop

/**
 * Switch champions tab
 * Called by champions leaderboard tab buttons
 */
function switchChampionsTab(tabName) {
    console.log(`🏆 Champions tab switched to: ${tabName}`);
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('[id^="tab"]');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeTab = document.getElementById(`tab${tabName}`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Update tab content
    const tabContents = document.querySelectorAll('.champions-tab-content');
    tabContents.forEach(content => {
        const contentTab = content.getAttribute('data-tab');
        if (contentTab === tabName) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });
    
    // Load tab-specific data
    loadChampionsData(tabName);
}

/**
 * Load champions data for specific tab
 */
function loadChampionsData(tabName) {
    // TODO: Implement actual data loading
    console.log(`📊 Loading champions data for: ${tabName}`);
    
    // Placeholder implementation
    const contentArea = document.querySelector(`[data-tab="${tabName}"]`);
    if (contentArea) {
        contentArea.innerHTML = `<p>Loading ${tabName} data...</p>`;
        
        // Simulate loading
        setTimeout(() => {
            contentArea.innerHTML = `<p>${tabName} data loaded successfully!</p>`;
        }, 1000);
    }
}

/**
 * Switch friends tab
 * Called by friends system tab buttons
 */
function switchFriendsTab(tabName) {
    console.log(`👥 Friends tab switched to: ${tabName}`);
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.friends-tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the clicked button
    const activeBtn = document.querySelector(`[onclick*="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Update tab content
    const tabContents = document.querySelectorAll('.friends-tab-content');
    tabContents.forEach(content => {
        const contentTab = content.getAttribute('data-tab');
        if (contentTab === tabName) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });
}

/**
 * Scroll locker items
 * Called by locker scroll buttons
 */
function scrollLockerItems(direction) {
    console.log(`📦 Scrolling locker items: ${direction}`);
    
    // Use locker UI if available
    if (window.lockerUI && typeof window.lockerUI.scroll === 'function') {
        window.lockerUI.scroll(direction);
    } else {
        // Fallback implementation
        const container = document.querySelector('.locker-items-container');
        if (container) {
            const scrollAmount = 200;
            const currentScroll = container.scrollLeft;
            
            if (direction === 'left') {
                container.scrollLeft = currentScroll - scrollAmount;
            } else if (direction === 'right') {
                container.scrollLeft = currentScroll + scrollAmount;
            }
        }
    }
}

/**
 * Select locker item
 * Called by locker item selection button
 */
function selectLockerItem(itemId) {
    console.log(`📦 Locker item selected: ${itemId || 'current'}`);
    
    // Use locker UI if available
    if (window.lockerUI && typeof window.lockerUI.selectItem === 'function') {
        window.lockerUI.selectItem(itemId);
    } else {
        // Fallback implementation
        console.log('Locker UI not available, using fallback');
        alert('Item selected! This will be implemented with the full locker system.');
    }
}

/**
 * Respawn player
 * Called by respawn button in game
 */
function respawnPlayer() {
    console.log('💀 Player respawn requested');
    
    // Check if player can respawn
    if (gameState && gameState.gameMode === 'playing') {
        // Reset player state
        if (gameState.player) {
            gameState.player.health = 100;
            gameState.player.isDead = false;
            
            // Reset position to spawn point
            const spawnPoint = getRandomSpawnPoint();
            if (spawnPoint) {
                gameState.player.x = spawnPoint.x;
                gameState.player.y = spawnPoint.y;
            }
            
            console.log('✅ Player respawned successfully');
        }
        
        // Hide respawn UI
        const respawnBtn = document.getElementById('respawnBtn');
        if (respawnBtn) {
            respawnBtn.style.display = 'none';
        }
    } else {
        console.log('❌ Cannot respawn - not in game mode');
    }
}

/**
 * Get random spawn point
 * Helper function for respawning
 */
function getRandomSpawnPoint() {
    // Default spawn points - should be loaded from map data
    const defaultSpawns = [
        { x: 100, y: 100 },
        { x: 200, y: 200 },
        { x: 300, y: 300 }
    ];
    
    return defaultSpawns[Math.floor(Math.random() * defaultSpawns.length)];
}

/**
 * Filter friends list
 * Called by friend search input
 */
function filterFriends(searchTerm) {
    console.log(`🔍 Filtering friends: ${searchTerm || 'all'}`);
    
    const searchInput = document.getElementById('friendSearchInput');
    const actualSearchTerm = searchTerm || (searchInput ? searchInput.value : '');
    
    // Get all friend items
    const friendItems = document.querySelectorAll('.friend-item');
    
    friendItems.forEach(item => {
        const friendName = item.querySelector('.friend-name');
        if (friendName) {
            const name = friendName.textContent.toLowerCase();
            const matches = name.includes(actualSearchTerm.toLowerCase());
            
            item.style.display = matches ? 'block' : 'none';
        }
    });
    
    console.log(`📋 Filtered friends list for: "${actualSearchTerm}"`);
}

/**
 * Friend interaction functions
 */
function inviteFriend(friendId) {
    console.log(`📧 Inviting friend: ${friendId || 'unknown'}`);
    alert('Friend invite sent! This feature will be fully implemented with the social system.');
}

function messageFriend(friendId) {
    console.log(`💬 Messaging friend: ${friendId || 'unknown'}`);
    alert('Opening message with friend! This feature will be fully implemented with the chat system.');
}

function spectateFriend(friendId) {
    console.log(`👀 Spectating friend: ${friendId || 'unknown'}`);
    alert('Spectating friend! This feature will be fully implemented with the spectator system.');
}

function declineFriendRequest(requestId) {
    console.log(`❌ Declining friend request: ${requestId || 'unknown'}`);
    alert('Friend request declined! This feature will be fully implemented with the social system.');
}

/**
 * Game mode functions
 */
function closeGameModeModal() {
    console.log('❌ Closing game mode modal');
    
    const modal = document.querySelector('.game-mode-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function scrollGameModeList(direction) {
    console.log(`📜 Scrolling game mode list: ${direction}`);
    
    const container = document.querySelector('.game-mode-list');
    if (container) {
        const scrollAmount = 150;
        const currentScroll = container.scrollTop;
        
        if (direction === 'up') {
            container.scrollTop = currentScroll - scrollAmount;
        } else if (direction === 'down') {
            container.scrollTop = currentScroll + scrollAmount;
        }
    }
}

function toggleTeamModeDropdown() {
    console.log('🔽 Toggling team mode dropdown');
    
    const dropdown = document.querySelector('.team-mode-dropdown');
    if (dropdown) {
        const isVisible = dropdown.style.display === 'block';
        dropdown.style.display = isVisible ? 'none' : 'block';
    }
}

function selectTeamMode(mode) {
    console.log(`👥 Team mode selected: ${mode}`);
    
    // Update game state
    if (gameState) {
        gameState.teamMode = mode;
    }
    
    // Update UI
    const modeDisplay = document.querySelector('.selected-team-mode');
    if (modeDisplay) {
        modeDisplay.textContent = mode;
    }
    
    // Hide dropdown
    toggleTeamModeDropdown();
}

function openBattleRoyal() {
    console.log('👑 Opening Battle Royal mode');
    alert('Battle Royal mode coming soon! This will be an epic multiplayer experience.');
}

// Make functions globally available for HTML event handlers
window.showPartyInviteMenu = showPartyInviteMenu;
window.selectVehicleType = selectVehicleType;
window.switchShopCategory = switchShopCategory;
window.switchChampionsTab = switchChampionsTab;
window.switchFriendsTab = switchFriendsTab;
window.scrollLockerItems = scrollLockerItems;
window.selectLockerItem = selectLockerItem;
window.respawnPlayer = respawnPlayer;
window.filterFriends = filterFriends;
window.inviteFriend = inviteFriend;
window.messageFriend = messageFriend;
window.spectateFriend = spectateFriend;
window.declineFriendRequest = declineFriendRequest;
window.closeGameModeModal = closeGameModeModal;
window.scrollGameModeList = scrollGameModeList;
window.toggleTeamModeDropdown = toggleTeamModeDropdown;
window.selectTeamMode = selectTeamMode;
window.openBattleRoyal = openBattleRoyal;
