/**
 * Player-Created Map Loader for TheFortz
 * Loads player-created maps from Create Map section into actual gameplay
 */

// Function to get all player-created maps
function getPlayerCreatedMaps() {
    try {
        const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
        console.log(`📦 Found ${maps.length} player-created maps`);
        return maps;
    } catch (error) {
        console.error('Error loading player maps:', error);
        return [];
    }
}

// Function to get a random player-created map
function getRandomPlayerMap() {
    const maps = getPlayerCreatedMaps();

    if (maps.length === 0) {
        console.log('⚠️ No player-created maps found');
        return null;
    }

    // Select a random map
    const randomIndex = Math.floor(Math.random() * maps.length);
    const selectedMap = maps[randomIndex];

    console.log(`🎲 Selected random map: ${selectedMap.name}`);
    return selectedMap;
}

// Function to load a player-created map into the game
function loadPlayerMapIntoGame(mapData) {
    if (!mapData) {
        console.log('No map data provided');
        return false;
    }

    console.log(`🗺️ Loading player map: ${mapData.name}`);

    // Store the map data globally so the game can access it
    window.currentPlayerMap = {
        name: mapData.name,
        objects: mapData.objects || [],
        groundTiles: mapData.groundTiles || {},
        created: mapData.created,
        thumbnail: mapData.thumbnail
    };

    // Update the play button text to show the map name
    const playButtonMapName = document.getElementById('playButtonMapName');
    if (playButtonMapName) {
        playButtonMapName.textContent = mapData.name.toUpperCase();
    }

    console.log(`✅ Map loaded: ${mapData.name}`);
    console.log(`📦 Objects: ${mapData.objects?.length || 0}`);

    return true;
}

// Function to apply player-created map to game state
function applyPlayerMapToGame(gameState) {
    if (!window.currentPlayerMap) {
        console.log('No player map to apply');
        return;
    }

    const map = window.currentPlayerMap;
    console.log('🎮 Applying player map to game state...');

    // Convert map objects to game walls/obstacles
    if (map.objects && map.objects.length > 0) {
        gameState.walls = gameState.walls || [];

        map.objects.forEach(obj => {
            // Convert placed objects to walls
            gameState.walls.push({
                x: obj.x,
                y: obj.y,
                width: obj.width || 50,
                height: obj.height || 50,
                type: obj.type || 'wall',
                asset: obj.asset
            });
        });

        console.log(`✅ Added ${map.objects.length} obstacles to game`);
    }

    // Generate spawn points if not already set
    if (!gameState.spawnPoints || gameState.spawnPoints.length === 0) {
        gameState.spawnPoints = generateSpawnPoints(gameState);
        console.log(`✅ Generated ${gameState.spawnPoints.length} spawn points`);
    }

    // Store map info
    gameState.currentMap = {
        name: map.name,
        isPlayerCreated: true,
        created: map.created
    };

    console.log(`✅ Player map "${map.name}" applied to game!`);
}

// Helper function to generate spawn points
function generateSpawnPoints(gameState) {
    const spawnPoints = [];
    const mapWidth = gameState.gameWidth || 7500;
    const mapHeight = gameState.gameHeight || 7500;
    const numSpawns = 12;
    const minDistance = 500; // Minimum distance between spawns

    for (let i = 0; i < numSpawns; i++) {
        let attempts = 0;
        let validSpawn = false;
        let x, y;

        while (!validSpawn && attempts < 50) {
            x = Math.random() * (mapWidth - 200) + 100;
            y = Math.random() * (mapHeight - 200) + 100;

            // Check distance from other spawns
            validSpawn = true;
            for (const spawn of spawnPoints) {
                const dx = x - spawn.x;
                const dy = y - spawn.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance) {
                    validSpawn = false;
                    break;
                }
            }

            // Check if not inside a wall
            if (validSpawn && gameState.walls) {
                for (const wall of gameState.walls) {
                    if (x >= wall.x && x <= wall.x + wall.width &&
                        y >= wall.y && y <= wall.y + wall.height) {
                        validSpawn = false;
                        break;
                    }
                }
            }

            attempts++;
        }

        if (validSpawn) {
            spawnPoints.push({ x, y });
        }
    }

    return spawnPoints;
}

// Helper function to get saved maps
function getSavedMaps() {
    try {
        return JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
    } catch {
        return [];
    }
}

function quickPlayFFAWithPlayerMap() {
    console.log('🎮 Starting game with player-created map...');

    // Try to load a random player map
    const randomMap = getRandomPlayerMap();

    if (randomMap) {
        // Load the map
        loadPlayerMapIntoGame(randomMap);

        // Show notification if available
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.show(
                `Loading ${randomMap.name}`,
                'INFO',
                { duration: 3000 }
            );
        }
    } else {
        console.log('⚠️ No player maps available, using default map');

        // Reset to default text
        const playButtonMapName = document.getElementById('playButtonMapName');
        if (playButtonMapName) {
            playButtonMapName.textContent = 'FREE FOR ALL';
        }
    }

    // Call original function
    if (typeof originalQuickPlayFFA === 'function') {
        originalQuickPlayFFA();
    } else {
        console.error('Original quickPlayFFA function not found!');
    }
}

// Override the quickPlayFFA function
if (typeof window !== 'undefined') {
    // Store original if it exists
    if (typeof window.quickPlayFFA === 'function') {
        window.originalQuickPlayFFA = window.quickPlayFFA;
    }

    // Replace with our enhanced version
    window.quickPlayFFA = quickPlayFFAWithPlayerMap;
}

// Hook into game initialization
const originalInitGame = window.initGame;
if (typeof originalInitGame === 'function') {
    window.initGame = function (...args) {
        const result = originalInitGame.apply(this, args);

        // Apply player map if available
        if (window.gameState && window.currentPlayerMap) {
            applyPlayerMapToGame(window.gameState);
        }

        return result;
    };
}

// Export functions
if (typeof window !== 'undefined') {
    window.getPlayerCreatedMaps = getPlayerCreatedMaps;
    window.getRandomPlayerMap = getRandomPlayerMap;
    window.loadPlayerMapIntoGame = loadPlayerMapIntoGame;
    window.applyPlayerMapToGame = applyPlayerMapToGame;
}

console.log('🎲 Player-Created Map Loader initialized!');
console.log('💡 Create maps in "Create Map" section, then click Play to use them!');
