// Lobby background rendering - Water background with isometric tiles
function renderLobbyBackground() {
    const lobbyCanvas = document.getElementById('lobbyBackground');
    if (!lobbyCanvas) return;

    const ctx = lobbyCanvas.getContext('2d');

    // Set canvas size to match window
    lobbyCanvas.width = window.innerWidth;
    lobbyCanvas.height = window.innerHeight;

    // Fill with dark background first
    ctx.fillStyle = '#0a1a2a';
    ctx.fillRect(0, 0, lobbyCanvas.width, lobbyCanvas.height);

    // Draw water background
    drawLobbyWaterBackground(ctx, lobbyCanvas.width, lobbyCanvas.height);
}

function drawLobbyWaterBackground(ctx, canvasWidth, canvasHeight) {
    const tileWidth = 120;
    const tileHeight = 30;
    const drawHeight = 70;

    // Calculate tile range to cover the entire canvas
    const tilesX = Math.ceil(canvasWidth / tileWidth) + 2;
    const tilesY = Math.ceil(canvasHeight / tileHeight) + 4;

    // Draw water tiles
    for (let row = -tilesY; row <= tilesY; row++) {
        for (let col = -tilesX; col <= tilesX; col++) {
            const isoX = col * tileWidth + (row % 2) * (tileWidth / 2) + canvasWidth / 2;
            const isoY = row * tileHeight + canvasHeight / 2;

            // Draw water tile
            drawLobbyWaterTile(ctx, isoX, isoY, tileWidth, drawHeight);
        }
    }
}

function drawLobbyWaterTile(ctx, x, y, width, height) {
    // Isometric diamond points
    const top = { x: x + width / 2, y: y };
    const right = { x: x + width, y: y + height / 2 };
    const bottom = { x: x + width / 2, y: y + height };
    const left = { x: x, y: y + height / 2 };

    // Enhanced water gradient with vibrant colors
    const gradient = ctx.createLinearGradient(left.x, top.y, right.x, bottom.y);
    gradient.addColorStop(0, '#4a9ad8');    // Brighter blue (top-left, lit by sun)
    gradient.addColorStop(0.3, '#3a8ac8');  // Medium blue
    gradient.addColorStop(0.7, '#2a7ab8');  // Darker blue
    gradient.addColorStop(1, '#1a6aa8');    // Deep blue (bottom-right, shadow)

    // Draw the water diamond
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.lineTo(left.x, left.y);
    ctx.closePath();
    ctx.fill();

    // Enhanced border for better definition
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Bright highlight on top-left edge (sun reflection)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(left.x, left.y);
    ctx.stroke();

    // Secondary highlight (water shimmer)
    ctx.strokeStyle = 'rgba(150, 200, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(top.x + 2, top.y + 2);
    ctx.lineTo(left.x + 4, left.y);
    ctx.stroke();

    // Deep shadow on bottom-right edge
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(right.x, right.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.stroke();

    // Add subtle inner glow for water depth
    ctx.save();
    ctx.globalAlpha = 0.2;
    const centerX = (left.x + right.x) / 2;
    const centerY = (top.y + bottom.y) / 2;
    const radialGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.4);
    radialGradient.addColorStop(0, 'rgba(120, 200, 255, 0.4)');
    radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGradient;
    ctx.fill();
    ctx.restore();
}

// Call this when entering lobby
if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
        if (gameState.isInLobby) {
            renderLobbyBackground();
        }
    });
}


// Game state variables
let socket = null;
let socketInterval = null; // Interval for sending movement updates
let socketIntervalTime = 33; // Time in ms between movement updates (30 updates per second)
let socketIntervalId = null; // ID for the movement update interval

let gameState = {
    isInLobby: true,
    isConnected: false,
    playerId: null,
    clientId: null, // Will be set when we receive it from server
    players: {},
    shapes: [],
    walls: [],
    bullets: [],
    gameWidth: 7500,
    gameHeight: 7500,
    camera: { x: 0, y: 0, zoom: 1 }, // Camera starts at center (0,0)
    keys: {},
    mouse: { x: 0, y: 0, angle: 0 },
    shapeSpawnTimers: {}, // Track respawn timers for shapes
    fortzCurrency: 0, // Track earned Fortz currency
    selectedVehicleType: 'tank', // Default to tank
    selectedTank: {
        color: 'blue',
        body: 'body_halftrack',
        weapon: 'turret_01_mk1'
    },
    showShop: false,
    showLocker: false,
    showSettings: false,
    showGameModes: false,
    selectedGameMode: 'ffa',
    selectedMap: null,
    ownedItems: {
        colors: ['blue'],
        bodies: ['body_halftrack'],
        weapons: ['turret_01_mk1']
    },
    settings: {
        sound: { master: 75, effects: 75, music: 50 },
        graphics: { quality: 'high', particles: true, shadows: true },
        controls: { moveUp: 'w', moveDown: 's', moveLeft: 'a', moveRight: 'd', shoot: 'mouse', sprint: 'shift' }
    }
};



// Expose gameState globally for animation system (after declaration)
window.gameState = gameState;

// Canvas and rendering
let canvas, ctx, minimapCanvas, minimapCtx;


// Weather and environmental effects
let weatherSystem = {
    active: false,
    type: 'none', // 'rain', 'snow', 'fog', 'storm'
    intensity: 0,
    particles: [],
    windX: 0,
    windY: 0
};

// Sound system (placeholder for future implementation)
const soundSystem = {
    enabled: true,
    play: function (soundName) {
        if (!this.enabled) return;
        // Future: Play sound effects here
        // Examples: 'shoot', 'hit', 'explosion', 'powerup'
    }
};

function createWeatherParticle(type) {
    const particle = {
        x: Math.random() * (canvas.width + 200) - 100,
        y: -20,
        vx: weatherSystem.windX,
        vy: 2 + Math.random() * 3,
        size: type === 'snow' ? 2 + Math.random() * 3 : 1 + Math.random() * 2,
        life: 1,
        type: type
    };

    if (type === 'rain') {
        particle.vy = 8 + Math.random() * 4;
        particle.size = 1 + Math.random();
    }

    weatherSystem.particles.push(particle);
}

function updateWeatherSystem() {
    if (!weatherSystem.active) return;

    // Create new particles
    const particleCount = weatherSystem.intensity * 3;
    for (let i = 0; i < particleCount; i++) {
        if (weatherSystem.particles.length < 500) {
            createWeatherParticle(weatherSystem.type);
        }
    }

    // Update particles
    weatherSystem.particles = weatherSystem.particles.filter(p => {
        p.x += p.vx + gameState.camera.x * 0.01;
        p.y += p.vy;

        if (p.y > canvas.height + 20 || p.x < -100 || p.x > canvas.width + 100) {
            return false;
        }

        return true;
    });
}

function drawWeatherEffects() {
    if (!weatherSystem.active || weatherSystem.particles.length === 0) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Screen coordinates

    weatherSystem.particles.forEach(p => {
        ctx.globalAlpha = 0.6;

        if (p.type === 'rain') {
            ctx.strokeStyle = 'rgba(100, 150, 200, 0.5)';
            ctx.lineWidth = p.size;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2);
            ctx.stroke();
        } else if (p.type === 'snow') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    ctx.restore();
}

// Toggle weather (can be bound to a key)
function toggleWeather(type = 'rain') {
    weatherSystem.active = !weatherSystem.active;
    weatherSystem.type = type;
    weatherSystem.intensity = weatherSystem.active ? 1 : 0;
    weatherSystem.windX = (Math.random() - 0.5) * 2;

    if (weatherSystem.active) {
        showNotification(`Weather: ${type.toUpperCase()}`, '#87CEEB', 28);
    } else {
        weatherSystem.particles = [];
    }
}

let animationId;

// Tank configuration
const TANK_CONFIG = {
    colors: ['blue', 'camo', 'desert', 'purple', 'red'],
    bodies: ['body_halftrack', 'body_tracks'], // Moved halftrack first as requested
    weapons: ['turret_01_mk1', 'turret_01_mk2', 'turret_01_mk3', 'turret_01_mk4', 'turret_02_mk1', 'turret_02_mk2', 'turret_02_mk3', 'turret_02_mk4'],
    prices: {
        colors: { blue: 0, camo: 0, desert: 0, purple: 0, red: 0 }, // Colors are free, price is per item
        bodies: {
            body_halftrack: 100, // First body item
            body_tracks: 200     // Second body item
        },
        weapons: {
            turret_01_mk1: 300, turret_01_mk2: 400, turret_01_mk3: 500, turret_01_mk4: 600,
            turret_02_mk1: 700, turret_02_mk2: 800, turret_02_mk3: 900, turret_02_mk4: 1000
        }
    },
    // Price multipliers per color tier
    colorMultipliers: {
        blue: 1,      // 100-900
        camo: 10,     // 1000-1900 (100*10 to 900*10)
        desert: 30,   // 3000-3900
        purple: 50,   // 5000-5900
        red: 70       // 7000-7900
    }
};

// Shop layout constants - defined at module scope for consistent access
const SHOP_SQUARE_SIZE = 270; // 2x smaller for Netflix-style browsing (was 540)
const SHOP_GRID_SPACING = 20; // Compact spacing for Netflix-style layout
const SHOP_PREVIEW_SIZE = 200; // Adjusted preview size for smaller boxes

// Dynamic tank images
let tankImages = {};
let weaponImages = {};
let lobbyTankImages = {}; // GIF images for lobby preview
let lobbyWeaponImages = {}; // GIF images for lobby preview
let gameModeImages = {}; // Preloaded game mode icons
let imagesLoaded = false;
let lobbyImagesLoaded = false;
let loadedImageCount = 0;
let totalImagesToLoad = 0;
let loadingStartTime = Date.now(); // Track when loading started

// Start loading images immediately when page loads
console.log('🚀 Starting image loading immediately...');

// Initialize image loading with proper fallback
function initializeTankImages() {
    // Calculate total images to load (tank images + game mode icons)
    const gameModeIconPaths = [
        '/assets/images/ui/ffa-logo.png',
        '/assets/images/ui/tdm-logo.jpg',
        '/assets/images/ui/ctf-logo.webp',
        '/assets/images/ui/koth-logo.png',
        '/assets/images/ui/br-logo.png'
    ];

    totalImagesToLoad = TANK_CONFIG.colors.length * (TANK_CONFIG.bodies.length + TANK_CONFIG.weapons.length) + gameModeIconPaths.length;

    // Load game mode icons
    gameModeIconPaths.forEach(path => {
        const img = new Image();
        img.onload = () => {
            gameModeImages[path] = img;
            checkImagesLoaded(true);
        };
        img.onerror = () => {
            console.warn(`Failed to load game mode icon: ${path}`);
            gameModeImages[path] = null;
            checkImagesLoaded(false);
        };
        img.src = path;
    });

    // Load all tank body and weapon images
    TANK_CONFIG.colors.forEach(color => {
        tankImages[color] = {};
        weaponImages[color] = {};
        lobbyTankImages[color] = {};
        lobbyWeaponImages[color] = {};

        TANK_CONFIG.bodies.forEach(body => {
            loadWeaponImagePngFirst(`/assets/images/tanks/${color}/${color}_${body}`, (img, success) => {
                tankImages[color][body] = img;
                checkImagesLoaded(success);
            });

            // Load GIF version for lobby
            loadGifImage(`/assets/images/tanks/${color}/${color}_${body}.gif`, (img) => {
                lobbyTankImages[color][body] = img;
            });
        });

        TANK_CONFIG.weapons.forEach(weapon => {
            loadWeaponImagePngFirst(`/assets/images/tanks/${color}/${color}_${weapon}`, (img, success) => {
                weaponImages[color][weapon] = img;
                checkImagesLoaded(success);
            });

            // Load GIF version for lobby
            loadGifImage(`/assets/images/tanks/${color}/${color}_${weapon}.gif`, (img) => {
                lobbyWeaponImages[color][weapon] = img;
            });
        });
    });
}

// Start loading images immediately
initializeTankImages();

// Load GIF images directly for lobby previews
function loadGifImage(path, callback) {
    const img = new Image();
    img.onload = () => {
        callback(img);
    };
    img.onerror = () => {
        console.warn(`Failed to load GIF: ${path}`);
        callback(null);
    };
    img.src = path;
}

function loadImageWithFallback(basePath, callback) {
    const img = new Image();

    img.onload = () => {
        callback(img, true); // Pass success flag
    };

    img.onerror = () => {
        // Try GIF fallback
        const gifImg = new Image();
        gifImg.onload = () => {
            callback(gifImg, true); // Pass success flag
        };
        gifImg.onerror = () => {
            console.warn(`Failed to load both PNG and GIF for: ${basePath}`);
            callback(null, false); // Pass null and failure flag
        };
        gifImg.src = basePath + '.gif';
    };

    img.src = basePath + '.png';
}

// Load weapon images with PNG priority (for sprite sheet animation)
function loadWeaponImagePngFirst(basePath, callback) {
    const pngImg = new Image();

    pngImg.onload = () => {
        callback(pngImg, true); // Pass success flag - PNG loaded
    };

    pngImg.onerror = () => {
        // Try GIF fallback if PNG doesn't exist
        const gifImg = new Image();
        gifImg.onload = () => {
            callback(gifImg, true); // Pass success flag - GIF loaded
        };
        gifImg.onerror = () => {
            console.warn(`Failed to load both PNG and GIF for: ${basePath}`);
            callback(null, false); // Pass null and failure flag
        };
        gifImg.src = basePath + '.gif';
    };

    pngImg.src = basePath + '.png';
}

function checkImagesLoaded(success = true) {
    if (success) {
        loadedImageCount++;
    }

    // Check if we've attempted to load all images (count successful + failed attempts)
    const totalAttempts = Object.values(tankImages).reduce((count, colorImages) =>
        count + Object.keys(colorImages).length, 0) +
        Object.values(weaponImages).reduce((count, colorImages) =>
            count + Object.keys(colorImages).length, 0) +
        Object.keys(gameModeImages).length;

    if (totalAttempts >= totalImagesToLoad) {
        imagesLoaded = true;
        console.log(`Image loading completed: ${loadedImageCount}/${totalImagesToLoad} loaded successfully (tanks + game modes)`);

        // Wait for both image loading AND 5-second minimum
        waitForLoadingComplete();
    }
}

// Wait for both image loading completion AND 5-second minimum
function waitForLoadingComplete() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (!loadingOverlay) return;

    // Calculate how much time has passed since loading started
    const elapsedTime = Date.now() - loadingStartTime;
    const minLoadingTime = 5000; // 5 seconds minimum
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

    console.log(`⏱️ Images loaded, waiting ${remainingTime}ms more for minimum loading time`);

    setTimeout(() => {
        loadingOverlay.style.transition = 'opacity 0.5s ease-out';
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            
            // Immediately render tank in lobby box
            console.log('🎮 Loading complete - rendering tank in lobby');
            if (typeof renderTankOnCanvas === 'function' && gameState.selectedTank) {
                renderTankOnCanvas('playerTankCanvas', gameState.selectedTank);
                console.log('✅ Tank rendered on lobby canvas');
            }
            
            // Start lobby animations
            if (typeof animateLobbyTanks === 'function') {
                animateLobbyTanks();
                console.log('✅ Lobby tank animations started');
            }
            
            // Initialize lobby background
            if (typeof initializeLobbyBackground === 'function') {
                initializeLobbyBackground();
                console.log('✅ Lobby background initialized');
            }
        }, 500);
    }, remainingTime);
}

// Verify default tank has valid images function
function verifyDefaultTank() {
    // Verify default tank has valid images
    const { tankImg, weaponImg } = getCurrentTankImages(gameState.selectedTank);
    if (!tankImg || !weaponImg) {
        console.warn('Default tank images missing, switching to working default');
        findWorkingDefaultTank();
    }

    // Render player tank on center box after images load
    if (typeof renderTankOnCanvas === 'function' && gameState.selectedTank) {
        setTimeout(() => {
            renderTankOnCanvas('playerTankCanvas', gameState.selectedTank);
        }, 100);
    }
}

function findWorkingDefaultTank() {
    // Try to find a working color/body/weapon combination
    for (const color of TANK_CONFIG.colors) {
        for (const body of TANK_CONFIG.bodies) {
            for (const weapon of TANK_CONFIG.weapons) {
                const tankImg = tankImages[color]?.[body];
                const weaponImg = weaponImages[color]?.[weapon];
                if (tankImg && weaponImg && tankImg.complete && weaponImg.complete) {
                    gameState.selectedTank = { color, body, weapon };
                    console.log(`Switched to working default: ${color}/${body}/${weapon}`);
                    return;
                }
            }
        }
    }
}

// Get current tank images based on player selection
function getCurrentTankImages(playerTank = gameState.selectedTank, forLobby = false) {
    if (forLobby) {
        // Use GIF images for lobby preview
        const tankImg = lobbyTankImages[playerTank.color]?.[playerTank.body];
        const weaponImg = lobbyWeaponImages[playerTank.color]?.[playerTank.weapon];
        return { tankImg, weaponImg };
    }

    // Use regular images for game map
    const tankImg = tankImages[playerTank.color]?.[playerTank.body];
    const weaponImg = weaponImages[playerTank.color]?.[playerTank.weapon];
    return { tankImg, weaponImg };
}

// Initialize player animations for the AnimationManager
function initializePlayerAnimations(playerId) {
    if (window.tankAnimationManager) {
        window.tankAnimationManager.createTankBodyAnimation(playerId, gameState.players[playerId]?.selectedTank || gameState.selectedTank);
    }
    
    // Initialize weapon animation for 8-frame PNG sprites
    const playerTank = gameState.players[playerId]?.selectedTank || gameState.selectedTank;
    const weaponAssetKey = `${playerTank.color}_${playerTank.weapon}`;
    initSpriteAnimation('weapons', playerId, weaponAssetKey);
}

// Trigger shooting animation using AnimationManager
function triggerShootingAnimation(playerId) {
    if (window.tankAnimationManager) {
        // Tank body movement animation only
    }
}

// Update movement animation using AnimationManager
function updateMovementAnimation(playerId, velocity) {
    if (window.tankAnimationManager) {
        window.tankAnimationManager.updateMovementAnimation(playerId, velocity);
    }
}

// Trigger weapon shooting animation
function triggerWeaponAnimation(playerTank, playerId = gameState.playerId) {
    const weaponImg = weaponImages[playerTank.color]?.[playerTank.weapon];
    
    // Initialize sprite animation for this weapon
    const assetKey = `${playerTank.color}_${playerTank.weapon}`;
    const anim = initSpriteAnimation('weapons', playerId, assetKey);

    if (anim) {
        // Start weapon animation only when shooting
        anim.currentFrame = 0;
        anim.lastFrameTime = 0;
        anim.isPlaying = true;
        anim.loop = false; // Play once through all 8 frames then stop
        anim.shootingBurst = false; // Remove burst effect
    }

    // Trigger muzzle flash
    triggerMuzzleFlash(playerId);
}

// Muzzle flash system
let muzzleFlashes = {}; // Track muzzle flashes for all players

// Screen shake system for realistic impact
let screenShake = { intensity: 0, duration: 0, startTime: 0 };

// Asteroid system
let asteroids = [];
let asteroidImages = {};
let asteroidsLoaded = false;

const ASTEROID_CONFIG = {
    sizes: ['Large 1', 'Large 2', 'Medium 1', 'Medium 2', 'Small 1', 'Small 2'],
    types: ['Rock', 'Ice', 'Gold'],
    count: 15, // Reduced count to minimize 404 errors
    minSize: 0.8,
    maxSize: 1.5,
    rotationSpeed: { min: -0.01, max: 0.01 }
};

// Load asteroid images - smart loading to avoid 404 errors
function loadAsteroidImages() {
    console.log('🌌 Loading asteroid images...');
    
    // Define known missing frames to skip them
    const knownMissingFrames = {
        'Small 2_Rock': [8], // Frame 08 is missing
        'Small 2_Gold': [12] // Frame 12 is missing
    };
    
    let loadedCount = 0;
    let totalAttempts = 0;

    ASTEROID_CONFIG.sizes.forEach(size => {
        ASTEROID_CONFIG.types.forEach(type => {
            const asteroidKey = `${size}_${type}`;
            const missingFrames = knownMissingFrames[asteroidKey] || [];
            asteroidImages[asteroidKey] = [];

            // Load frames 1-30, skipping known missing ones
            for (let frame = 1; frame <= 30; frame++) {
                if (missingFrames.includes(frame)) {
                    // Create placeholder for known missing frames
                    const placeholder = createAsteroidPlaceholder(type);
                    asteroidImages[asteroidKey][frame - 1] = placeholder;
                    continue;
                }

                totalAttempts++;
                const img = new Image();
                const frameStr = frame.toString().padStart(2, '0');
                
                // Fix the path generation to match actual file structure
                const sizeStr = size.toLowerCase().replace(' ', '');
                const typeStr = type.toLowerCase();
                img.src = `/assets/Asteroids/Asteroid ${size}/${type}/spr_asteroids_${sizeStr}_${typeStr}_${frameStr}.png`;
                
                img.onload = () => {
                    loadedCount++;
                    checkAsteroidLoadingComplete();
                };
                
                img.onerror = () => {
                    // Create a placeholder for unexpected missing frames
                    console.warn(`Unexpected missing asteroid frame: ${img.src}`);
                    const placeholder = createAsteroidPlaceholder(type);
                    asteroidImages[asteroidKey][frame - 1] = placeholder;
                    loadedCount++;
                    checkAsteroidLoadingComplete();
                };

                // Initialize array index
                asteroidImages[asteroidKey][frame - 1] = img;
            }
        });
    });

    function checkAsteroidLoadingComplete() {
        if (loadedCount >= totalAttempts) {
            asteroidsLoaded = true;
            console.log(`✅ Asteroid loading completed: ${loadedCount}/${totalAttempts} attempts`);
            generateAsteroids();
        }
    }
}

// Create a placeholder image for missing asteroid frames
function createAsteroidPlaceholder(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Different colors for different types
    const colors = {
        'Rock': '#8B4513',
        'Ice': '#87CEEB', 
        'Gold': '#FFD700'
    };

    ctx.fillStyle = colors[type] || '#8B4513';
    ctx.beginPath();
    ctx.arc(32, 32, 25, 0, Math.PI * 2);
    ctx.fill();

    // Add some texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(
            20 + Math.random() * 24,
            20 + Math.random() * 24,
            2 + Math.random() * 3,
            0, Math.PI * 2
        );
        ctx.fill();
    }

    return canvas;
}

// Generate asteroids randomly across the map
function generateAsteroids() {
    console.log('🌌 Generating asteroids...');
    asteroids = [];

    for (let i = 0; i < ASTEROID_CONFIG.count; i++) {
        // Random position within map bounds
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 2000 + 500; // Between 500-2500 pixels from center
        
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        // Random asteroid properties
        const size = ASTEROID_CONFIG.sizes[Math.floor(Math.random() * ASTEROID_CONFIG.sizes.length)];
        const type = ASTEROID_CONFIG.types[Math.floor(Math.random() * ASTEROID_CONFIG.types.length)];
        const scale = ASTEROID_CONFIG.minSize + Math.random() * (ASTEROID_CONFIG.maxSize - ASTEROID_CONFIG.minSize);

        const asteroid = {
            x: x,
            y: y,
            size: size,
            type: type,
            scale: scale,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: ASTEROID_CONFIG.rotationSpeed.min + Math.random() * (ASTEROID_CONFIG.rotationSpeed.max - ASTEROID_CONFIG.rotationSpeed.min),
            frame: Math.floor(Math.random() * 25), // Use frames 0-24 to avoid missing frames
            maxFrames: 25,
            animationSpeed: 0.1 + Math.random() * 0.1, // 0.1-0.2 seconds per frame
            lastFrameTime: Date.now(),
            imageKey: `${size}_${type}`
        };

        asteroids.push(asteroid);
    }

    console.log(`✅ Generated ${asteroids.length} asteroids`);
}

// Update asteroid animations
function updateAsteroids() {
    if (!asteroidsLoaded) return;
    
    const currentTime = Date.now();
    
    asteroids.forEach(asteroid => {
        // Update rotation
        asteroid.rotation += asteroid.rotationSpeed;
        
        // Update animation frame
        if (currentTime - asteroid.lastFrameTime > (asteroid.animationSpeed * 1000)) {
            asteroid.frame = (asteroid.frame + 1) % asteroid.maxFrames;
            asteroid.lastFrameTime = currentTime;
        }
    });
}

// Render asteroids
function renderAsteroids() {
    if (!asteroidsLoaded || asteroids.length === 0) return;

    const player = gameState.players[gameState.playerId];
    if (!player) return;

    asteroids.forEach(asteroid => {
        // Check if asteroid is visible on screen
        const relativeX = asteroid.x - player.x;
        const relativeY = asteroid.y - player.y;
        
        // Only render if within reasonable distance
        if (Math.abs(relativeX) > 1000 || Math.abs(relativeY) > 1000) return;

        const imageArray = asteroidImages[asteroid.imageKey];
        let rendered = false;
        
        if (imageArray && imageArray[asteroid.frame]) {
            const img = imageArray[asteroid.frame];
            
            // Check if it's a valid image (not broken)
            if (img && (img.complete && img.naturalWidth > 0) || img instanceof HTMLCanvasElement) {
                try {
                    ctx.save();
                    ctx.translate(relativeX, relativeY);
                    ctx.rotate(asteroid.rotation);
                    ctx.scale(asteroid.scale, asteroid.scale);
                    
                    const width = img.naturalWidth || img.width || 64;
                    const height = img.naturalHeight || img.height || 64;
                    
                    ctx.drawImage(img, -width/2, -height/2, width, height);
                    ctx.restore();
                    rendered = true;
                } catch (e) {
                    // Image is broken, fall back to simple shape
                    console.warn('Failed to render asteroid image:', e);
                }
            }
        }
        
        if (!rendered) {
            // Fallback: draw a simple circle
            ctx.save();
            ctx.fillStyle = asteroid.type === 'Gold' ? '#FFD700' : 
                           asteroid.type === 'Ice' ? '#87CEEB' : '#8B4513';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(relativeX, relativeY, 30 * asteroid.scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    });
}

// Cooldown cursor system
// Cursor is now handled directly via CSS cursor property

function showCooldownCursor() {
    console.log('Showing cooldown cursor');
    const gameCanvas = document.getElementById('gameCanvas');
    const gameMapArea = document.getElementById('gameMapArea');
    
    if (gameCanvas) {
        gameCanvas.style.cursor = 'url("data:image/svg+xml;charset=utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><defs><radialGradient id=\'bulletGrad\' cx=\'50%\' cy=\'50%\'><stop offset=\'0%\' stop-color=\'%23FFD700\' stop-opacity=\'1\'/><stop offset=\'70%\' stop-color=\'%23FF6B00\' stop-opacity=\'0.8\'/><stop offset=\'100%\' stop-color=\'%23514b82\' stop-opacity=\'0.6\'/></radialGradient><filter id=\'glow\'><feGaussianBlur stdDeviation=\'2\' result=\'coloredBlur\'/><feMerge><feMergeNode in=\'coloredBlur\'/><feMergeNode in=\'SourceGraphic\'/></feMerge></filter></defs><g filter=\'url(%23glow)\'><circle cx=\'16\' cy=\'16\' r=\'12\' fill=\'none\' stroke=\'url(%23bulletGrad)\' stroke-width=\'3\' stroke-dasharray=\'8 4\' opacity=\'0.9\'><animateTransform attributeName=\'transform\' type=\'rotate\' values=\'0 16 16;360 16 16\' dur=\'0.15s\' repeatCount=\'indefinite\'/><animate attributeName=\'stroke-dasharray\' values=\'8 4;12 2;8 4\' dur=\'0.3s\' repeatCount=\'indefinite\'/></circle><circle cx=\'16\' cy=\'16\' r=\'6\' fill=\'%23FFD700\' opacity=\'0.7\'><animate attributeName=\'r\' values=\'6;8;6\' dur=\'0.4s\' repeatCount=\'indefinite\'/><animate attributeName=\'opacity\' values=\'0.7;0.3;0.7\' dur=\'0.4s\' repeatCount=\'indefinite\'/></circle><circle cx=\'16\' cy=\'16\' r=\'2\' fill=\'%23FFFFFF\' opacity=\'1\'><animate attributeName=\'opacity\' values=\'1;0.5;1\' dur=\'0.2s\' repeatCount=\'indefinite\'/></circle></g></svg>") 16 16, wait';
        console.log('Cursor changed to enhanced bullet loading animation');
    }
    
    if (gameMapArea) {
        gameMapArea.style.cursor = 'url("data:image/svg+xml;charset=utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><defs><radialGradient id=\'bulletGrad\' cx=\'50%\' cy=\'50%\'><stop offset=\'0%\' stop-color=\'%23FFD700\' stop-opacity=\'1\'/><stop offset=\'70%\' stop-color=\'%23FF6B00\' stop-opacity=\'0.8\'/><stop offset=\'100%\' stop-color=\'%23514b82\' stop-opacity=\'0.6\'/></radialGradient><filter id=\'glow\'><feGaussianBlur stdDeviation=\'2\' result=\'coloredBlur\'/><feMerge><feMergeNode in=\'coloredBlur\'/><feMergeNode in=\'SourceGraphic\'/></feMerge></filter></defs><g filter=\'url(%23glow)\'><circle cx=\'16\' cy=\'16\' r=\'12\' fill=\'none\' stroke=\'url(%23bulletGrad)\' stroke-width=\'3\' stroke-dasharray=\'8 4\' opacity=\'0.9\'><animateTransform attributeName=\'transform\' type=\'rotate\' values=\'0 16 16;360 16 16\' dur=\'0.15s\' repeatCount=\'indefinite\'/><animate attributeName=\'stroke-dasharray\' values=\'8 4;12 2;8 4\' dur=\'0.3s\' repeatCount=\'indefinite\'/></circle><circle cx=\'16\' cy=\'16\' r=\'6\' fill=\'%23FFD700\' opacity=\'0.7\'><animate attributeName=\'r\' values=\'6;8;6\' dur=\'0.4s\' repeatCount=\'indefinite\'/><animate attributeName=\'opacity\' values=\'0.7;0.3;0.7\' dur=\'0.4s\' repeatCount=\'indefinite\'/></circle><circle cx=\'16\' cy=\'16\' r=\'2\' fill=\'%23FFFFFF\' opacity=\'1\'><animate attributeName=\'opacity\' values=\'1;0.5;1\' dur=\'0.2s\' repeatCount=\'indefinite\'/></circle></g></svg>") 16 16, wait';
    }
}

function hideCooldownCursor() {
    console.log('Hiding cooldown cursor');
    const gameCanvas = document.getElementById('gameCanvas');
    const gameMapArea = document.getElementById('gameMapArea');
    
    if (gameCanvas) {
        gameCanvas.style.cursor = 'crosshair';
        console.log('Cursor changed back to crosshair');
    }
    
    if (gameMapArea) {
        gameMapArea.style.cursor = 'crosshair';
    }
}

function startCooldownTimer(cooldownDuration) {
    // Show cooldown cursor with bullet loading animation immediately after shooting
    showCooldownCursor();
    
    // Hide cooldown cursor after cooldown period
    setTimeout(() => {
        hideCooldownCursor();
    }, cooldownDuration);
}

// Damage numbers system - only visible to the shooter
let damageNumbers = [];
let killStreak = 0;
let killStreakTimer = 0;
let notifications = [];

// Hit markers for better feedback
let hitMarkers = [];

// Kill streak rewards and names
const KILL_STREAK_REWARDS = {
    3: { name: 'TRIPLE KILL', bonus: 100, color: '#FFD700' },
    5: { name: 'KILLING SPREE', bonus: 250, color: '#FF6B00' },
    7: { name: 'RAMPAGE', bonus: 500, color: '#FF0000' },
    10: { name: 'UNSTOPPABLE', bonus: 1000, color: '#FF00FF' },
    15: { name: 'LEGENDARY', bonus: 2000, color: '#00FFFF' }
};

// Particle trail system for bullets
let bulletTrails = [];

// Screen distortion effects
let screenDistortion = { intensity: 0, type: 'none' };

function showNotification(text, color = '#FFD700', size = 32) {
    notifications.push({
        text,
        color,
        y: 200,
        life: 1,
        decay: 0.01,
        size: size
    });
}

function addKillStreakReward() {
    killStreak++;
    killStreakTimer = 5000; // 5 seconds to continue streak

    // Check for kill streak rewards
    if (KILL_STREAK_REWARDS[killStreak]) {
        const reward = KILL_STREAK_REWARDS[killStreak];
        gameState.fortzCurrency += reward.bonus;
        updateFortzDisplay();
        showNotification(`${reward.name}! +${reward.bonus} FORTZ`, reward.color, 48);
        triggerScreenShake(8, 500);

        // Create massive explosion effect
        const player = gameState.players[gameState.playerId];
        if (player) {
            createExplosion(player.x, player.y, 3);
        }
    } else {
        showNotification(`${killStreak} KILL STREAK!`, '#FFD700', 36);
    }
}

function resetKillStreak() {
    if (killStreak > 0) {
        showNotification(`Streak Ended: ${killStreak} kills`, '#FF5050', 28);
    }
    killStreak = 0;
    killStreakTimer = 0;
}

function updateAndDrawNotifications() {
    ctx.save();
    notifications = notifications.filter(n => {
        n.y -= 2;
        n.life -= n.decay;

        if (n.life <= 0) return false;

        ctx.globalAlpha = n.life;
        ctx.font = `bold ${n.size || 32}px Arial`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        ctx.strokeText(n.text, canvas.width / 2, n.y);
        ctx.fillStyle = n.color;
        ctx.fillText(n.text, canvas.width / 2, n.y);

        return true;
    });
    ctx.restore();
}

function createBulletTrail(bullet) {
    bulletTrails.push({
        x: bullet.x,
        y: bullet.y,
        vx: bullet.vx * 0.5,
        vy: bullet.vy * 0.5,
        color: bullet.color || 'blue',
        life: 1,
        decay: 0.05,
        size: 2 + Math.random()
    });
}

function updateAndDrawBulletTrails() {
    ctx.save();
    bulletTrails = bulletTrails.filter(trail => {
        trail.x += trail.vx * 0.3;
        trail.y += trail.vy * 0.3;
        trail.life -= trail.decay;

        if (trail.life <= 0) return false;

        const bulletColor = getBulletColorFromWeapon(trail.color);
        ctx.globalAlpha = trail.life * 0.6;
        ctx.fillStyle = bulletColor.outer;
        ctx.shadowBlur = 8;
        ctx.shadowColor = bulletColor.glow;
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, trail.size * trail.life, 0, Math.PI * 2);
        ctx.fill();

        return true;
    });
    ctx.shadowBlur = 0;
    ctx.restore();
}

// Bullet impact particles system
let impactParticles = [];

// Advanced explosion particle system
let explosionParticles = [];

function createExplosion(x, y, size = 1) {
    const particleCount = Math.floor(30 * size);
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 3 + Math.random() * 4 * size;
        explosionParticles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: (2 + Math.random() * 3) * size,
            life: 1,
            decay: 0.02 + Math.random() * 0.02,
            color: i % 3 === 0 ? '#FF6B00' : i % 3 === 1 ? '#FFD700' : '#FF0000'
        });
    }
}

function updateAndDrawExplosions() {
    ctx.save();
    explosionParticles = explosionParticles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.vy += 0.15; // Gravity
        p.life -= p.decay;

        if (p.life <= 0) return false;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();

        return true;
    });
    ctx.restore();
}

// Tank exhaust smoke system
let exhaustParticles = [];

function createExhaustSmoke(x, y, tankRotation, velocity) {
    // Only create smoke when moving
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    if (speed < 1) return;

    // Calculate exhaust position at back of tank based on tank body rotation
    const exhaustOffset = 35; // Distance from tank center to back
    const exhaustX = x - Math.cos(tankRotation) * exhaustOffset;
    const exhaustY = y - Math.sin(tankRotation) * exhaustOffset;

    // Create smoke particles with speed-based density
    const baseCount = Math.floor(speed / 2);
    const particleCount = baseCount + (isSprinting ? 4 : 1);

    for (let i = 0; i < particleCount; i++) {
        const spread = 0.5;
        // Particles shoot out the back of the tank (opposite direction of tank rotation)
        const particleAngle = tankRotation + Math.PI + (Math.random() - 0.5) * spread;
        const particleSpeed = (isSprinting ? 0.8 : 0.4) + Math.random() * 0.3; // Much slower particles = shorter trail

        exhaustParticles.push({
            x: exhaustX + (Math.random() - 0.5) * 15,
            y: exhaustY + (Math.random() - 0.5) * 15,
            vx: Math.cos(particleAngle) * particleSpeed - velocity.x * 0.25,
            vy: Math.sin(particleAngle) * particleSpeed - velocity.y * 0.25,
            size: (isSprinting ? 1.5 : 1) + Math.random() * 1.5,
            life: 1,
            decay: 0.03 + Math.random() * 0.02, // Faster decay = shorter trail
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.06,
            isSprint: isSprinting,
            speedFactor: speed / TANK_MAX_SPEED // Track speed for fade effects
        });
    }
}

function updateAndDrawExhaustSmoke() {
    ctx.save();

    exhaustParticles = exhaustParticles.filter(particle => {
        // Update particle
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.96; // Slow down
        particle.vy *= 0.96;
        particle.life -= particle.decay;
        particle.rotation += particle.rotationSpeed;
        particle.size += particle.isSprint ? 0.25 : 0.15; // Expand smoke faster when sprinting

        if (particle.life <= 0) return false;

        // Draw smoke particle with gradient for realism
        const alpha = particle.life * (particle.isSprint ? 0.5 : 0.4);

        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);

        // Smoke gradient - darker and more visible for sprint
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        if (particle.isSprint) {
            gradient.addColorStop(0, `rgba(90, 90, 100, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(70, 70, 80, ${alpha * 0.7})`);
            gradient.addColorStop(1, `rgba(50, 50, 60, 0)`);
        } else {
            gradient.addColorStop(0, `rgba(80, 80, 90, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(60, 60, 70, ${alpha * 0.6})`);
            gradient.addColorStop(1, `rgba(40, 40, 50, 0)`);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        return true;
    });

    ctx.restore();
}

function createBulletImpact(x, y, impactType, bulletColor) {
    const particleCount = impactType === 'player' ? 15 : 10;

    // Use weapon color for impact particles if provided, otherwise default colors
    let color = '#FFD700';
    if (bulletColor) {
        const colorScheme = getBulletColorFromWeapon(bulletColor);
        color = colorScheme.outer;
    } else if (impactType === 'player') {
        color = '#FF4444';
    }

    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5);
        const speed = 3 + Math.random() * 4;

        impactParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: color,
            size: 2 + Math.random() * 2,
            life: 1,
            decay: 0.03 + Math.random() * 0.02
        });
    }

    // Add hit marker for player hits
    if (impactType === 'player') {
        hitMarkers.push({
            startTime: Date.now(),
            duration: 300
        });
    }
}

function updateAndDrawImpactParticles() {
    ctx.save();

    impactParticles = impactParticles.filter(particle => {
        // Update particle
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Gravity
        particle.life -= particle.decay;

        if (particle.life <= 0) return false;

        // Draw particle
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fill();

        return true;
    });

    ctx.restore();
}

function triggerScreenShake(intensity, duration) {
    screenShake = {
        intensity: intensity,
        duration: duration,
        startTime: Date.now()
    };
}

function triggerMuzzleFlash(playerId) {
    muzzleFlashes[playerId] = {
        intensity: 1.0,
        timer: 0,
        duration: 150, // Shorter, more realistic flash duration
        startTime: Date.now(),
        flashType: Math.floor(Math.random() * 3) // Random flash variation
    };

    // Add subtle screen shake for own player's shots
    if (playerId === gameState.playerId) {
        triggerScreenShake(1.5, 80); // Reduced shake for new animation
    }
}

// Sprite sheet animation system
const spriteAnimations = {
    tanks: {},
    weapons: {}
};

// Initialize sprite animation for a tank/weapon
function initSpriteAnimation(type, playerId, assetKey) {
    const key = `${playerId}_${assetKey}`;
    if (!spriteAnimations[type][key]) {
        // Tank bodies have 2 frames, weapons have 8 frames
        const numFrames = type === 'tanks' ? 2 : 8;

        spriteAnimations[type][key] = {
            currentFrame: 0,
            lastFrameTime: 0,
            frameDuration: type === 'weapons' ? 10 : 80, // Lightning fast weapon animation when shooting (5x faster), normal tank speed
            numFrames: numFrames, // 2 for tanks, 8 for weapons
            frameWidth: 128, // Default from Ground Shaker pack
            frameHeight: 128,
            isPlaying: type === 'tanks', // Only tanks play continuously, weapons play on shooting
            loop: type === 'tanks' // Only tanks loop continuously, weapons play once when shooting
        };
    }
    return spriteAnimations[type][key];
}

// Update sprite animation frame
function updateSpriteAnimation(type, playerId, assetKey, deltaTime) {
    const key = `${playerId}_${assetKey}`;
    const anim = spriteAnimations[type][key];
    if (!anim) return 0;



    // Only animate if playing
    if (anim.isPlaying) {
        anim.lastFrameTime += deltaTime;
        if (anim.lastFrameTime >= anim.frameDuration) {
            const oldFrame = anim.currentFrame;
            anim.currentFrame = (anim.currentFrame + 1) % anim.numFrames;
            anim.lastFrameTime = anim.lastFrameTime - anim.frameDuration; // Carry over extra time for smoother animation



            // Stop if not looping and reached end
            if (!anim.loop && anim.currentFrame === 0) {
                anim.isPlaying = false;
            }
        }
    }
    return anim.currentFrame;
}

// Enhanced tank body animation with sprite sheet support
function triggerTankBodyAnimation(playerTank, playerId = gameState.playerId) {
    const tankImg = tankImages[playerTank.color]?.[playerTank.body];

    // Initialize animation for this tank
    const assetKey = `${playerTank.color}_${playerTank.body}`;
    const anim = initSpriteAnimation('tanks', playerId, assetKey);

    // For PNG sprite sheets, just ensure animation is playing with faster speed
    if (tankImg && tankImg.src && tankImg.src.includes('.png')) {
        if (anim) {
            anim.isPlaying = true;
            anim.loop = true;
            anim.frameDuration = 40; // Faster animation (was 60ms, now 40ms for smoother movement)
        }
    }
    // For GIFs, they auto-animate, no need to reload constantly

    // Add track animation frame counter for non-GIF tanks
    if (!playerTank.trackFrame) playerTank.trackFrame = 0;
    playerTank.trackFrame = (playerTank.trackFrame + 1) % 60;
}

// Helper function to get current player velocity
function getCurrentPlayerVelocity(playerId) {
    if (playerId === gameState.playerId) {
        return tankVelocity; // Use the existing tankVelocity variable
    }
    // For other players, estimate velocity from position changes
    const player = gameState.players[playerId];
    if (player && player.lastPosition) {
        const dx = player.x - player.lastPosition.x;
        const dy = player.y - player.lastPosition.y;
        return { x: dx * 60, y: dy * 60 }; // Scale to per-second velocity
    }
    return { x: 0, y: 0 };
}

// Find nearest target for aimbot assist
function findNearestTarget(player) {
    let nearestTarget = null;
    let nearestDistance = AIMBOT_MAX_RANGE;

    // Check other players
    Object.values(gameState.players).forEach(otherPlayer => {
        if (otherPlayer.id !== player.id) {
            const dist = distance(player, otherPlayer);
            if (dist < nearestDistance) {
                nearestDistance = dist;
                nearestTarget = otherPlayer;
            }
        }
    });

    // Check shapes (if you want to assist aiming at shapes too)
    gameState.shapes.forEach(shape => {
        const dist = distance(player, shape);
        if (dist < nearestDistance) {
            nearestDistance = dist;
            nearestTarget = shape;
        }
    });

    return nearestTarget;
}

// Blend two angles with a strength factor
function blendAngles(angle1, angle2, strength) {
    // Normalize angle difference to [-PI, PI]
    let diff = angle2 - angle1;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    // Blend the angles
    return angle1 + diff * strength;
}

// Images already initialized at the top of the file

// Game constants
const TANK_SIZE = 90; // Size for tank collision/positioning - reduced for tighter collision
const TANK_VISUAL_SIZE = 428; // Size for rendering the tank - 10% smaller (476 * 0.9)
const GUN_SIZE = 1503; // Size for gun rendering - 10% smaller than 1670 (1670 * 0.9)
const CAMERA_SMOOTHING = 0.3; // Smooth camera following for fluid movement
const TANK_ROTATION_SPEED = 0.35; // Speed of tank rotation animation (increased for smoother rotation)
const GUN_ROTATION_SPEED = 0.3; // Speed of gun rotation (increased for smoother tracking)

// Power-up system with new items - server will manage spawning
let powerUps = [];
const POWERUP_TYPES = {
    BLUEHEALTH: { image: '/assets/images/powerups/bluehealth100+.png', color: '#4169E1', duration: 0, effect: 'bluehealth' }
};

let activePowerUps = [];
let comboMultiplier = 1;
let comboTimer = 0;
const COMBO_DURATION = 3000;

// Race car physics constants for realistic movement
const TANK_ACCELERATION = 0.25; // Slower initial acceleration for realistic feel
const TANK_DECELERATION = 0.92; // Less friction for more momentum/sliding (0.92 = 8% speed loss per frame)
const TANK_MAX_SPEED = 8; // Higher top speed for racing feel
const TANK_SPRINT_MAX_SPEED = 14; // Much higher sprint speed for racing (1.75x normal)
const TANK_TURN_SPEED = 0.08; // How fast the tank turns while moving
const TANK_DRIFT_FACTOR = 0.95; // How much the tank maintains momentum when turning (closer to 1 = more drift)
const TANK_GRIP = 0.85; // Traction/grip when turning (lower = more drift)

// Sprint system constants
const SPRINT_DURATION = 200; // Maximum sprint stamina (2x longer)
const SPRINT_DRAIN_RATE = 2; // How fast sprint drains per frame
const SPRINT_REGEN_RATE = 1; // How fast sprint regenerates per frame
const SPRINT_SPEED_MULTIPLIER = 1.75; // Speed boost when sprinting
const SPRINT_COOLDOWN = 30; // Frames to wait before regenerating after exhaustion

// Sprint state
let sprintStamina = SPRINT_DURATION;
let sprintCooldown = 0;
let isSprinting = false;

// Aimbot assist system
let aimbotEnabled = false;
const AIMBOT_ASSIST_STRENGTH = 0.3; // 30% aim assistance towards nearest target
const AIMBOT_MAX_RANGE = 600; // Maximum range for aim assist


// Player health state - dual system (shield + health)
let playerHealth = 100;
let maxPlayerHealth = 100;
let playerShield = 100;
let maxPlayerShield = 100;

// Smooth health/shield animation
let displayHealth = 100;
let displayShield = 100;
let targetHealth = 100;
let targetShield = 100;

// Tank physics state for sliding effect (expose globally for animation system)
let tankVelocity = { x: 0, y: 0 };
window.tankVelocity = tankVelocity;
let lastInputDirection = { x: 0, y: 0 };

// Tank body recoil for sprint animation
let tankBodyRecoil = { offset: 0, targetOffset: 0 };

// Shooting system
let lastShotTime = 0;
const SHOT_COOLDOWN = 500; // 500ms = 2 shots per second
let gunRecoilAnimation = { left: 0, shake: 0 }; // Single gun recoil with shake
let otherPlayerGunRecoils = {}; // Track gun recoil for other players

// Enhanced player recoil system with smooth sliding
let playerRecoil = { vx: 0, vy: 0, active: false, duration: 0 };

// Auto-fire system for Q key
let autoFireEnabled = false;

// Lava damage cooldown
let lavaDamageCooldown = 0;
const LAVA_DAMAGE_INTERVAL = 500; // 500ms cooldown between lava damage hits

// Socket.IO connection
function connectToServer() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Include selected game mode in URL (default to 'ffa' if not selected)
    const gameMode = gameState.selectedGameMode || 'ffa';
    const wsUrl = `${protocol}//${window.location.host}/ws?mode=${gameMode}`;

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log(`Connected to ${gameMode.toUpperCase()} game server`);
        gameState.isConnected = true;

        // Confirm map play count now that we've successfully connected
        if (typeof window.confirmMapPlay === 'function') {
            window.confirmMapPlay();
        }

        // Send selected tank and username to server
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'setPlayerData',
                selectedTank: gameState.selectedTank,
                username: window.currentUser ? window.currentUser.username : null
            }));
        }

        // Start sending movement updates once connected
        startMovementUpdates();
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
        } catch (error) {
            console.error('Error parsing server message:', error);
        }
    };

    socket.onclose = () => {
        console.log('Disconnected from game server');
        gameState.isConnected = false;
        stopMovementUpdates(); // Stop sending updates on disconnect

        // Only attempt to reconnect if we're still in game (not if user left)
        if (!gameState.isInLobby) {
            setTimeout(connectToServer, 3000);
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

// Handle messages from server
function handleServerMessage(data) {
    switch (data.type) {
        case 'gameState':
            gameState.players = data.players || {};
            gameState.shapes = data.shapes || [];
            gameState.walls = data.walls || [];
            gameState.bullets = data.bullets || [];
            powerUps = data.powerUps || []; // Sync power-ups from server
            gameState.wallColor = data.wallColor || '#FF6B6B'; // Unique wall color per mode
            gameState.gameWidth = data.gameWidth || 7500;
            gameState.gameHeight = data.gameHeight || 7500;

            // Set playerId if provided
            if (data.playerId) {
                gameState.playerId = data.playerId;
            }
            if (data.clientId) {
                gameState.clientId = data.clientId; // Set the clientId from server
            }

            // Initialize animations for all players
            Object.keys(gameState.players).forEach(playerId => {
                initializePlayerAnimations(playerId);
            });

            updateUI();
            break;

        case 'playerJoined':
            gameState.players[data.player.id] = data.player;
            updatePlayerCount();
            break;

        case 'playerLeft':
            delete gameState.players[data.playerId];
            updatePlayerCount();
            break;

        case 'playersCleanup':
            // Handle bulk player removal
            if (data.removedPlayers) {
                data.removedPlayers.forEach(playerId => {
                    delete gameState.players[playerId];
                });
                updatePlayerCount();
            }
            break;

        case 'playerUpdate':
            // Always create or update player data to ensure visibility
            if (!gameState.players[data.id]) {
                gameState.players[data.id] = {
                    id: data.id,
                    x: data.x || 0,
                    y: data.y || 0,
                    angle: data.angle || 0,
                    tankDirection: data.tankDirection || 0,
                    name: data.name || '',
                    score: data.score || 0,
                    level: data.level || 1,
                    selectedTank: data.selectedTank, // Include selectedTank from server
                    // Interpolation data
                    targetX: data.x || 0,
                    targetY: data.y || 0,
                    lastUpdateTime: Date.now()
                };

                // Initialize animations for new player
                initializePlayerAnimations(data.id);
            }

            // Update player data with interpolation for smooth movement
            const player = gameState.players[data.id];

            // Store previous position for interpolation
            if (typeof data.x === 'number' && typeof data.y === 'number') {
                player.targetX = data.x;
                player.targetY = data.y;
                player.lastUpdateTime = Date.now();
            }

            if (typeof data.angle === 'number') player.angle = data.angle;
            if (typeof data.tankDirection === 'number') player.tankDirection = data.tankDirection;

            // Update other properties if they exist in the data
            if (data.name !== undefined) player.name = data.name;
            if (data.score !== undefined) player.score = data.score;
            if (data.level !== undefined) player.level = data.level;
            if (data.health !== undefined) player.health = data.health;
            if (data.maxHealth !== undefined) player.maxHealth = data.maxHealth;
            if (data.shield !== undefined) player.shield = data.shield;
            if (data.maxShield !== undefined) player.maxShield = data.maxShield;
            if (data.selectedTank !== undefined) { // Update selectedTank if provided
                player.selectedTank = data.selectedTank;
                initializePlayerAnimations(data.id); // Re-initialize animations if tank changed
            }

            break;

        case 'shapeDestroyed':
            gameState.shapes = gameState.shapes.filter(s => s.id !== data.shapeId);
            // Clear the respawn timer if the shape was destroyed
            delete gameState.shapeSpawnTimers[data.shapeId];
            break;

        case 'shapeSpawned':
            gameState.shapes.push(data.shape);
            // Set respawn timer for the new shape
            if (data.shape.respawnTime) {
                gameState.shapeSpawnTimers[data.shape.id] = data.shape.respawnTime;
            }
            break;

        case 'shapeDamaged':
            const shape = gameState.shapes.find(s => s.id === data.shapeId);
            if (shape) {
                shape.health = data.health;
            }
            break;

        case 'shapesPositionUpdate':
            // Update shape positions for knockback animations with smooth interpolation
            if (data.shapes) {
                data.shapes.forEach(updatedShape => {
                    const shape = gameState.shapes.find(s => s.id === updatedShape.id);
                    if (shape) {
                        // Store previous position for smooth interpolation
                        if (!shape.prevX) shape.prevX = shape.x;
                        if (!shape.prevY) shape.prevY = shape.y;

                        shape.prevX = shape.x;
                        shape.prevY = shape.y;
                        shape.targetX = updatedShape.x;
                        shape.targetY = updatedShape.y;
                        shape.knockbackVX = updatedShape.knockbackVX || 0;
                        shape.knockbackVY = updatedShape.knockbackVY || 0;
                        shape.lastUpdate = Date.now();

                        // Immediate update for now, smooth interpolation handled in render
                        shape.x = updatedShape.x;
                        shape.y = updatedShape.y;
                    }
                });
            }
            break;

        case 'bulletFired':
            gameState.bullets.push(data.bullet);

            // Create bullet trail
            createBulletTrail(data.bullet);

            // Add gun recoil animation for other players when they shoot
            if (data.bullet.playerId && data.bullet.playerId !== gameState.playerId) {
                if (!otherPlayerGunRecoils[data.bullet.playerId]) {
                    otherPlayerGunRecoils[data.bullet.playerId] = { left: 0, shake: 0 };
                }
                // Trigger realistic recoil for the shooting player
                otherPlayerGunRecoils[data.bullet.playerId].left = 4;
                otherPlayerGunRecoils[data.bullet.playerId].shake = 1;

                // Trigger weapon shooting animation for other players
                const shootingPlayer = gameState.players[data.bullet.playerId];
                if (shootingPlayer && shootingPlayer.selectedTank) {
                    triggerWeaponAnimation(shootingPlayer.selectedTank, data.bullet.playerId);
                    triggerTankBodyAnimation(shootingPlayer.selectedTank, data.bullet.playerId);
                    triggerMuzzleFlash(data.bullet.playerId);
                } else {
                    // Fallback if shooting player's tank data is missing
                    triggerWeaponAnimation(gameState.selectedTank, data.bullet.playerId);
                    triggerTankBodyAnimation(gameState.selectedTank, data.bullet.playerId);
                    triggerMuzzleFlash(data.bullet.playerId);
                }
            }
            break;

        case 'bulletsUpdate':
            if (data.bullets) {
                data.bullets.forEach(updatedBullet => {
                    const bullet = gameState.bullets.find(b => b.id === updatedBullet.id);
                    if (bullet) {
                        bullet.x = updatedBullet.x;
                        bullet.y = updatedBullet.y;
                        bullet.vx = updatedBullet.vx;
                        bullet.vy = updatedBullet.vy;
                        bullet.angle = updatedBullet.angle;
                    }
                });
            }
            break;

        case 'bulletsDestroyed':
            if (data.bulletIds) {
                gameState.bullets = gameState.bullets.filter(b => !data.bulletIds.includes(b.id));
            }
            break;

        case 'bulletImpact':
            createBulletImpact(data.x, data.y, data.impactType, data.bulletColor);
            // Trigger wall pulse animation on impact
            if (data.impactType === 'wall') {
                const wall = gameState.walls.find(w => w.id === data.wallId); // Assuming wall has an ID
                if (wall) {
                    const existingAnim = wallHitAnimations.find(a => a.wallId === wall.id);
                    if (existingAnim) {
                        existingAnim.intensity = Math.max(existingAnim.intensity, 1.0); // Reset intensity on new hit
                    } else {
                        wallHitAnimations.push({ wallId: wall.id, intensity: 1.0, startTime: Date.now() });
                    }
                }
            }
            break;

        case 'scoreUpdate':
            if (data.playerId && gameState.players[data.playerId]) {
                gameState.players[data.playerId].score = data.score;
                gameState.players[data.playerId].level = data.level;

                // Update UI if it's our player
                if (data.playerId === gameState.playerId) {
                    updatePlayerStats({ score: data.score, level: data.level });
                }
            }
            break;

        case 'playerDamaged':
            if (data.playerId === gameState.playerId) {
                // Trust server values for health and shield but clamp to max 100
                playerHealth = Math.min(100, Math.max(0, data.health || 0));
                playerShield = Math.min(100, Math.max(0, data.shield || 0));

                // Initialize display values if not set
                if (typeof displayHealth === 'undefined') displayHealth = playerHealth;
                if (typeof displayShield === 'undefined') displayShield = playerShield;

                updateHealthDisplay();

                // Return to lobby only when health is exactly 0
                if (playerHealth === 0) {
                    console.log('Player eliminated - returning to lobby...');

                    // Show midgame ad after death (CrazyGames SDK)
                    if (window.CrazyGamesIntegration) {
                        window.CrazyGamesIntegration.showMidgameAd().then(() => {
                            // Return to lobby after ad finishes
                            returnToLobby();
                        });
                    } else {
                        // Return to lobby immediately if SDK not available
                        returnToLobby();
                    }
                }
            }
            break;

        case 'damageNumber':
            // Only show damage numbers for hits by the current player
            damageNumbers.push({
                x: data.x,
                y: data.y,
                damage: data.damage,
                startTime: Date.now(),
                duration: 1000 // Show for 1 second
            });
            break;

        case 'lavaDamage': // Handle lava damage notification
            if (data.playerId === gameState.playerId) {
                showNotification('Burning in lava!', '#FF4500', 24);
            }
            break;

        case 'powerUpCollected':
            // Remove power-up from client
            powerUps = powerUps.filter(p => p.id !== data.powerUpId);
            break;

        case 'powerUpSpawned':
            // Add new power-up from server
            powerUps.push(data.powerUp);
            break;

        case 'killReward':
            // Award Fortz currency for killing a player
            if (data.amount) {
                // Use server's authoritative balance if provided, otherwise increment locally
                if (data.newBalance !== undefined) {
                    gameState.fortzCurrency = data.newBalance;
                    console.log(`Earned ${data.amount} Fortz for kill! Balance synced from server: ${gameState.fortzCurrency}`);
                } else {
                    // Guest player - local increment only
                    gameState.fortzCurrency = (gameState.fortzCurrency || 0) + data.amount;
                    console.log(`Earned ${data.amount} Fortz for kill! Total: ${gameState.fortzCurrency} (not saved - login to persist)`);
                }
                updateFortzDisplay();
                showNotification(`+${data.amount} Fortz (Kill!)`, '#FFD700', 32);

                if (data.message) {
                    // Show additional message for guests
                    setTimeout(() => showNotification(data.message, '#FFA500', 24), 1500);
                }
            }
            break;
    }
}

// Send message to server
function sendToServer(type, data = {}) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type, ...data }));
    }
}

function joinGame() {
    // Show loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }

    // Reset health and shield when joining game - both start at 100 and max at 100
    playerHealth = 100;
    maxPlayerHealth = 100;
    playerShield = 100;
    maxPlayerShield = 100;

    // Initialize display values for smooth animation
    displayHealth = 100;
    displayShield = 100;
    targetHealth = 100;
    targetShield = 100;

    // Update health display immediately
    updateHealthDisplay();

    // Close shop if it's open when joining game
    if (gameState.showShop) {
        gameState.showShop = false;
        stopLobbyShopRendering();
    }

    // Start game without name validation
    document.getElementById('lobbyScreen').style.animation = 'fadeOut 0.5s ease-out';
    setTimeout(() => {
        document.getElementById('lobbyScreen').classList.add('hidden');
        document.getElementById('gameMapArea').classList.remove('hidden');
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('scoreProgressContainer').classList.remove('hidden');
        document.getElementById('centerBottomBoxes').classList.remove('hidden');
        gameState.isInLobby = false;

        // CRITICAL: Load the selected map into the game renderer BEFORE initializing
        if (window.selectedCreatedMapId && window.MapRenderer) {
            console.log('🗺️ Loading selected map into game:', window.selectedCreatedMapId);
            window.MapRenderer.loadById(window.selectedCreatedMapId);
        } else if (window.DOMMapRenderer?.currentMap && window.MapRenderer) {
            // Fallback: use the map from DOM renderer
            console.log('🗺️ Loading current map from DOM renderer into game');
            window.MapRenderer.loadMap(window.DOMMapRenderer.currentMap);
        } else {
            console.warn('⚠️ No map selected - game will show blank terrain');
        }

        // Show game canvas for dynamic elements
        setTimeout(() => {
            const gameCanvas = document.getElementById('gameCanvas');
            if (gameCanvas) {
                gameCanvas.style.display = 'block';
            }
        }, 100);

        initializeGame();

        // Loading will be handled by waitForLoadingComplete() when images finish loading
        console.log('🎮 Game initialized, waiting for image loading to complete...');
    }, 500);
}

// Expose joinGame globally
window.joinGame = joinGame;

// Game initialization
function initializeGame() {
    // Get the game canvas (now inside gameMapArea for dynamic elements overlay)
    canvas = document.getElementById('gameCanvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
    }

    // Minimap still uses canvas
    minimapCanvas = document.getElementById('minimapCanvas');
    if (minimapCanvas) {
        minimapCtx = minimapCanvas.getContext('2d');
    }

    resizeCanvas();

    // Connect to server
    if (!gameState.isConnected) {
        connectToServer();
    }

    updatePlayerStats();
    updateUI();
    updateHealthDisplay();

    // Setup input handlers
    setupInputHandlers();

    // Load and generate asteroids
    loadAsteroidImages();

    // Start game loop
    gameLoop();

    // Additional UI update after connection is established
    setTimeout(() => {
        updateUI();
    }, 500);

    // Trigger CrazyGames gameplay start event
    if (window.CrazyGamesIntegration) {
        window.CrazyGamesIntegration.gameplayStart();
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Input handling
let inputHandlersSetup = false;
let canvasHandlersSetup = false;

function setupInputHandlers() {
    // Setup keyboard handlers only once
    if (!inputHandlersSetup) {
        inputHandlersSetup = true;
        setupKeyboardHandlers();
    }

    // Setup canvas handlers only when canvas exists (will retry until successful)
    if (!canvasHandlersSetup && canvas) {
        setupCanvasHandlers();
        canvasHandlersSetup = true; // Only set flag AFTER successful setup
    }
}

function setupKeyboardHandlers() {
    // Keyboard input
    document.addEventListener('keydown', (e) => {
        // Handle H key for chat FIRST - works in both lobby and game
        if ((e.key === 'h' || e.key === 'H') && !e.target.matches('input, textarea')) {
            e.preventDefault();
            e.stopPropagation();

            const chatModal = document.getElementById('chatModal');
            const chatInput = document.getElementById('chatInput');

            if (chatModal && chatInput) {
                chatModal.classList.remove('hidden');
                setTimeout(() => chatInput.focus(), 50);
                console.log('Chat modal opened');
            } else {
                console.log('Chat elements not found');
            }
            return;
        }

        const keyLower = e.key.toLowerCase();
        const keyCode = e.code;

        gameState.keys[keyLower] = true;
        gameState.keys[keyCode] = true;

        // Handle sprint key (Shift or Space)
        if ((e.key === 'Shift' || e.key === ' ') && sprintStamina > 0 && sprintCooldown <= 0) {
            isSprinting = true;
        }

        // Handle Q key for auto-fire
        if (keyLower === 'q' && !gameState.isInLobby) {
            autoFireEnabled = true;
        }

        // Shop toggle is only available in lobby via the UI button
        // No keyboard shortcut during gameplay
    });

    document.addEventListener('keyup', (e) => {
        const keyLower = e.key.toLowerCase();
        const keyCode = e.code;

        gameState.keys[keyLower] = false;
        gameState.keys[keyCode] = false;

        // Handle sprint key release
        if (e.key === 'Shift' || e.key === ' ') {
            isSprinting = false;
        }

        // Handle Q key release to stop auto-fire
        if (keyLower === 'q') {
            autoFireEnabled = false;
        }

        // Handle E key release for aimbot toggle
        if (keyLower === 'e') {
            aimbotEnabled = !aimbotEnabled;
            // Show notification
            const status = aimbotEnabled ? 'ENABLED' : 'DISABLED';
            const color = aimbotEnabled ? '#00FF00' : '#FF0000';
            showNotification(`Aim Assist ${status}`, color);
        }

        // Handle R key for rain weather
        if (keyLower === 'r' && !gameState.isInLobby) {
            toggleWeather('rain');
        }

        // Handle N key for snow weather
        if (keyLower === 'n' && !gameState.isInLobby) {
            toggleWeather('snow');
        }

        // ESC key - close any open feature
        if (keyLower === 'escape') {
            if (gameState.showShop) {
                stopLobbyShopRendering();
                closeAllPanels();
            } else if (gameState.showLocker) {
                gameState.showLocker = false;
                gameState.openedFeature = null;
                stopLockerRendering();
            } else if (gameState.showSettings) {
                gameState.showSettings = false;
                gameState.openedFeature = null;
                stopSettingsRendering();
            } else if (gameState.showFriends) {
                gameState.showFriends = false;
                gameState.openedFeature = null;
                stopFriendsRendering();
            }
        }
    });
}

function setupCanvasHandlers() {
    if (!canvas) {
        console.warn('Canvas not available for event handlers');
        return;
    }

    console.log('Setting up canvas event handlers');

    // Add click handler for map creator buttons
    const lobbyCanvas = document.getElementById('lobbyBackground');
    if (lobbyCanvas && !lobbyCanvas.hasAttribute('data-map-creator-listener')) {
        // Track mouse position on lobby canvas
        lobbyCanvas.addEventListener('mousemove', (e) => {
            const rect = lobbyCanvas.getBoundingClientRect();
            gameState.mouse.x = e.clientX - rect.left;
            gameState.mouse.y = e.clientY - rect.top;
        });

        // Handle clicks on lobby canvas
        lobbyCanvas.addEventListener('click', (e) => {
            console.log('🖱️ Lobby canvas clicked!');
            if (typeof window.handleMapCreatorClick === 'function') {
                console.log('🖱️ Calling handleMapCreatorClick');
                window.handleMapCreatorClick(e);
            } else {
                console.log('❌ handleMapCreatorClick function not found!');
            }
        });
        lobbyCanvas.setAttribute('data-map-creator-listener', 'true');
        console.log('✅ Map creator click listener attached to lobby canvas');
    }

    // Mouse wheel zoom handler
    canvas.addEventListener('wheel', (e) => {
        if (gameState.isInLobby) return; // Only zoom in game

        e.preventDefault();

        const zoomSpeed = 0.001;
        const minZoom = 0.5;
        const maxZoom = 2.0;

        // Get mouse position in world coordinates before zoom
        const zoom = gameState.camera.zoom || 1;
        const mouseWorldX = gameState.camera.x + (gameState.mouse.x - canvas.width / 2) / zoom;
        const mouseWorldY = gameState.camera.y + (gameState.mouse.y - canvas.height / 2) / zoom;

        // Update zoom
        const delta = -e.deltaY * zoomSpeed;
        const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));
        gameState.camera.zoom = newZoom;

        // Adjust camera position to keep mouse point stable
        const newMouseWorldX = gameState.camera.x + (gameState.mouse.x - canvas.width / 2) / newZoom;
        const newMouseWorldY = gameState.camera.y + (gameState.mouse.y - canvas.height / 2) / newZoom;

        gameState.camera.x += mouseWorldX - newMouseWorldX;
        gameState.camera.y += mouseWorldY - newMouseWorldY;
    }, { passive: false });

    // Mouse input - weapon follows mouse 360 degrees
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        gameState.mouse.x = e.clientX - rect.left;
        gameState.mouse.y = e.clientY - rect.top;

        // Cursor position is handled by CSS cursor property

        const player = gameState.players[gameState.playerId];
        if (player) {
            // Convert screen mouse position to world coordinates with new camera system
            const zoom = gameState.camera.zoom || 1;
            
            // Calculate mouse position relative to screen center
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const mouseOffsetX = (gameState.mouse.x - centerX) / zoom;
            const mouseOffsetY = (gameState.mouse.y - centerY) / zoom;
            
            // World mouse position relative to player (who is at screen center)
            const worldMouseX = player.x + mouseOffsetX;
            const worldMouseY = player.y + mouseOffsetY;

            let targetAngle = Math.atan2(worldMouseY - player.y, worldMouseX - player.x);

            // Apply aimbot assist if enabled
            if (aimbotEnabled) {
                const assistTarget = findNearestTarget(player);
                if (assistTarget) {
                    const assistAngle = Math.atan2(assistTarget.y - player.y, assistTarget.x - player.x);
                    // Blend between mouse angle and assist angle
                    targetAngle = blendAngles(targetAngle, assistAngle, AIMBOT_ASSIST_STRENGTH);
                }
            }

            // Store the raw angle for weapon rotation (no normalization needed for full 360)
            gameState.mouse.angle = targetAngle;
        }
    });

    // Mouse click handling with cooldown cursor
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left click
            // Handle shop clicks if shop is open and we're in lobby
            if (gameState.showShop && gameState.isInLobby) {
                handleShopClick(e);
                return;
            }

            // Don't shoot if in lobby or shop is open
            if (gameState.isInLobby) {
                return;
            }

            // Handle shooting if not in shop
            const currentTime = Date.now();
            const player = gameState.players[gameState.playerId];

            // Apply rapid fire power-up
            const hasRapidFire = activePowerUps.some(p => p.effect === 'rapidFire');
            const cooldown = hasRapidFire ? SHOT_COOLDOWN / 2 : SHOT_COOLDOWN;

            // Check shooting cooldown (2 shots per second, or 4 with rapid fire)
            if (player && gameState.isConnected && (currentTime - lastShotTime) >= cooldown) {
                // Use smoothGunAngle if available for perfect bullet-weapon alignment
                let shootAngle = gameState.mouse.angle; // Default to mouse angle
                if (player.smoothGunAngle !== undefined) {
                    shootAngle = player.smoothGunAngle;
                }

                console.log('Shooting bullet at angle:', shootAngle); // Debug log

                sendToServer('playerShoot', {
                    angle: shootAngle, // Send smooth gun angle for perfect alignment
                    tankVelocity: { x: tankVelocity.x, y: tankVelocity.y } // Send tank velocity for bullet inheritance
                });

                // Update last shot time
                lastShotTime = currentTime;

                // Hide cooldown cursor when shooting
                hideCooldownCursor();

                // Create explosion effect at bullet spawn (90 degrees left from weapon)
                const weaponVisualAngle = shootAngle + Math.PI / 2;
                const bulletAngle = weaponVisualAngle - Math.PI / 2; // 90 degrees left
                const weaponOffset = 80;
                createExplosion(player.x + Math.cos(bulletAngle) * weaponOffset,
                    player.y + Math.sin(bulletAngle) * weaponOffset, 0.3);

                // Trigger realistic gun recoil animation
                gunRecoilAnimation.left = 4; // Reduced recoil distance by half
                gunRecoilAnimation.shake = 1; // Reduced barrel shake by half

                // Enhanced player recoil (push back) animation with smooth sliding
                const recoilForce = 0.4; // Reduced to 10% of previous value (90% decrease from 4)
                const recoilAngle = shootAngle + Math.PI; // Opposite direction using same angle
                playerRecoil.vx = Math.cos(recoilAngle) * recoilForce;
                playerRecoil.vy = Math.sin(recoilAngle) * recoilForce;
                playerRecoil.active = true;
                playerRecoil.duration = 12; // Frames for smooth sliding animation

                // Trigger weapon and tank body shooting animation with muzzle flash
                triggerWeaponAnimation(gameState.selectedTank, gameState.playerId);
                triggerTankBodyAnimation(gameState.selectedTank, gameState.playerId);
                triggerMuzzleFlash(gameState.playerId);

                // Start cooldown timer with cursor animation
                startCooldownTimer(cooldown);
            } else {
                console.log('Cannot shoot - player:', !!player, 'connected:', gameState.isConnected, 'cooldown:', currentTime - lastShotTime, 'vs', cooldown); // Debug log
                
                // Show cooldown cursor when trying to shoot during cooldown
                if (player && gameState.isConnected) {
                    showCooldownCursor();
                }
            }
        }
    });

    // Window resize
    window.addEventListener('resize', resizeCanvas);
}

// Start sending movement updates
function startMovementUpdates() {
    // Clear any existing interval to prevent duplicates
    stopMovementUpdates();
    // Send updates at a fixed interval
    socketIntervalId = setInterval(() => {
        sendMovementUpdates();
    }, socketIntervalTime);
}

// Stop sending movement updates
function stopMovementUpdates() {
    if (socketIntervalId) {
        clearInterval(socketIntervalId);
        socketIntervalId = null;
    }
}

// Send movement updates to the server
function sendMovementUpdates() {
    if (!gameState.isConnected || !gameState.playerId) return;

    const player = gameState.players[gameState.playerId];
    if (!player) return;

    // Calculate tank direction from velocity (direction tank body faces)
    let tankDirection = player.tankDirection || 0;
    if (lastInputDirection.x !== 0 || lastInputDirection.y !== 0) {
        tankDirection = Math.atan2(lastInputDirection.y, lastInputDirection.x);
    }
    player.tankDirection = tankDirection;

    // Send movement data to server with correct type and all required fields
    sendToServer('move', {
        x: player.x,
        y: player.y,
        angle: gameState.mouse.angle,
        tankDirection: tankDirection,
        velocity: tankVelocity,
        isSprinting: isSprinting
    });
}

// Direct tank control without drifting
function updateTankPhysics(inputX, inputY) {
    let maxSpeed = isSprinting ? TANK_SPRINT_MAX_SPEED : TANK_MAX_SPEED;

    // Apply enhanced player recoil with smooth sliding animation (no rotation, just push back)
    if (playerRecoil.active) {
        // Apply knockback force without affecting tank rotation
        tankVelocity.x += playerRecoil.vx * TANK_ACCELERATION;
        tankVelocity.y += playerRecoil.vy * TANK_ACCELERATION;

        // Smooth exponential decay for sliding effect
        playerRecoil.vx *= 0.88;
        playerRecoil.vy *= 0.88;

        // Decrease duration counter
        if (playerRecoil.duration) {
            playerRecoil.duration--;
        }

        // Stop recoil when very small or duration expired
        if ((Math.abs(playerRecoil.vx) < 0.3 && Math.abs(playerRecoil.vy) < 0.3) || playerRecoil.duration <= 0) {
            playerRecoil.vx = 0;
            playerRecoil.vy = 0;
            playerRecoil.active = false;
            playerRecoil.duration = 0;
        }
    }

    if (inputX !== 0 || inputY !== 0) {
        // Direct control - smooth sliding movement like the deceleration
        const targetVelocityX = inputX * maxSpeed;
        const targetVelocityY = inputY * maxSpeed;

        // Ultra-smooth acceleration matching the sliding deceleration feel
        tankVelocity.x += (targetVelocityX - tankVelocity.x) * 0.1;
        tankVelocity.y += (targetVelocityY - tankVelocity.y) * 0.1;
    } else {
        // Smooth gradual deceleration when no input (no hard stops)
        tankVelocity.x *= 0.93;
        tankVelocity.y *= 0.93;

        // Only stop when velocity is extremely small (prevents floating point drift)
        if (Math.abs(tankVelocity.x) < 0.01) tankVelocity.x = 0;
        if (Math.abs(tankVelocity.y) < 0.01) tankVelocity.y = 0;
    }

    // Limit maximum velocity
    const currentSpeed = Math.sqrt(tankVelocity.x * tankVelocity.x + tankVelocity.y * tankVelocity.y);
    if (currentSpeed > maxSpeed) {
        const speedRatio = maxSpeed / currentSpeed;
        tankVelocity.x *= speedRatio;
        tankVelocity.y *= speedRatio;
    }
}

// Helper function to check if a position is near a wall (hexagon collision)
function isNearWall(x, y) {
    // Helper function to calculate distance between two points (defined inline)
    function distance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    const TANK_RADIUS = TANK_SIZE / 2; // Tank collision radius (60 pixels for better collision detection)
    const HEX_SIZE = 40; // Must match server hexagon size

    for (const wall of gameState.walls) {
        const centerX = wall.x;
        const centerY = wall.y;
        const hexRadius = wall.radius || HEX_SIZE;

        // Check collision with proper hitbox distance
        if (distance({ x: x, y: y }, { x: centerX, y: centerY }) < hexRadius + TANK_RADIUS) {
            // More precise hexagon collision check
            // Calculate angle from hexagon center to tank
            const angle = Math.atan2(y - centerY, x - centerX);

            // Find the closest hexagon edge
            let minDistance = Infinity;
            for (let i = 0; i < 6; i++) {
                const hexAngle1 = (Math.PI / 3) * i - Math.PI / 6;
                const hexAngle2 = (Math.PI / 3) * (i + 1) - Math.PI / 6;

                const x1 = centerX + hexRadius * Math.cos(hexAngle1);
                const y1 = centerY + hexRadius * Math.sin(hexAngle1);
                const x2 = centerX + hexRadius * Math.cos(hexAngle2);
                const y2 = centerY + hexRadius * Math.sin(hexAngle2);

                // Distance from point to line segment
                const dist = distanceToSegment(x, y, x1, y1, x2, y2);
                minDistance = Math.min(minDistance, dist);
            }

            // Block if the hitbox touches the wall
            if (minDistance < TANK_RADIUS) {
                return true;
            }
        }
    }
    return false;
}

// Helper function to calculate distance from point to line segment
function distanceToSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// Hex terrain system removed - using custom created maps instead

function updateCamera(player) {
    // Only update camera for our own player
    if (!player || player.id !== gameState.playerId) return;

    // Skip camera update if player position is not valid (prevents NaN camera values)
    if (!Number.isFinite(player.x) || !Number.isFinite(player.y)) return;

    // Initialize zoom if not set
    if (!gameState.camera.zoom) {
        gameState.camera.zoom = 1;
    }

    // Store player position in camera for reference
    // The actual centering is done in the render function
    gameState.camera.x = player.x;
    gameState.camera.y = player.y;
    gameState.camera.initialized = true;
}

function gameLoop() {
    if (!gameState.isInLobby) {
        update();
        render();
        animationId = requestAnimationFrame(gameLoop);
    }
}

function update() {
    // Update animation manager for all animations
    if (window.tankAnimationManager) {
        window.tankAnimationManager.update();
    }

    // Update asteroids
    updateAsteroids();

    // ===== CLIENT-SIDE PHYSICS UPDATE (EVERY FRAME FOR SMOOTH MOVEMENT) =====
    if (gameState.playerId && gameState.players[gameState.playerId]) {
        const player = gameState.players[gameState.playerId];

        // Calculate input direction
        let inputX = 0, inputY = 0;

        const wPressed = gameState.keys['w'] || gameState.keys['ArrowUp'] || gameState.keys['KeyW'];
        const sPressed = gameState.keys['s'] || gameState.keys['ArrowDown'] || gameState.keys['KeyS'];
        const aPressed = gameState.keys['a'] || gameState.keys['ArrowLeft'] || gameState.keys['KeyA'];
        const dPressed = gameState.keys['d'] || gameState.keys['ArrowRight'] || gameState.keys['KeyD'];

        if (wPressed) inputY -= 1;
        if (sPressed) inputY += 1;
        if (aPressed) inputX -= 1;
        if (dPressed) inputX += 1;

        // Normalize diagonal movement
        if (inputX !== 0 && inputY !== 0) {
            const length = Math.sqrt(inputX * inputX + inputY * inputY);
            inputX /= length;
            inputY /= length;
        }

        // Store last input for physics calculation
        lastInputDirection.x = inputX;
        lastInputDirection.y = inputY;

        // Update tank physics with sliding effect (EVERY FRAME)
        updateTankPhysics(inputX, inputY);

        // Initialize smooth position tracking if not exists
        if (typeof player.smoothX === 'undefined') {
            player.smoothX = player.x;
            player.smoothY = player.y;
        }

        // CLIENT-SIDE PREDICTION: Apply velocity to actual position immediately
        player.x += tankVelocity.x;
        player.y += tankVelocity.y;

        // Smooth visual position = actual position (no interpolation needed)
        player.smoothX = player.x;
        player.smoothY = player.y;

        // No boundaries - player can move freely on the created map

        // Hazard terrain check removed - using custom created maps only

        // Update movement animation
        const currentSpeed = Math.sqrt(tankVelocity.x * tankVelocity.x + tankVelocity.y * tankVelocity.y);
        const isMoving = currentSpeed > 0.5;

        const playerTank = player.selectedTank || gameState.selectedTank;
        const assetKey = `${playerTank.color}_${playerTank.body}`;
        const animKey = `${player.id}_${assetKey}`;
        let anim = spriteAnimations.tanks[animKey];

        if (!anim) {
            anim = initSpriteAnimation('tanks', player.id, assetKey);
        }

        if (isMoving) {
            anim.isPlaying = true;
            anim.loop = true;
            anim.frameDuration = 40;

            if (player.currentRotation !== undefined) {
                createExhaustSmoke(player.x, player.y, player.currentRotation, tankVelocity);
            }
        } else {
            anim.isPlaying = false;
            anim.currentFrame = 0;
        }
    }

    // Update sprite animations (16ms ~= 60fps)
    Object.values(gameState.players).forEach(player => {
        const playerTank = player.selectedTank || gameState.selectedTank;
        const tankAssetKey = `${playerTank.color}_${playerTank.body}`;
        const weaponAssetKey = `${playerTank.color}_${playerTank.weapon}`;

        // Calculate if this player is moving (for other players, check position changes)
        let isMoving = false;
        if (player.id === gameState.playerId) {
            const currentSpeed = Math.sqrt(tankVelocity.x * tankVelocity.x + tankVelocity.y * tankVelocity.y);
            isMoving = currentSpeed > 0.5;
        } else {
            // For other players, check if they have recent position updates
            if (player.lastPosition) {
                const dx = player.x - player.lastPosition.x;
                const dy = player.y - player.lastPosition.y;
                const speed = Math.sqrt(dx * dx + dy * dy);
                isMoving = speed > 0.5;
            }
            // Store current position for next frame comparison
            player.lastPosition = { x: player.x, y: player.y };
        }

        // Update tank body animation state
        const tankAnimKey = `${player.id}_${tankAssetKey}`;
        let tankAnim = spriteAnimations.tanks[tankAnimKey];

        if (!tankAnim) {
            tankAnim = initSpriteAnimation('tanks', player.id, tankAssetKey);
        }

        if (tankAnim) {
            tankAnim.isPlaying = isMoving;
            tankAnim.loop = true;
            tankAnim.frameDuration = 40;

            if (!isMoving) {
                tankAnim.currentFrame = 0;
            }
        }

        updateSpriteAnimation('tanks', player.id, tankAssetKey, 16);
        updateSpriteAnimation('weapons', player.id, weaponAssetKey, 16);
    });

    // Update bullet positions on client side for smooth movement
    gameState.bullets.forEach(bullet => {
        if (bullet.vx !== undefined && bullet.vy !== undefined) {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
        }
    });

    // Smooth health/shield animation - faster for smoother counting
    const healthSpeed = 0.25;
    displayHealth += (targetHealth - displayHealth) * healthSpeed;
    displayShield += (targetShield - displayShield) * healthSpeed;

    // Interpolate other players' positions for smooth movement
    Object.values(gameState.players).forEach(player => {
        if (player.id !== gameState.playerId && player.targetX !== undefined && player.targetY !== undefined) {
            // Smooth interpolation towards target position
            const interpSpeed = 1;
            player.x += (player.targetX - player.x) * interpSpeed;
            player.y += (player.targetY - player.y) * interpSpeed;
        }
    });

    // Update sprint system
    updateSprintSystem();

    // Update gun recoil animation
    updateGunRecoil();

    // Update power-ups
    updatePowerUps();

    // Update combo system
    if (comboTimer > 0) {
        comboTimer -= 16;
        if (comboTimer <= 0) {
            comboMultiplier = 1;
        }
    }

    // Update kill streak timer
    if (killStreakTimer > 0) {
        killStreakTimer -= 16;
        if (killStreakTimer <= 0) {
            resetKillStreak();
        }
    }

    // Update screen distortion
    if (screenDistortion.intensity > 0) {
        screenDistortion.intensity *= 0.95;
        if (screenDistortion.intensity < 0.1) {
            screenDistortion.intensity = 0;
            screenDistortion.type = 'none';
        }
    }

    // Auto-fire when Q is held down
    if (autoFireEnabled && !gameState.isInLobby) {
        const currentTime = Date.now();
        const player = gameState.players[gameState.playerId];

        const hasRapidFire = activePowerUps.some(p => p.effect === 'rapidFire');
        const cooldown = hasRapidFire ? SHOT_COOLDOWN / 2 : SHOT_COOLDOWN;

        if (player && gameState.isConnected && (currentTime - lastShotTime) >= cooldown) {
            // Use smoothGunAngle if available for perfect bullet-weapon alignment
            let shootAngle = gameState.mouse.angle;
            if (player.smoothGunAngle !== undefined) {
                shootAngle = player.smoothGunAngle;
            }

            sendToServer('playerShoot', {
                angle: shootAngle,
                tankVelocity: { x: tankVelocity.x, y: tankVelocity.y }
            });

            // Update last shot time
            lastShotTime = currentTime;

            // Trigger realistic gun recoil animation
            gunRecoilAnimation.left = 4;
            gunRecoilAnimation.shake = 1;

            // Enhanced player recoil (push back) animation with smooth sliding
            const recoilForce = 0.4;
            const recoilAngle = shootAngle + Math.PI;
            playerRecoil.vx = Math.cos(recoilAngle) * recoilForce;
            playerRecoil.vy = Math.sin(recoilAngle) * recoilForce;
            playerRecoil.active = true;
            playerRecoil.duration = 12;

            // Create explosion effect at bullet spawn
            const weaponVisualAngle = shootAngle + Math.PI / 2;
            const bulletAngle = weaponVisualAngle - Math.PI / 2;
            const weaponOffset = 80;
            createExplosion(player.x + Math.cos(bulletAngle) * weaponOffset,
                player.y + Math.sin(bulletAngle) * weaponOffset, 0.3);

            // Trigger weapon and tank body shooting animation with muzzle flash
            triggerWeaponAnimation(gameState.selectedTank, gameState.playerId);
            triggerTankBodyAnimation(gameState.selectedTank, gameState.playerId);
            triggerMuzzleFlash(gameState.playerId);
        }
    }

    // Handle shape respawn timers
    for (const shapeId in gameState.shapeSpawnTimers) {
        gameState.shapeSpawnTimers[shapeId] -= 0.016;
        if (gameState.shapeSpawnTimers[shapeId] <= 0) {
            sendToServer('requestShapeSpawn', { type: 'PENTAGON', color: '#1E90FF' });
            delete gameState.shapeSpawnTimers[shapeId];
        }
    }

    // Only update movement for the current player
    if (!gameState.playerId || !gameState.players[gameState.playerId]) return;

    const player = gameState.players[gameState.playerId];
    if (!player) return;

    // Smooth tank rotation animation for all players (360 degrees based on WASD movement)
    Object.values(gameState.players).forEach(p => {
        // Calculate tank rotation from velocity for own player, use server value for others
        let targetRotation;
        if (p.id === gameState.playerId) {
            // For own player, calculate rotation from input direction (not velocity to avoid recoil rotation)
            if (Math.abs(lastInputDirection.x) > 0.01 || Math.abs(lastInputDirection.y) > 0.01) {
                targetRotation = Math.atan2(lastInputDirection.y, lastInputDirection.x);
            } else if (p.currentRotation !== undefined) {
                // Keep current rotation if not moving
                targetRotation = p.currentRotation;
            } else {
                targetRotation = 0;
            }
        } else {
            // For other players, use the server-provided tankDirection (already in radians from atan2)
            targetRotation = p.tankDirection !== undefined ? p.tankDirection : 0;
        }

        // Initialize rotation if not set
        if (p.currentRotation === undefined) {
            p.currentRotation = targetRotation;
        }

        // Smooth interpolation to target rotation with slower speed for 360-degree rotation
        let diff = targetRotation - p.currentRotation;

        // Normalize to [-PI, PI] for shortest rotation path
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;

        // Slower, smoother interpolation for full 360-degree rotation visibility
        const rotationSpeed = 0.15; // Slower than before (was 0.35) for smoother 360 rotation
        p.currentRotation += diff * rotationSpeed;

        // Keep rotation in full 360-degree range without normalization wrapping
        // This allows the rotation to accumulate and show full 360-degree turns
        if (p.currentRotation > Math.PI * 4) p.currentRotation -= Math.PI * 2;
        if (p.currentRotation < -Math.PI * 4) p.currentRotation += Math.PI * 2;

        // Initialize smooth gun rotation if not exists
        if (p.smoothGunAngle === undefined) {
            p.smoothGunAngle = p.angle || 0;
        }

        // Smooth gun rotation for all players - weapon follows mouse 360 degrees
        // For local player, use direct mouse angle for instant response
        // For other players, use server-provided angle
        let targetGunAngle;
        if (p.id === gameState.playerId) {
            // Local player: use direct mouse angle for instant 360° rotation
            targetGunAngle = gameState.mouse.angle;
        } else {
            // Other players: use server-provided angle
            targetGunAngle = p.angle || 0;
        }

        if (targetGunAngle !== undefined) {
            let gunDiff = targetGunAngle - p.smoothGunAngle;

            // Normalize to [-PI, PI] to find shortest rotation path
            while (gunDiff > Math.PI) gunDiff -= 2 * Math.PI;
            while (gunDiff < -Math.PI) gunDiff += 2 * Math.PI;

            // Smooth gun interpolation
            p.smoothGunAngle += gunDiff * GUN_ROTATION_SPEED;

            // Keep angle in valid range but allow full rotation
            if (p.smoothGunAngle > Math.PI * 4) p.smoothGunAngle -= Math.PI * 2;
            if (p.smoothGunAngle < -Math.PI * 4) p.smoothGunAngle += Math.PI * 2;
        }
    });

    // Update camera for our player only
    updateCamera(player);
}

// Power-up system functions
function spawnPowerUp() {
    if (powerUps.length >= 5) return;

    const types = Object.keys(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const config = POWERUP_TYPES[type];

    powerUps.push({
        id: Date.now() + Math.random(),
        type,
        x: 0,
        y: 0,
        image: config.image,
        color: config.color,
        effect: config.effect,
        duration: config.duration,
        pulse: 0
    });
}

function updatePowerUps() {
    // Server manages spawning, so we don't spawn client-side anymore

    // Update existing power-ups pulse animation
    powerUps.forEach(p => p.pulse += 0.1);

    // Check collision with player
    const player = gameState.players[gameState.playerId];
    if (player) {
        powerUps.forEach(powerUp => {
            const dx = player.x - powerUp.x;
            const dy = player.y - powerUp.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < TANK_SIZE) {
                // Notify server of collection
                sendToServer('collectPowerUp', { powerUpId: powerUp.id });
                collectPowerUp(powerUp);
            }
        });
    }

    // Update active power-ups
    activePowerUps = activePowerUps.filter(p => {
        p.timeLeft -= 16;
        return p.timeLeft > 0;
    });
}

function collectPowerUp(powerUp) {
    createExplosion(powerUp.x, powerUp.y, 0.5);

    if (powerUp.effect === 'bluehealth') {
        // Blue Health: +100 health instantly
        playerHealth = Math.min(maxPlayerHealth, playerHealth + 100);
        updateHealthDisplay();
        showNotification('HEALTH BOOST! +100 Health', '#4169E1');
    }

    // Increase combo
    comboMultiplier = Math.min(5, comboMultiplier + 0.5);
    comboTimer = COMBO_DURATION;
}

// Add power-up to display with circular timer
function addPowerUpToDisplay(effect, icon, color, duration) {
    const display = document.getElementById('powerUpDisplay');
    if (!display) return;

    // Remove existing power-up of same type if present
    const existing = document.getElementById(`powerup-${effect}`);
    if (existing) existing.remove();

    // Create power-up container
    const container = document.createElement('div');
    container.id = `powerup-${effect}`;
    container.style.position = 'relative';
    container.style.width = '70px';
    container.style.height = '70px';

    // Create SVG for circular timer
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '70');
    svg.setAttribute('height', '70');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.transform = 'rotate(-90deg)';

    // Background circle
    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('cx', '35');
    bgCircle.setAttribute('cy', '35');
    bgCircle.setAttribute('r', '32');
    bgCircle.setAttribute('fill', 'none');
    bgCircle.setAttribute('stroke', 'rgba(100, 100, 100, 0.3)');
    bgCircle.setAttribute('stroke-width', '4');

    // Progress circle
    const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    progressCircle.setAttribute('cx', '35');
    progressCircle.setAttribute('cy', '35');
    progressCircle.setAttribute('r', '32');
    progressCircle.setAttribute('fill', 'none');
    progressCircle.setAttribute('stroke', color);
    progressCircle.setAttribute('stroke-width', '4');
    const circumference = 2 * Math.PI * 32;
    progressCircle.setAttribute('stroke-dasharray', circumference);
    progressCircle.setAttribute('stroke-dashoffset', '0');
    progressCircle.style.filter = `drop-shadow(0 0 8px ${color})`;

    svg.appendChild(bgCircle);
    svg.appendChild(progressCircle);

    // Icon container (now using image)
    const iconDiv = document.createElement('div');
    iconDiv.style.position = 'absolute';
    iconDiv.style.top = '50%';
    iconDiv.style.left = '50%';
    iconDiv.style.transform = 'translate(-50%, -50%)';
    iconDiv.style.width = '50px';
    iconDiv.style.height = '50px';
    iconDiv.style.borderRadius = '50%';
    iconDiv.style.background = `${color}33`;
    iconDiv.style.display = 'flex';
    iconDiv.style.alignItems = 'center';
    iconDiv.style.justifyContent = 'center';
    iconDiv.style.border = `3px solid ${color}`;
    iconDiv.style.boxShadow = `0 0 15px ${color}80`;

    // Create image element instead of text
    const img = document.createElement('img');
    img.src = icon;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.objectFit = 'contain';
    iconDiv.appendChild(img);

    container.appendChild(svg);
    container.appendChild(iconDiv);
    display.appendChild(container);

    // Animate timer
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = duration - elapsed;

        if (remaining <= 0) {
            clearInterval(timerInterval);
            container.remove();
            permanentPowerUps[effect] = false;
            showNotification(`${effect.toUpperCase()} EXPIRED`, '#ff5050');
        } else {
            const progress = remaining / duration;
            const offset = circumference * (1 - progress);
            progressCircle.setAttribute('stroke-dashoffset', offset);
        }
    }, 100);
}

function drawPowerUps() {
    // Power-ups removed - function kept for compatibility
    return;
}

// Sprint system update function
function updateSprintSystem() {
    // Handle sprint cooldown
    if (sprintCooldown > 0) {
        sprintCooldown--;
    }

    // Check if any movement keys are pressed
    const isMoving = gameState.keys['w'] || gameState.keys['a'] || gameState.keys['s'] || gameState.keys['d'] ||
        gameState.keys['ArrowUp'] || gameState.keys['ArrowLeft'] || gameState.keys['ArrowDown'] || gameState.keys['ArrowRight'] ||
        gameState.keys['KeyW'] || gameState.keys['KeyA'] || gameState.keys['KeyS'] || gameState.keys['KeyD'];

    // Normal sprint system
    {
        // Normal sprint system
        if (isSprinting && isMoving && sprintStamina > 0) {
            // Drain stamina while sprinting
            sprintStamina -= SPRINT_DRAIN_RATE;
            if (sprintStamina <= 0) {
                sprintStamina = 0;
                isSprinting = false;
                sprintCooldown = SPRINT_COOLDOWN; // Start cooldown when exhausted
            }

            // Add tank body recoil when sprinting
            tankBodyRecoil.targetOffset = 3;
        } else {
            tankBodyRecoil.targetOffset = 0;

            if (!isSprinting && sprintCooldown <= 0) {
                // Regenerate stamina when not sprinting
                sprintStamina += SPRINT_REGEN_RATE;
                if (sprintStamina > SPRINT_DURATION) {
                    sprintStamina = SPRINT_DURATION;
                }
            }
        }
    }

    // Smooth tank body recoil animation
    tankBodyRecoil.offset += (tankBodyRecoil.targetOffset - tankBodyRecoil.offset) * 0.15;

    // Update sprint bar UI
    updateSprintBar();

    // Update kill streak display
    updateKillStreakDisplay();
}

// Update sprint bar display
function updateSprintBar() {
    const sprintBar = document.getElementById('sprintBar');
    const sprintValue = document.getElementById('sprintValue');

    if (sprintBar) {
        const percentage = (sprintStamina / SPRINT_DURATION) * 100;
        sprintBar.style.width = percentage + '%';

        // Change color based on stamina level
        if (percentage > 60) {
            sprintBar.style.background = 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)';
        } else if (percentage > 30) {
            sprintBar.style.background = 'linear-gradient(90deg, #FF8C00 0%, #FF6347 50%, #FF4500 100%)';
        } else {
            sprintBar.style.background = 'linear-gradient(90deg, #FF4500 0%, #DC143C 50%, #B22222 100%)';
        }
    }

    if (sprintValue) {
        sprintValue.textContent = Math.ceil(sprintStamina);
    }
}

// Update kill streak display
function updateKillStreakDisplay() {
    const display = document.getElementById('killStreakDisplay');
    if (!display) return;

    if (killStreak > 0) {
        display.style.display = 'block';
        const number = display.querySelector('.streak-number');
        const label = display.querySelector('.streak-label');

        if (number) number.textContent = killStreak;

        // Update color based on streak
        if (killStreak >= 15) {
            display.style.borderColor = 'rgba(0, 255, 255, 0.8)';
            display.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(138, 43, 226, 0.3))';
        } else if (killStreak >= 10) {
            display.style.borderColor = 'rgba(255, 0, 255, 0.8)';
            display.style.background = 'linear-gradient(135deg, rgba(255, 0, 255, 0.3), rgba(255, 20, 147, 0.3))';
        } else if (killStreak >= 7) {
            display.style.borderColor = 'rgba(255, 0, 0, 0.8)';
            display.style.background = 'linear-gradient(135deg, rgba(255, 0, 0, 0.3), rgba(220, 20, 60, 0.3))';
        } else if (killStreak >= 5) {
            display.style.borderColor = 'rgba(255, 107, 0, 0.8)';
            display.style.background = 'linear-gradient(135deg, rgba(255, 107, 0, 0.3), rgba(255, 69, 0, 0.3))';
        }
    } else {
        display.style.display = 'none';
    }
}

// Update gun recoil animation and muzzle flashes
function updateGunRecoil() {
    // Smoothly reduce recoil animation for own player with more realistic physics
    if (gunRecoilAnimation.left > 0) {
        gunRecoilAnimation.left *= 0.75; // Faster initial recovery
        if (gunRecoilAnimation.left < 0.3) gunRecoilAnimation.left = 0;
    }

    // Add barrel shake effect for realism
    if (gunRecoilAnimation.shake > 0) {
        gunRecoilAnimation.shake *= 0.8;
        if (gunRecoilAnimation.shake < 0.2) gunRecoilAnimation.shake = 0;
    }

    // Update recoil animation for other players
    Object.keys(otherPlayerGunRecoils).forEach(playerId => {
        const recoil = otherPlayerGunRecoils[playerId];

        if (recoil.left > 0) {
            recoil.left *= 0.75;
            if (recoil.left < 0.3) recoil.left = 0;
        }

        if (recoil.shake > 0) {
            recoil.shake *= 0.8;
            if (recoil.shake < 0.2) recoil.shake = 0;
        }

        // Clean up recoil data if player is no longer in game
        if (!gameState.players[playerId]) {
            delete otherPlayerGunRecoils[playerId];
        }
    });

    // Update muzzle flashes with dynamic intensity curves
    const currentTime = Date.now();
    Object.keys(muzzleFlashes).forEach(playerId => {
        const flash = muzzleFlashes[playerId];
        const elapsed = currentTime - flash.startTime;

        if (elapsed >= flash.duration) {
            delete muzzleFlashes[playerId];
        } else {
            // Advanced intensity curve for realistic flash behavior
            const progress = elapsed / flash.duration;
            if (progress < 0.1) {
                // Initial bright flash
                flash.intensity = 1.0;
            } else if (progress < 0.3) {
                // Quick bright to medium transition
                flash.intensity = 1.0 - ((progress - 0.1) * 2); // Fast fade from 100% to 60%
            } else {
                // Gradual fade to zero
                flash.intensity = 0.6 * (1 - ((progress - 0.3) / 0.7)); // Slow fade from 60% to 0%
            }

            // Add subtle flicker effect
            flash.intensity *= 0.9 + Math.random() * 0.1;
        }

        // Clean up flash data if player is no longer in game
        if (!gameState.players[playerId]) {
            delete muzzleFlashes[playerId];
        }
    });
}

// Update health display - dual system (shield + health)
function updateHealthDisplay() {
    const healthBar = document.getElementById('healthBar');
    const healthValue = document.getElementById('healthValue');
    const shieldBar = document.getElementById('shieldBar');
    const shieldValue = document.getElementById('shieldValue');

    // Clamp values to max of 100
    playerHealth = Math.min(100, Math.max(0, playerHealth));
    playerShield = Math.min(100, Math.max(0, playerShield));

    // Set target values for smooth animation
    targetHealth = playerHealth;
    targetShield = playerShield;

    // Update shield bar (blue) - fills from left to right (max 100)
    if (shieldBar) {
        const percentage = Math.min(100, Math.max(0, (displayShield / 100) * 100));
        shieldBar.style.width = percentage + '%';
    }

    if (shieldValue) {
        // Display whole number for smooth counting animation
        shieldValue.textContent = Math.round(Math.min(100, Math.max(0, displayShield)));
    }

    // Update health bar (green) - fills from left to right (max 100)
    if (healthBar) {
        const percentage = Math.min(100, Math.max(0, (displayHealth / 100) * 100));
        healthBar.style.width = percentage + '%';
    }

    if (healthValue) {
        // Display whole number for smooth counting animation
        healthValue.textContent = Math.round(Math.min(100, Math.max(0, displayHealth)));
    }
}

function render() {
    // Clear canvas with bright blue water background
    ctx.fillStyle = '#4a9ad8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context for camera transform
    ctx.save();

    // Apply camera transformation to center the player tank
    const zoom = gameState.camera.zoom || 1;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Get player position
    const player = Object.values(gameState.players).find(p => p.id === gameState.playerId);
    
    if (player) {
        // Center the player tank on screen
        ctx.translate(centerX, centerY);
        ctx.scale(zoom, zoom);
        ctx.translate(-player.x, -player.y);
    } else {
        // Fallback if no player found
        ctx.translate(centerX, centerY);
        ctx.scale(zoom, zoom);
        ctx.translate(-gameState.camera.x, -gameState.camera.y);
    }

    // Draw water tiles background AFTER camera transform (like create map editor)
    drawWaterBackground();

    // Render map (ground tiles and buildings)
    if (window.MapRenderer && window.MapRenderer.currentMap) {
        window.MapRenderer.render(ctx, gameState, canvas);
    }

    // Render asteroids
    renderAsteroids();
    
    // Asteroids are now rendered by the renderAsteroids() function above

    // Draw player tank only
    drawPlayers();

    // Restore context
    ctx.restore();
}

// Water background rendering for main game - matches create map editor positioning exactly
function drawWaterBackground() {
    const tileWidth = 120;
    const tileHeight = 30;
    const drawHeight = 70;
    const zoom = gameState.camera.zoom || 1;

    // Get player position (camera center)
    const player = Object.values(gameState.players).find(p => p.id === gameState.playerId);
    const centerX = player ? player.x : (gameState.camera.x || 0);
    const centerY = player ? player.y : (gameState.camera.y || 0);

    // Calculate viewport dimensions in world coordinates
    const viewWidth = canvas.width / zoom;
    const viewHeight = canvas.height / zoom;

    // Calculate visible viewport bounds in world coordinates centered on player
    const viewLeft = centerX - viewWidth / 2;
    const viewTop = centerY - viewHeight / 2;
    const viewRight = centerX + viewWidth / 2;
    const viewBottom = centerY + viewHeight / 2;

    // Add generous padding to ensure full screen coverage
    const paddingX = tileWidth * 4;
    const paddingY = drawHeight * 6; // Extra padding for tile overlap

    // Calculate tile range - only visible tiles
    const startCol = Math.floor((viewLeft - paddingX) / tileWidth);
    const endCol = Math.ceil((viewRight + paddingX) / tileWidth);
    const startRow = Math.floor((viewTop - paddingY) / tileHeight);
    const endRow = Math.ceil((viewBottom + paddingY) / tileHeight);

    // Draw water tiles
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            // Calculate isometric position
            const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
            const isoY = row * tileHeight;

            // Draw water tile with isometric shape
            drawWaterTile(isoX, isoY, tileWidth, drawHeight);
        }
    }
}

// Draw a single water tile
function drawWaterTile(x, y, width, height) {
    // Isometric diamond points
    const top = { x: x + width / 2, y: y };
    const right = { x: x + width, y: y + height / 2 };
    const bottom = { x: x + width / 2, y: y + height };
    const left = { x: x, y: y + height / 2 };

    // Enhanced water gradient with vibrant colors
    const gradient = ctx.createLinearGradient(left.x, top.y, right.x, bottom.y);
    gradient.addColorStop(0, '#4a9ad8');    // Brighter blue (top-left, lit by sun)
    gradient.addColorStop(0.3, '#3a8ac8');  // Medium blue
    gradient.addColorStop(0.7, '#2a7ab8');  // Darker blue
    gradient.addColorStop(1, '#1a6aa8');    // Deep blue (bottom-right, shadow)

    // Draw the water diamond
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(right.x, right.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.lineTo(left.x, left.y);
    ctx.closePath();
    ctx.fill();

    // Enhanced border for better definition
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Bright highlight on top-left edge (sun reflection)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(left.x, left.y);
    ctx.stroke();

    // Secondary highlight (water shimmer)
    ctx.strokeStyle = 'rgba(150, 200, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(top.x + 2, top.y + 2);
    ctx.lineTo(left.x + 4, left.y);
    ctx.stroke();

    // Deep shadow on bottom-right edge
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(right.x, right.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.stroke();

    // Add subtle inner glow for water depth
    ctx.save();
    ctx.globalAlpha = 0.2;
    const centerX = (left.x + right.x) / 2;
    const centerY = (top.y + bottom.y) / 2;
    const radialGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.4);
    radialGradient.addColorStop(0, 'rgba(120, 200, 255, 0.4)');
    radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGradient;
    ctx.fill();
    ctx.restore();
}

// ============================================
// GROUND RENDERING SYSTEM - 3D-STYLE
// ============================================

/**
 * 3D-style ground with perspective grid (2D canvas implementation)
 */
// Ground rendering removed - only show created maps
function drawGround() {
    // No default ground rendering - maps provide their own
}

function drawGrid() {
    // No grid rendering
}

function drawHexagonShape(ctx, centerX, centerY, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = centerX + size * Math.cos(angle);
        const y = centerY + size * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.stroke();
}

function drawArenaFence() {
    // Fence removed - no boundary rendering
}

// Wall hit animations
let wallHitAnimations = [];

function drawWalls() {
    const time = Date.now() * 0.001;
    const hexSize = 60;  // Bigger hexagons to match ground grid (was 40)

    gameState.walls.forEach((wall, index) => {
        ctx.save();

        const centerX = wall.x;
        const centerY = wall.y;
        const hexagonSize = wall.radius || hexSize;

        // Check for hit animation
        const hitAnim = wallHitAnimations.find(a => a.wallId === wall.id);
        const hitPulse = hitAnim ? 1 + (hitAnim.intensity * 0.3) : 1;

        // Draw shadow hexagon
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = centerX + 4 + hexagonSize * Math.cos(angle);
            const y = centerY + 4 + hexagonSize * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Dynamic gradient with animated pulse
        const pulse = (Math.sin(time * 1.5 + index * 0.3) * 0.1 + 0.9) * hitPulse;
        const baseColor = gameState.wallColor || '#FF6B6B';

        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 255, g: 107, b: 107 };
        };
        const rgb = hexToRgb(baseColor);

        const wallGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, hexagonSize * hitPulse);
        wallGradient.addColorStop(0, `rgba(${rgb.r}, ${Math.floor(rgb.g * 1.2)}, ${Math.floor(rgb.b * 1.2)}, ${pulse})`);
        wallGradient.addColorStop(0.3, `rgba(${Math.floor(rgb.r * 0.85)}, ${Math.floor(rgb.g * 0.85)}, ${Math.floor(rgb.b * 0.85)}, ${pulse})`);
        wallGradient.addColorStop(0.6, `rgba(${Math.floor(rgb.r * 0.7)}, ${Math.floor(rgb.g * 0.7)}, ${Math.floor(rgb.b * 0.7)}, ${pulse})`);
        wallGradient.addColorStop(1, `rgba(${Math.floor(rgb.r * 0.4)}, ${Math.floor(rgb.g * 0.4)}, ${Math.floor(rgb.b * 0.4)}, ${pulse})`);

        ctx.fillStyle = wallGradient;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = centerX + hexagonSize * hitPulse * Math.cos(angle);
            const y = centerY + hexagonSize * hitPulse * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Glowing border
        const glowIntensity = hitAnim ? 25 + hitAnim.intensity * 10 : 15 + Math.sin(time * 2 + index) * 5;
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = glowIntensity;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = centerX + hexagonSize * hitPulse * Math.cos(angle);
            const y = centerY + hexagonSize * hitPulse * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(${Math.min(255, rgb.r + 100)}, ${Math.min(255, rgb.g + 100)}, ${Math.min(255, rgb.b + 100)}, 0.8)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = centerX + (hexagonSize - 2) * Math.cos(angle);
            const y = centerY + (hexagonSize - 2) * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);


        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = centerX + (hexagonSize - 1) * Math.cos(angle);
            const y = centerY + (hexagonSize - 1) * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();
    });

    // Update wall hit animations
    wallHitAnimations = wallHitAnimations.filter(anim => {
        anim.intensity -= 0.05;
        return anim.intensity > 0;
    });
}

function drawShapes() {
    gameState.shapes.forEach((shape, index) => {
        ctx.save();

        // Add knockback visual effect - slight shake when being knocked back
        let shakeX = 0, shakeY = 0;
        if (shape.knockbackVX || shape.knockbackVY) {
            const intensity = Math.sqrt((shape.knockbackVX || 0) ** 2 + (shape.knockbackVY || 0) ** 2);
            if (intensity > 1) {
                shakeX = (Math.random() - 0.5) * Math.min(intensity * 0.3, 3);
                shakeY = (Math.random() - 0.5) * Math.min(intensity * 0.3, 3);
            }
        }

        ctx.translate(shape.x + shakeX, shape.y + shakeY);

        // Multi-layer shadow for depth
        ctx.save();
        for (let shadowLayer = 0; shadowLayer < 3; shadowLayer++) {
            const shadowOffset = (shadowLayer + 1) * 3;
            const shadowAlpha = 0.5 - shadowLayer * 0.15;

            ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
            ctx.translate(shadowOffset, shadowOffset);
            drawShapeGeometry(ctx, shape.type, shape.size);
            ctx.translate(-shadowOffset, -shadowOffset);
        }
        ctx.restore();

        // Static 3D gradient with fixed light source
        const lightX = -shape.size * 0.3;
        const lightY = -shape.size * 0.3;

        const gradient = ctx.createRadialGradient(
            lightX, lightY, 0,
            0, 0, shape.size / 2
        );

        gradient.addColorStop(0, lightenColor(shape.color, 90));
        gradient.addColorStop(0.2, lightenColor(shape.color, 60));
        gradient.addColorStop(0.4, lightenColor(shape.color, 30));
        gradient.addColorStop(0.7, shape.color);
        gradient.addColorStop(0.9, darkenColor(shape.color, 40));
        gradient.addColorStop(1, darkenColor(shape.color, 70));

        ctx.fillStyle = gradient;

        // Draw shape with 3D effect based on type
        if (shape.type === 'CIRCLE') {
            draw3DCircle(ctx, shape.size, true);
        } else if (shape.type === 'TRIANGLE') {
            draw3DTriangle(ctx, shape.size, true);
        } else if (shape.type === 'STAR') {
            draw3DStar(ctx, shape.size, true);
        } else if (shape.type === 'DIAMOND') {
            draw3DDiamond(ctx, shape.size, true);
        } else if (shape.type === 'PLUS') {
            draw3DPlus(ctx, shape.size, true);
        } else if (shape.type === 'PENTAGON') {
            draw3DPentagon(ctx, shape.size, true);
        }

        // Static border outline
        ctx.shadowBlur = 0;
        ctx.strokeStyle = lightenColor(shape.color, 70);
        ctx.lineWidth = 2;
        drawShapeGeometry(ctx, shape.type, shape.size, true);

        ctx.restore();

        // Enhanced health bar for damaged shapes
        if (shape.health < shape.maxHealth) {
            drawEnhancedHealthBar(shape.x, shape.y - shape.size / 2 - 25, shape.size + 8, shape.health, shape.maxHealth);
        }
    });
}

function drawPlayers() {
    if (!imagesLoaded) return;

    const player = gameState.players[gameState.playerId];
    if (!player) return;

    const playerTank = player.selectedTank || gameState.selectedTank;
    const { tankImg, weaponImg } = getCurrentTankImages(playerTank);

    if (!tankImg || !weaponImg || !tankImg.complete || !weaponImg.complete) return;

    ctx.save();

    // Use smooth position
    const renderX = player.smoothX !== undefined ? player.smoothX : player.x;
    const renderY = player.smoothY !== undefined ? player.smoothY : player.y;
    ctx.translate(renderX, renderY);

    // Tank body rotation
    const currentRotation = player.currentRotation || 0;
    ctx.rotate(currentRotation + Math.PI / 2);

    // Draw tank body with sprite animation
    const tankAssetKey = `${playerTank.color}_${playerTank.body}`;
    const tankAnimKey = `${player.id}_${tankAssetKey}`;
    const tankAnim = spriteAnimations.tanks[tankAnimKey];
    
    // Calculate scale based on image type - consistent regardless of animation state
    const isTankGif = tankImg.src && tankImg.src.includes('.gif');
    const isTankPng = tankImg.src && tankImg.src.includes('.png');
    
    let effectiveTankWidth = tankImg.width;
    if (isTankGif) {
        // GIF: multiply single frame width by frame count to match PNG sprite sheet dimensions
        // Tanks have 2 frames, each 128px wide
        effectiveTankWidth = 128 * 2; // 256px total
    }
    const tankScale = TANK_VISUAL_SIZE / Math.max(effectiveTankWidth, tankImg.height);
    
    if (tankAnim && isTankPng) {
        // PNG sprite sheet - draw specific frame
        const frameWidth = tankAnim.frameWidth || 128;
        const frameHeight = tankAnim.frameHeight || 128;
        const currentFrame = tankAnim.currentFrame || 0;
        
        ctx.drawImage(
            tankImg,
            currentFrame * frameWidth, 0, frameWidth, frameHeight, // Source frame
            -frameWidth * tankScale / 2, -frameHeight * tankScale / 2, // Destination position
            frameWidth * tankScale, frameHeight * tankScale // Destination size
        );
    } else {
        // GIF or static image - draw whole image
        ctx.drawImage(
            tankImg,
            -tankImg.width * tankScale / 2,
            -tankImg.height * tankScale / 2,
            tankImg.width * tankScale,
            tankImg.height * tankScale
        );
    }

    // Reset rotation for weapon
    ctx.rotate(-(currentRotation + Math.PI / 2));

    // Draw weapon with sprite animation
    const weaponAngle = player.smoothGunAngle !== undefined ? player.smoothGunAngle : (player.angle || 0);
    ctx.rotate(weaponAngle + Math.PI / 2);

    const weaponAssetKey = `${playerTank.color}_${playerTank.weapon}`;
    const weaponAnimKey = `${player.id}_${weaponAssetKey}`;
    
    // Check if this is a PNG sprite sheet or GIF
    const isWeaponPng = weaponImg.src && weaponImg.src.includes('.png');
    const isWeaponGif = weaponImg.src && weaponImg.src.includes('.gif');
    
    let weaponAnim = spriteAnimations.weapons[weaponAnimKey];
    
    // Initialize weapon animation if it doesn't exist
    if (!weaponAnim) {
        weaponAnim = initSpriteAnimation('weapons', player.id, weaponAssetKey);
        // Weapon animation starts stopped - only plays when shooting
        weaponAnim.isPlaying = false;
        weaponAnim.loop = false;
        weaponAnim.currentFrame = 0;
    }
    
    // Calculate scale for in-game weapons - double the previous size
    const weaponScale = (TANK_VISUAL_SIZE * 4.32) / Math.max(weaponImg.width, weaponImg.height);
    

    
    if (weaponAnim && isWeaponPng) {
        // PNG sprite sheet - draw specific frame
        const frameWidth = weaponAnim.frameWidth || 128;
        const frameHeight = weaponAnim.frameHeight || 128;
        const currentFrame = weaponAnim.currentFrame || 0;
        

        
        ctx.drawImage(
            weaponImg,
            currentFrame * frameWidth, 0, frameWidth, frameHeight, // Source: single frame from sheet
            -frameWidth * weaponScale / 2, -frameHeight * weaponScale / 2, // Center on tank
            frameWidth * weaponScale, frameHeight * weaponScale // Scaled frame size
        );
    } else {
        // GIF - draw whole image with consistent scale
        ctx.drawImage(
            weaponImg,
            -weaponImg.width * weaponScale / 2,
            -weaponImg.height * weaponScale / 2,
            weaponImg.width * weaponScale,
            weaponImg.height * weaponScale
        );
    }

    ctx.restore();
}

// Draw shape geometry based on type
function drawShapeGeometry(ctx, type, size, strokeOnly = false) {
    if (type === 'CIRCLE') {
        const radius = size / 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        if (strokeOnly) {
            ctx.stroke();
        } else {
            ctx.fill();
        }
    } else if (type === 'TRIANGLE') {
        const height = size / 2;
        const base = size / 2;
        ctx.beginPath();
        ctx.moveTo(0, -height);
        ctx.lineTo(-base, height);
        ctx.lineTo(base, height);
        ctx.closePath();
        if (strokeOnly) {
            ctx.stroke();
        } else {
            ctx.fill();
        }
    } else if (type === 'STAR') {
        const spikes = 5;
        const outerRadius = size / 2;
        const innerRadius = outerRadius * 0.4;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        if (strokeOnly) {
            ctx.stroke();
        } else {
            ctx.fill();
        }
    } else if (type === 'DIAMOND') {
        const radius = size / 2;
        ctx.beginPath();
        ctx.moveTo(0, -radius);          // Top
        ctx.lineTo(radius * 0.6, 0);     // Right
        ctx.lineTo(0, radius);           // Bottom
        ctx.lineTo(-radius * 0.6, 0);    // Left
        ctx.closePath();
        if (strokeOnly) {
            ctx.stroke();
        } else {
            ctx.fill();
        }
    } else if (type === 'PLUS') {
        const radius = size / 2;
        const thickness = radius * 0.3;
        ctx.beginPath();
        // Vertical bar
        ctx.rect(-thickness / 2, -radius, thickness, size);
        // Horizontal bar
        ctx.rect(-radius, -thickness / 2, size, thickness);
        if (strokeOnly) {
            ctx.stroke();
        } else {
            ctx.fill();
        }
    } else if (type === 'PENTAGON') {
        const radius = size / 2;
        const numSides = 5;
        ctx.beginPath();
        for (let i = 0; i < numSides; i++) {
            const angle = (Math.PI * 2 * i) / numSides - Math.PI / 2; // Adjust angle for top point
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        if (strokeOnly) {
            ctx.stroke();
        } else {
            ctx.fill();
        }
    }
}

// Enhanced 3D circle with depth rings
function draw3DCircle(ctx, size, isMainLayer) {
    const radius = size / 2;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    if (isMainLayer) {
        ctx.stroke();

        // Add concentric rings for depth
        for (let i = 1; i <= 3; i++) {
            const ringRadius = radius * (0.8 - i * 0.15);
            const ringAlpha = 0.6 - i * 0.15;

            ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
            ctx.lineWidth = 1.5 - i * 0.3;
            ctx.beginPath();
            ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Central highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(-radius * 0.2, -radius * 0.2, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Enhanced 3D triangle with beveled edges
function draw3DTriangle(ctx, size, isMainLayer) {
    const height = size / 2;
    const base = size / 2;

    ctx.beginPath();
    ctx.moveTo(0, -height);
    ctx.lineTo(-base, height);
    ctx.lineTo(base, height);
    ctx.closePath();
    ctx.fill();

    if (isMainLayer) {
        ctx.stroke();

        // Add beveled edges
        const bevelSize = size * 0.15;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;

        // Inner triangle
        ctx.beginPath();
        ctx.moveTo(0, -height * 0.6);
        ctx.lineTo(-base * 0.6, height * 0.3);
        ctx.lineTo(base * 0.6, height * 0.3);
        ctx.closePath();
        ctx.stroke();

        // Highlight edges
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-base * 0.2, -height * 0.3);
        ctx.lineTo(-base * 0.6, height * 0.3);
        ctx.stroke();

        // Central bright spot
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-size * 0.1, -size * 0.1, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Static 3D star with dimensional spikes
function draw3DStar(ctx, size, isMainLayer) {
    const spikes = 5;
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4;

    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();

    if (isMainLayer) {
        ctx.stroke();

        // Add static dimensional spike highlights
        for (let i = 0; i < spikes; i++) {
            const angle = (i * 2 * Math.PI) / spikes;
            const tipX = Math.cos(angle) * outerRadius * 0.8;
            const tipY = Math.sin(angle) * outerRadius * 0.8;

            // Static spike highlight
            const highlightGradient = ctx.createRadialGradient(
                tipX, tipY, 0,
                tipX, tipY, outerRadius * 0.3
            );
            highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = highlightGradient;
            ctx.beginPath();
            ctx.arc(tipX, tipY, outerRadius * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Static bright core
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(0, 0, innerRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Static energy rings for depth
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        for (let ring = 0; ring < 2; ring++) {
            const ringRadius = innerRadius * (0.8 + ring * 0.3);

            ctx.beginPath();
            ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

// Static 3D diamond with crystalline facets
function draw3DDiamond(ctx, size, isMainLayer) {
    const radius = size / 2;

    ctx.beginPath();
    ctx.moveTo(0, -radius);          // Top
    ctx.lineTo(radius * 0.7, 0);     // Right
    ctx.lineTo(0, radius);           // Bottom
    ctx.lineTo(-radius * 0.7, 0);    // Left
    ctx.closePath();
    ctx.fill();

    if (isMainLayer) {
        ctx.stroke();

        // Create static crystalline facet effect
        const facets = [
            // Top facets (brightest)
            { points: [[0, -radius], [radius * 0.35, -radius * 0.5], [0, 0]], alpha: 0.8 },
            { points: [[0, -radius], [-radius * 0.35, -radius * 0.5], [0, 0]], alpha: 0.6 },
            // Right facets
            { points: [[radius * 0.7, 0], [radius * 0.35, -radius * 0.5], [0, 0]], alpha: 0.5 },
            { points: [[radius * 0.7, 0], [radius * 0.35, radius * 0.5], [0, 0]], alpha: 0.3 },
            // Bottom facets (darkest)
            { points: [[0, radius], [radius * 0.35, radius * 0.5], [0, 0]], alpha: 0.2 },
            { points: [[0, radius], [-radius * 0.35, radius * 0.5], [0, 0]], alpha: 0.1 },
            // Left facets
            { points: [[-radius * 0.7, 0], [-radius * 0.35, -radius * 0.5], [0, 0]], alpha: 0.7 },
            { points: [[-radius * 0.7, 0], [-radius * 0.35, radius * 0.5], [0, 0]], alpha: 0.3 }
        ];

        facets.forEach((facet) => {
            ctx.fillStyle = `rgba(255, 255, 255, ${facet.alpha})`;

            ctx.beginPath();
            ctx.moveTo(facet.points[0][0], facet.points[0][1]);
            ctx.lineTo(facet.points[1][0], facet.points[1][1]);
            ctx.lineTo(facet.points[2][0], facet.points[2][1]);
            ctx.closePath();
            ctx.fill();
        });

        // Static brilliant center sparkle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Static sparkle rays in cross pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const rayAngle = (i * Math.PI) / 2;
            const rayLength = radius * 0.4;

            ctx.save();
            ctx.rotate(rayAngle);
            ctx.beginPath();
            ctx.moveTo(0, -radius * 0.1);
            ctx.lineTo(0, -rayLength);
            ctx.stroke();
            ctx.restore();
        }

        // Static prismatic edge highlights
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-radius * 0.2, -radius * 0.7);
        ctx.lineTo(radius * 0.2, -radius * 0.3);
        ctx.stroke();

        // Additional edge highlight on the right
        ctx.beginPath();
        ctx.moveTo(radius * 0.5, -radius * 0.2);
        ctx.lineTo(radius * 0.3, radius * 0.3);
        ctx.stroke();
    }
}

// Simple green plus shape for health items
function draw3DPlus(ctx, size, isMainLayer) {
    const radius = size / 2;
    const thickness = radius * 0.3;

    // Draw the plus shape base
    ctx.beginPath();
    // Vertical bar
    ctx.rect(-thickness / 2, -radius, thickness, size);
    // Horizontal bar
    ctx.rect(-radius, -thickness / 2, size, thickness);
    ctx.fill();

    if (isMainLayer) {
        // Simple white border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// New function for drawing a 3D Pentagon
function draw3DPentagon(ctx, size, isMainLayer) {
    const radius = size / 2;
    const numSides = 5;

    ctx.beginPath();
    for (let i = 0; i < numSides; i++) {
        const angle = (Math.PI * 2 * i) / numSides - Math.PI / 2; // Adjust angle for top point
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.fill();

    if (isMainLayer) {
        ctx.stroke();

        // Add a subtle glow effect
        ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        ctx.shadowBlur = 10;

        // Add some internal shading for a 3D feel
        const shadeColor = 'rgba(255, 255, 255, 0.3)';
        const shadeSize = radius * 0.3;
        const shadeX = radius * 0.3;
        const shadeY = radius * 0.2;

        // Side shading
        ctx.save();
        ctx.fillStyle = shadeColor;
        ctx.beginPath();
        ctx.moveTo(0, -radius);
        ctx.lineTo(shadeX, -radius * 0.5);
        ctx.lineTo(shadeX, -radius * 0.5 + shadeSize);
        ctx.lineTo(0, -radius + shadeSize);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Bottom shading
        ctx.save();
        ctx.fillStyle = shadeColor;
        ctx.beginPath();
        ctx.moveTo(radius * 0.6, radius * 0.8);
        ctx.lineTo(radius * 0.3, radius);
        ctx.lineTo(radius * 0.3 + shadeSize, radius * 0.9);
        ctx.lineTo(radius * 0.6 + shadeSize, radius * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Central highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawStar(ctx, x, y, radius) {
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius * 0.5;

    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
}

function drawDiamond(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);      // Top point
    ctx.lineTo(x + size * 0.7, y); // Right point
    ctx.lineTo(x, y + size);      // Bottom point
    ctx.lineTo(x - size * 0.7, y); // Left point
    ctx.closePath();
}

function drawEnhancedHealthBar(x, y, width, health, maxHealth) {
    const barWidth = width;
    const barHeight = 6;
    const healthPercent = health / maxHealth;

    ctx.save();

    // Background shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);

    // Background
    ctx.fillStyle = 'rgba(120, 0, 0, 0.8)';
    ctx.fillRect(x - barWidth / 2, y + 1, barWidth, barHeight - 2);

    // Health gradient
    const healthGradient = ctx.createLinearGradient(x - barWidth / 2, 0, x + barWidth / 2, 0);
    if (healthPercent > 0.6) {
        healthGradient.addColorStop(0, '#4CAF50');
        healthGradient.addColorStop(1, '#66BB6A');
    } else if (healthPercent > 0.3) {
        healthGradient.addColorStop(0, '#FF9800');
        healthGradient.addColorStop(1, '#FFB74D');
    } else {
        healthGradient.addColorStop(0, '#F44336');
        healthGradient.addColorStop(1, '#EF5350');
    }

    ctx.fillStyle = healthGradient;
    ctx.fillRect(x - barWidth / 2, y + 1, barWidth * healthPercent, barHeight - 2);

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - barWidth / 2, y, barWidth, barHeight);

    ctx.restore();
}

// New function for drawing a dual health bar (blue shield + green health)
function drawDualHealthBar(x, y, width, health, maxHealth, shield, maxShield) {
    const barWidth = width;
    const barHeight = 8;
    const shieldPercent = shield / maxShield;
    const healthPercent = health / maxHealth;

    ctx.save();

    // Background shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);

    // Background
    ctx.fillStyle = 'rgba(60, 60, 60, 0.8)';
    ctx.fillRect(x - barWidth / 2, y + 1, barWidth, barHeight - 2);

    // Shield bar (blue) - top half
    if (shield > 0) {
        const shieldGradient = ctx.createLinearGradient(x - barWidth / 2, 0, x + barWidth / 2, 0);
        shieldGradient.addColorStop(0, '#2196F3');  // Blue
        shieldGradient.addColorStop(1, '#42A5F5');  // Lighter blue

        ctx.fillStyle = shieldGradient;
        ctx.fillRect(x - barWidth / 2, y + 1, barWidth * shieldPercent, (barHeight - 2) / 2);
    }

    // Health bar (green) - bottom half
    if (health > 0) {
        const healthGradient = ctx.createLinearGradient(x - barWidth / 2, 0, x + barWidth / 2, 0);
        healthGradient.addColorStop(0, '#4CAF50');  // Green
        healthGradient.addColorStop(1, '#66BB6A');  // Lighter green

        ctx.fillStyle = healthGradient;
        ctx.fillRect(x - barWidth / 2, y + 1 + (barHeight - 2) / 2, barWidth * healthPercent, (barHeight - 2) / 2);
    }

    // Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - barWidth / 2, y, barWidth, barHeight);

    // Divider line between shield and health
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x - barWidth / 2, y + barHeight / 2);
    ctx.lineTo(x + barWidth / 2, y + barHeight / 2);
    ctx.stroke();

    ctx.restore();
}

function drawMinimap() {
    const scale = 150 / Math.max(gameState.gameWidth, gameState.gameHeight);

    // Clear minimap
    minimapCtx.fillStyle = '#1a1a2e';
    minimapCtx.fillRect(0, 0, 150, 150);

    // Terrain rendering removed - using custom maps instead

    // Draw border
    minimapCtx.strokeStyle = '#00f7ff';
    minimapCtx.lineWidth = 2;
    minimapCtx.strokeRect(0, 0, 150, 150);

    // Draw walls
    minimapCtx.fillStyle = '#ff4444';
    gameState.walls.forEach(wall => {
        minimapCtx.fillRect(
            wall.x * scale,
            wall.y * scale,
            wall.width * scale,
            wall.height * scale
        );
    });

    // Draw power-ups
    minimapCtx.fillStyle = '#FFD700';
    powerUps.forEach(p => {
        minimapCtx.beginPath();
        minimapCtx.arc(p.x * scale, p.y * scale, 2, 0, Math.PI * 2);
        minimapCtx.fill();
    });

    // Draw other players
    Object.values(gameState.players).forEach(p => {
        if (p.id !== gameState.playerId) {
            minimapCtx.fillStyle = '#ff6666';
            minimapCtx.beginPath();
            minimapCtx.arc(p.x * scale, p.y * scale, 3, 0, Math.PI * 2);
            minimapCtx.fill();
        }
    });

    // Draw player location with direction arrow
    if (gameState.playerId && gameState.players[gameState.playerId]) {
        const player = gameState.players[gameState.playerId];
        const playerX = player.x * scale;
        const playerY = player.y * scale;
        const angle = (player.smoothGunAngle || player.angle) + Math.PI / 2;

        minimapCtx.save();
        minimapCtx.translate(playerX, playerY);
        minimapCtx.rotate(angle);

        // Pulsing glow
        minimapCtx.shadowColor = '#00f7ff';
        minimapCtx.shadowBlur = 5 + Math.sin(Date.now() * 0.005) * 3;

        minimapCtx.fillStyle = '#00f7ff';
        minimapCtx.strokeStyle = '#ffffff';
        minimapCtx.lineWidth = 1;

        minimapCtx.beginPath();
        minimapCtx.moveTo(0, -5);
        minimapCtx.lineTo(-3, 3);
        minimapCtx.lineTo(0, 1);
        minimapCtx.lineTo(3, 3);
        minimapCtx.closePath();
        minimapCtx.fill();
        minimapCtx.stroke();

        minimapCtx.restore();
    }
}

// Draw damage numbers
function drawDamageNumbers() {
    const currentTime = Date.now();

    // Filter out expired damage numbers
    damageNumbers = damageNumbers.filter(dmg => {
        const elapsed = currentTime - dmg.startTime;
        return elapsed < dmg.duration;
    });

    // Draw each damage number
    damageNumbers.forEach(dmg => {
        const elapsed = currentTime - dmg.startTime;
        const progress = elapsed / dmg.duration;

        // Float upward and fade out
        const offsetY = -30 - (progress * 50); // Rise up 50 pixels
        const opacity = 1 - progress; // Fade out

        ctx.save();

        // Draw damage number with outline
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Black outline for visibility
        ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.lineWidth = 4;
        ctx.strokeText(dmg.damage.toString(), dmg.x, dmg.y + offsetY);

        // Yellow fill for damage
        ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
        ctx.fillText(dmg.damage.toString(), dmg.x, dmg.y + offsetY);

        ctx.restore();
    });
}

// Draw hit markers
function drawHitMarkers() {
    const currentTime = Date.now();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    hitMarkers = hitMarkers.filter(marker => {
        const elapsed = currentTime - marker.startTime;
        if (elapsed >= marker.duration) return false;

        const progress = elapsed / marker.duration;
        const opacity = 1 - progress;
        const size = 20 + (progress * 10);

        // Draw X marker in center of screen
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(255, 100, 100, ${opacity})`;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY - size);
        ctx.lineTo(centerX + size, centerY + size);
        ctx.moveTo(centerX + size, centerY - size);
        ctx.lineTo(centerX - size, centerY + size);
        ctx.stroke();

        return true;
    });

    ctx.shadowBlur = 0;
    ctx.restore();
}

// Draw bullets with enhanced trail and spark effects
function drawBullets() {
    const currentTime = Date.now();

    gameState.bullets.forEach(bullet => {
        ctx.save();

        // Translate to bullet position
        ctx.translate(bullet.x, bullet.y);

        // Initialize bullet creation time if not set
        if (!bullet.createdAt) {
            bullet.createdAt = currentTime;
        }

        // Calculate animation time
        const animationTime = (currentTime - bullet.createdAt) * 0.01;
        const speed = Math.sqrt(bullet.vx * bullet.vx + bullet.vy * bullet.vy);

        // Rotate bullet based on movement direction only (no spinning)
        const rotationAngle = Math.atan2(bullet.vy, bullet.vx);
        ctx.rotate(rotationAngle);

        // Enhanced pulsing effect for better visibility
        const pulseScale = 1.3 + Math.sin(animationTime * 0.8) * 0.2;
        ctx.scale(pulseScale, pulseScale);

        // Get bullet color based on weapon color
        const bulletColor = getBulletColorFromWeapon(bullet.color || 'blue');

        // Subtle glow effect for small bullets
        const baseGlow = 3;
        const glowIntensity = baseGlow + Math.sin(animationTime * 0.6) * 1;
        ctx.shadowColor = bulletColor.glow;
        ctx.shadowBlur = glowIntensity;

        // Short bullet trail for small size
        const trailLength = Math.min(8, 4 + speed * 0.12);
        const gradient = ctx.createLinearGradient(-trailLength, 0, 0, 0);
        gradient.addColorStop(0, `rgba(${bulletColor.trail[0]}, ${bulletColor.trail[1]}, ${bulletColor.trail[2]}, 0)`);
        gradient.addColorStop(0.3, `rgba(${bulletColor.mid[0]}, ${bulletColor.mid[1]}, ${bulletColor.mid[2]}, 1.0)`);
        gradient.addColorStop(1, `rgba(${bulletColor.main[0]}, ${bulletColor.main[1]}, ${bulletColor.main[2]}, 1.0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-trailLength, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();

        // Small animated bullet body (10x smaller)
        ctx.shadowBlur = glowIntensity * 2;

        // Outer bullet shell (small size) with weapon color
        ctx.fillStyle = bulletColor.outer;
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner energy core with weapon color
        ctx.save();
        ctx.rotate(-animationTime * 1.2);
        ctx.fillStyle = bulletColor.inner;
        ctx.beginPath();
        ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Bright center
        ctx.shadowBlur = 0;
        const flickerIntensity = 1.0;
        ctx.fillStyle = `rgba(255, 255, 255, ${flickerIntensity})`;
        ctx.beginPath();
        ctx.arc(-0.05, -0.05, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Outer ring for visibility
        ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`;
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    });
}

// Get bullet color scheme based on weapon color
function getBulletColorFromWeapon(weaponColor) {
    const colorSchemes = {
        'blue': {
            trail: [100, 150, 255],
            mid: [150, 200, 255],
            main: [200, 230, 255],
            outer: '#4A9EFF',
            inner: '#A0D0FF',
            glow: '#4A9EFF'
        },
        'camo': {
            trail: [50, 150, 50],
            mid: [100, 200, 100],
            main: [150, 255, 150],
            outer: '#32CD32',
            inner: '#90EE90',
            glow: '#32CD32'
        },
        'desert': {
            trail: [200, 150, 0],
            mid: [255, 200, 50],
            main: [255, 230, 100],
            outer: '#FFD700',
            inner: '#FFFF80',
            glow: '#FFD700'
        },
        'purple': {
            trail: [150, 50, 200],
            mid: [200, 100, 255],
            main: [230, 150, 255],
            outer: '#9400D3',
            inner: '#DA70D6',
            glow: '#9400D3'
        },
        'red': {
            trail: [200, 50, 50],
            mid: [255, 100, 100],
            main: [255, 150, 150],
            outer: '#DC143C',
            inner: '#FF6B8A',
            glow: '#DC143C'
        }
    };

    return colorSchemes[weaponColor] || colorSchemes['blue'];
}

// Advanced realistic muzzle flash system
function drawMuzzleFlash(ctx, weaponImg, gunScale, intensity) {
    ctx.save();

    // Position at weapon tip (closer to match bullet spawn)
    const flashX = 0;
    const flashY = -weaponImg.height * gunScale / 2 + 8; // Moved closer to weapon body

    ctx.translate(flashX, flashY);
    ctx.globalAlpha = intensity;

    // Dynamic flash properties
    const time = Date.now() * 0.01;
    const baseSize = 4;
    const maxSize = baseSize * 1.5;

    // Multi-layer flash for depth
    for (let layer = 0; layer < 3; layer++) {
        ctx.save();

        // Random rotation for each layer
        ctx.rotate((Math.random() - 0.5) * 0.4);

        const layerSize = maxSize - (layer * 0.8);
        const layerAlpha = (1 - layer * 0.3) * intensity;

        // Create dynamic gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, layerSize);

        if (layer === 0) {
            // Outer orange flame
            gradient.addColorStop(0, `rgba(255, 255, 255, ${layerAlpha})`);
            gradient.addColorStop(0.3, `rgba(255, 200, 0, ${layerAlpha * 0.9})`);
            gradient.addColorStop(0.7, `rgba(255, 100, 0, ${layerAlpha * 0.6})`);
            gradient.addColorStop(1, `rgba(255, 50, 0, 0)`);
        } else if (layer === 1) {
            // Middle bright core
            gradient.addColorStop(0, `rgba(255, 255, 255, ${layerAlpha})`);
            gradient.addColorStop(0.4, `rgba(255, 255, 100, ${layerAlpha * 0.8})`);
            gradient.addColorStop(1, `rgba(255, 200, 0, 0)`);
        } else {
            // Inner white hot core
            gradient.addColorStop(0, `rgba(255, 255, 255, ${layerAlpha})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        }

        ctx.fillStyle = gradient;

        // Draw irregular flash shape
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const randomRadius = layerSize * (0.5 + Math.random() * 0.5);
            const x = Math.cos(angle) * randomRadius;
            const y = Math.sin(angle) * randomRadius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Add flying sparks
    ctx.globalAlpha = intensity * 0.8;
    for (let i = 0; i < 6; i++) {
        const sparkAngle = Math.random() * Math.PI * 2;
        const sparkDistance = 2 + Math.random() * 6;
        const sparkX = Math.cos(sparkAngle) * sparkDistance;
        const sparkY = Math.sin(sparkAngle) * sparkDistance;
        const sparkSize = 0.3 + Math.random() * 0.5;

        // Spark trail
        ctx.strokeStyle = `rgba(255, ${150 + Math.random() * 105}, 0, ${0.6 + Math.random() * 0.4})`;
        ctx.lineWidth = sparkSize;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sparkX, sparkY);
        ctx.stroke();

        // Spark head
        ctx.fillStyle = `rgba(255, 255, ${100 + Math.random() * 155}, ${0.8 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // Smoke wisps (very subtle)
    ctx.globalAlpha = intensity * 0.3;
    for (let i = 0; i < 3; i++) {
        const smokeX = (Math.random() - 0.5) * 3;
        const smokeY = -1 - Math.random() * 2;
        const smokeSize = 1 + Math.random();

        ctx.fillStyle = `rgba(100, 100, 100, ${0.2 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// Helper functions for color manipulation
function lightenColor(color, percent) {
    // Simple color lightening - for more complex colors, would need proper color parsing
    if (color.startsWith('hsl')) {
        return color.replace(/(\d+)%\)/, (match, p1) => `${Math.min(100, parseInt(p1) + percent)}%)`);
    }
    return color;
}

function darkenColor(color, percent) {
    // Simple color darkening - for more complex colors, would need proper color parsing
    if (color.startsWith('hsl')) {
        return color.replace(/(\d+)%\)/, (match, p1) => `${Math.max(0, parseInt(p1) - percent)}%)`);
    }
    return color;
}

// UI Updates
function updateUI() {
    updatePlayerCount();
    updatePlayerStats();
}

function updatePlayerCount() {
    const playerCount = Object.keys(gameState.players).length;
    const playerCountElement = document.getElementById('playerCountValue');
    if (playerCountElement) {
        playerCountElement.textContent = playerCount;
    }
}

function updateFortzDisplay() {
    const fortzElement = document.getElementById('fortzAmount');
    if (fortzElement) {
        fortzElement.textContent = gameState.fortzCurrency;
    }
}

// Watch rewarded ad for free Fortz
function watchAdForFortz() {
    if (window.CrazyGamesIntegration) {
        window.CrazyGamesIntegration.showRewardedAd(() => {
            // Give player 100 Fortz as reward
            const rewardAmount = 100;
            gameState.fortzCurrency = (gameState.fortzCurrency || 0) + rewardAmount;
            updateFortzDisplay();

            // Save to server if user is logged in
            if (window.currentUser && window.currentUser.username) {
                sendToServer('updateFortzCurrency', { amount: rewardAmount });
            }

            showNotification(`+${rewardAmount} Fortz! Thanks for watching!`, '#FFD700', 32);
            console.log(`Rewarded ${rewardAmount} Fortz for watching ad`);
        });
    } else {
        showNotification('Ads not available in development mode', '#FFA500', 24);
    }
}

// Enhanced Shop Functions with Modern Square Design
function drawShop() {
    // Determine which context to use (game canvas or lobby canvas)
    let currentCtx = ctx;
    let currentCanvas = canvas;

    if (gameState.isInLobby) {
        const lobbyCanvas = document.getElementById('lobbyBackground');
        if (lobbyCanvas) {
            currentCtx = lobbyCanvas.getContext('2d');
            currentCanvas = lobbyCanvas;
        }
    }

    // Save context
    currentCtx.save();
    currentCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformations for UI

    // Clear shop content area to prevent artifacts
    currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);

    // Full-screen shop background - completely full screen in dev mode
    const time = Date.now() * 0.001;
    const topBarHeight = 0; // Remove top bar space for full screen

    // Enhanced multi-layer gradient background with depth
    const bgGradient = currentCtx.createRadialGradient(
        currentCanvas.width / 2, currentCanvas.height / 2, 0,
        currentCanvas.width / 2, currentCanvas.height / 2, Math.max(currentCanvas.width, currentCanvas.height)
    );
    bgGradient.addColorStop(0, 'rgba(30, 35, 60, 0.98)');
    bgGradient.addColorStop(0.3, 'rgba(20, 25, 45, 0.98)');
    bgGradient.addColorStop(0.7, 'rgba(15, 15, 30, 0.98)');
    bgGradient.addColorStop(1, 'rgba(5, 5, 15, 0.98)');
    currentCtx.fillStyle = bgGradient;
    currentCtx.fillRect(0, 0, currentCanvas.width, currentCanvas.height);

    // Add subtle animated overlay patterns
    drawShopOverlayPatterns(time, currentCtx, currentCanvas);

    // Enhanced tech grid pattern for the shop area
    drawEnhancedTechGrid(time, currentCtx, currentCanvas, 0);

    // Full-screen shop panel dimensions
    const panelX = 0;
    const panelY = 0;
    const panelWidth = currentCanvas.width;
    const panelHeight = currentCanvas.height;

    // Add enhanced ambient lighting effects with particles
    drawEnhancedAmbientEffects(time, currentCtx, currentCanvas);

    // Top bar with currency and leave icon - enhanced styling
    const topBarGradient = currentCtx.createLinearGradient(0, 0, 0, 80);
    topBarGradient.addColorStop(0, 'rgba(0, 15, 25, 0.9)');
    topBarGradient.addColorStop(1, 'rgba(0, 5, 15, 0.7)');
    currentCtx.fillStyle = topBarGradient;
    currentCtx.fillRect(0, 0, currentCanvas.width, 80);

    // Enhanced currency display in upper right
    const creditPulse = 1 + Math.sin(time * 3) * 0.03;
    const creditGlow = 0.8 + Math.sin(time * 4) * 0.2;

    // Currency background panel
    const currencyPanelWidth = 250;
    const currencyPanelHeight = 50;
    const currencyPanelX = currentCanvas.width - currencyPanelWidth - 20;
    const currencyPanelY = 15;

    // Panel gradient background
    const panelGradient = currentCtx.createLinearGradient(
        currencyPanelX, currencyPanelY,
        currencyPanelX + currencyPanelWidth, currencyPanelY + currencyPanelHeight
    );
    panelGradient.addColorStop(0, 'rgba(255, 215, 0, 0.2)');
    panelGradient.addColorStop(0.5, 'rgba(255, 185, 0, 0.15)');
    panelGradient.addColorStop(1, 'rgba(200, 150, 0, 0.1)');

    currentCtx.fillStyle = panelGradient;
    currentCtx.fillRect(currencyPanelX, currencyPanelY, currencyPanelWidth, currencyPanelHeight);

    // Panel border with glow
    currentCtx.strokeStyle = `rgba(255, 215, 0, ${creditGlow})`;
    currentCtx.lineWidth = 2;
    currentCtx.shadowBlur = 8;
    currentCtx.shadowColor = '#FFD700';
    currentCtx.strokeRect(currencyPanelX, currencyPanelY, currencyPanelWidth, currencyPanelHeight);
    currentCtx.shadowBlur = 0;

    // Currency icon
    currentCtx.fillStyle = `rgba(255, 215, 0, ${creditGlow})`;
    currentCtx.font = 'bold 20px "Courier New", monospace';
    currentCtx.textAlign = 'left';
    currentCtx.textBaseline = 'middle';
    currentCtx.shadowBlur = 6;
    currentCtx.shadowColor = '#FFD700';
    currentCtx.fillText('⚡', currencyPanelX + 15, currencyPanelY + 32);

    // Currency text with enhanced styling
    currentCtx.save();
    currentCtx.scale(creditPulse, creditPulse);
    currentCtx.fillStyle = `rgba(255, 255, 255, ${creditGlow})`;
    currentCtx.font = 'bold 18px "Courier New", monospace';
    currentCtx.textAlign = 'right';
    currentCtx.shadowBlur = 6;
    currentCtx.shadowColor = '#FFD700';
    const creditText = `${gameState.fortzCurrency.toLocaleString()} FORTZ`;
    const textX = (currencyPanelX + currencyPanelWidth - 15) / creditPulse;
    const textY = (currencyPanelY + 32) / creditPulse;
    currentCtx.fillText(creditText, textX, textY);
    currentCtx.restore();
    currentCtx.shadowBlur = 0;

    // Leave icon on the left side of the top bar - show when any feature is open
    const showLeaveIcon = true; // Always show in shop view
    if (showLeaveIcon) {
        const leaveIconSize = 30;
        const leaveIconX = 40;
        const leaveIconY = (topBarHeight - leaveIconSize) / 2;

        // Add a click area for the leave icon
        if (!window.shopClickAreas) window.shopClickAreas = {};
        window.shopClickAreas['leave_icon'] = {
            x: leaveIconX - 5, y: leaveIconY - 5, width: leaveIconSize + 10, height: leaveIconSize + 10,
            action: gameState.isInLobby ? 'close_shop' : 'leave_lobby'
        };
    }

    // Close button in top-right corner for ANY open feature (not just inside showLeaveIcon block)
    const closeButtonSize = 50;
    const closeButtonX = currentCanvas.width - closeButtonSize - 30;
    const closeButtonY = 120; // Same Y position as shop

    const isMouseOverCloseBtn = gameState.mouse &&
        gameState.mouse.x >= closeButtonX && gameState.mouse.x <= closeButtonX + closeButtonSize &&
        gameState.mouse.y >= closeButtonY && gameState.mouse.y <= closeButtonY + closeButtonSize;

    const closeBtnHoverScale = isMouseOverCloseBtn ? 1.1 : 1.0;
    const closeBtnOpacity = isMouseOverCloseBtn ? 1.0 : 0.8;
    const closeBtnGlow = isMouseOverCloseBtn ? 15 : 8;

    currentCtx.save();
    currentCtx.translate(closeButtonX + closeButtonSize / 2, closeButtonY + closeButtonSize / 2);
    currentCtx.scale(closeBtnHoverScale, closeBtnHoverScale);
    currentCtx.translate(-closeButtonSize / 2, -closeButtonSize / 2);

    // Close button gradient background
    const closeBtnGradient = currentCtx.createRadialGradient(
        closeButtonSize / 2, closeButtonSize / 2, 0,
        closeButtonSize / 2, closeButtonSize / 2, closeButtonSize / 2
    );
    closeBtnGradient.addColorStop(0, `rgba(255, 120, 120, ${closeBtnOpacity})`);
    closeBtnGradient.addColorStop(0.7, `rgba(255, 80, 80, ${closeBtnOpacity * 0.8})`);
    closeBtnGradient.addColorStop(1, `rgba(200, 50, 50, ${closeBtnOpacity * 0.6})`);

    currentCtx.fillStyle = closeBtnGradient;
    currentCtx.fillRect(0, 0, closeButtonSize, closeButtonSize);

    // Close button border with glow
    currentCtx.strokeStyle = `rgba(255, 100, 100, ${closeBtnOpacity})`;
    currentCtx.lineWidth = 2;
    currentCtx.shadowBlur = closeBtnGlow;
    currentCtx.shadowColor = '#ff6464';
    currentCtx.strokeRect(0, 0, closeButtonSize, closeButtonSize);
    currentCtx.shadowBlur = 0;

    // Enhanced close button X with better styling
    currentCtx.strokeStyle = `rgba(255, 255, 255, ${closeBtnOpacity})`;
    currentCtx.lineWidth = isMouseOverCloseBtn ? 4 : 3;
    currentCtx.lineCap = 'round';
    currentCtx.shadowBlur = 3;
    currentCtx.shadowColor = '#ffffff';
    currentCtx.beginPath();
    currentCtx.moveTo(15, 15);
    currentCtx.lineTo(35, 35);
    currentCtx.moveTo(35, 15);
    currentCtx.lineTo(15, 35);
    currentCtx.stroke();
    currentCtx.shadowBlur = 0;

    currentCtx.restore();

    // Store close button click area
    if (!window.shopClickAreas) window.shopClickAreas = {};
    window.shopClickAreas.closeButton = {
        x: closeButtonX,
        y: closeButtonY,
        width: closeButtonSize,
        height: closeButtonSize,
        action: 'close'
    };

    // Close instruction removed - no longer needed
    currentCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    currentCtx.font = 'bold 14px "Courier New", monospace';
    currentCtx.textAlign = 'right';
    const closeText = '';
    currentCtx.fillText(closeText, currentCanvas.width - 40, topBarHeight + 25);

    // Initialize scroll offsets if not exists
    if (typeof window.shopScrollOffsetX === 'undefined') {
        window.shopScrollOffsetX = 0;
    }
    if (typeof window.shopScrollOffsetY === 'undefined') {
        window.shopScrollOffsetY = 0;
    }
    if (typeof window.shopTargetScrollOffsetY === 'undefined') {
        window.shopTargetScrollOffsetY = window.shopScrollOffsetY;
    }

    //// Apply smooth vertical scrolling animation (same smoothing as horizontal)
    const verticalSmoothingFactor = 0.15;
    const verticalScrollDiff = window.shopTargetScrollOffsetY - window.shopScrollOffsetY;
    if (Math.abs(verticalScrollDiff) > 1) {
        window.shopScrollOffsetY += verticalScrollDiff * verticalSmoothingFactor;
    } else {
        window.shopScrollOffsetY = window.shopTargetScrollOffsetY;
    }

    // Draw all items in order: blue to red, bodies then weapons for each color
    const startX = 40 - window.shopScrollOffsetX;
    const startY = 120 - window.shopScrollOffsetY; // Move content down to account for top bar
    const itemsPerRow = 2; // Fixed to 2 boxes per row

    drawAllShopItems(startX, startY, time, currentCtx, itemsPerRow);

    currentCtx.restore();
}

// Enhanced tech grid background for modern shop styling
function drawEnhancedTechGrid(time, currentCtx, currentCanvas, topOffset = 0) {
    currentCtx.save();

    // Multi-layered animated grid lines
    const gridLayers = [
        { size: 60, opacity: 0.15, speed: 0.5, color: [0, 247, 255] },
        { size: 40, opacity: 0.1, speed: 1.0, color: [100, 200, 255] },
        { size: 20, opacity: 0.05, speed: 1.5, color: [150, 150, 255] }
    ];

    gridLayers.forEach((layer, layerIndex) => {
        const offsetX = (time * layer.speed * 20) % layer.size;
        const offsetY = (time * layer.speed * 15) % layer.size;

        currentCtx.strokeStyle = `rgba(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]}, ${layer.opacity})`;
        currentCtx.lineWidth = layerIndex === 0 ? 1.5 : 1;

        // Vertical lines
        for (let x = -layer.size + offsetX; x < currentCanvas.width + layer.size; x += layer.size) {
            currentCtx.beginPath();
            currentCtx.moveTo(x, topOffset);
            currentCtx.lineTo(x, currentCanvas.height);
            currentCtx.stroke();
        }

        // Horizontal lines
        for (let y = -layer.size + offsetY + topOffset; y < currentCanvas.height + layer.size; y += layer.size) {
            currentCtx.beginPath();
            currentCtx.moveTo(0, y);
            currentCtx.lineTo(currentCanvas.width, y);
            currentCtx.stroke();
        }
    });

    // Enhanced animated data nodes with particle effects
    for (let i = 0; i < 25; i++) {
        const x = (currentCanvas.width * (i * 0.157 + time * 0.008)) % (currentCanvas.width + 100);
        const y = topOffset + ((currentCanvas.height - topOffset) * (i * 0.243 + time * 0.006)) % (currentCanvas.height - topOffset + 100);
        const size = 2 + Math.sin(time * 4 + i) * 0.8;
        const opacity = 0.6 + Math.sin(time * 2 + i * 1.5) * 0.4;

        // Node glow effect
        const nodeGradient = currentCtx.createRadialGradient(x, y, 0, x, y, size * 4);
        nodeGradient.addColorStop(0, `rgba(0, 247, 255, ${opacity})`);
        nodeGradient.addColorStop(0.5, `rgba(0, 247, 255, ${opacity * 0.3})`);
        nodeGradient.addColorStop(1, `rgba(0, 247, 255, 0)`);

        currentCtx.fillStyle = nodeGradient;
        currentCtx.beginPath();
        currentCtx.arc(x, y, size * 4, 0, Math.PI * 2);
        currentCtx.fill();

        // Core node
        currentCtx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
        currentCtx.beginPath();
        currentCtx.arc(x, y, size, 0, Math.PI * 2);
        currentCtx.fill();

        // Enhanced data streams with curves
        if (i % 2 === 0) {
            const streamLength = 50 + Math.sin(time + i) * 20;
            const streamAngle = time * 0.5 + i;
            const endX = x + Math.cos(streamAngle) * streamLength;
            const endY = y + Math.sin(streamAngle) * streamLength;

            currentCtx.strokeStyle = `rgba(0, 247, 255, ${opacity * 0.4})`;
            currentCtx.lineWidth = 2;
            currentCtx.shadowBlur = 5;
            currentCtx.shadowColor = '#00f7ff';
            currentCtx.beginPath();
            currentCtx.moveTo(x, y);
            currentCtx.quadraticCurveTo(
                x + Math.cos(streamAngle + 0.5) * streamLength * 0.5,
                y + Math.sin(streamAngle + 0.5) * streamLength * 0.5,
                endX, endY
            );
            currentCtx.stroke();
            currentCtx.shadowBlur = 0;
        }
    }

    currentCtx.restore();
}

// Add overlay patterns for visual depth
function drawShopOverlayPatterns(time, currentCtx, currentCanvas) {
    currentCtx.save();

    // Animated hexagonal pattern overlay - BIGGER AND BETTER!
    const hexSize = 60;  // Bigger hexagons (was 40)
    const hexSpacing = hexSize * 1.5;
    // Better colors - brighter cyan
    currentCtx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    currentCtx.lineWidth = 2;  // Thicker lines (was 1)

    for (let x = -hexSize; x < currentCanvas.width + hexSize; x += hexSpacing) {
        for (let y = -hexSize; y < currentCanvas.height + hexSize; y += hexSpacing * 0.866) {
            const offsetX = (y / (hexSpacing * 0.866)) % 2 === 0 ? 0 : hexSpacing / 2;
            const hexX = x + offsetX + Math.sin(time * 0.5 + x * 0.01) * 3;
            const hexY = y + Math.cos(time * 0.3 + y * 0.01) * 2;

            drawHexagon(currentCtx, hexX, hexY, hexSize * 0.6);
        }
    }

    currentCtx.restore();
}

function drawHexagon(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hexX = x + size * Math.cos(angle);
        const hexY = y + size * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(hexX, hexY);
        } else {
            ctx.lineTo(hexX, hexY);
        }
    }
    ctx.closePath();
    ctx.stroke();
}

// Enhanced ambient lighting effects with particles
function drawEnhancedAmbientEffects(time, currentCtx, currentCanvas) {
    currentCtx.save();

    // Enhanced floating light orbs with trails
    for (let i = 0; i < 12; i++) {
        const x = (currentCanvas.width * 0.05) + (currentCanvas.width * 0.9 * (i / 11)) + Math.sin(time * 0.4 + i) * 50;
        const y = 80 + Math.cos(time * 0.25 + i * 1.5) * 80 + Math.sin(time * 0.8 + i) * 20;
        const size = 18 + Math.sin(time * 1.5 + i) * 8;
        const opacity = 0.15 + Math.sin(time * 0.7 + i) * 0.08;
        const hue = (i * 30 + time * 20) % 360;

        // Orb trail effect
        for (let trail = 0; trail < 5; trail++) {
            const trailX = x - Math.sin(time * 0.4 + i) * trail * 8;
            const trailY = y - Math.cos(time * 0.25 + i * 1.5) * trail * 6;
            const trailSize = size * (1 - trail * 0.15);
            const trailOpacity = opacity * (1 - trail * 0.2);

            const trailGradient = currentCtx.createRadialGradient(
                trailX, trailY, 0,
                trailX, trailY, trailSize * 3
            );
            trailGradient.addColorStop(0, `hsla(${hue}, 70%, 70%, ${trailOpacity})`);
            trailGradient.addColorStop(0.7, `hsla(${hue}, 60%, 50%, ${trailOpacity * 0.3})`);
            trailGradient.addColorStop(1, `hsla(${hue}, 50%, 30%, 0)`);

            currentCtx.fillStyle = trailGradient;
            currentCtx.beginPath();
            currentCtx.arc(trailX, trailY, trailSize * 3, 0, Math.PI * 2);
            currentCtx.fill();
        }
    }

    // Enhanced scan lines with varying intensities
    const scanSpeed = time * 60;
    for (let y = (scanSpeed % 12); y < currentCanvas.height; y += 12) {
        const intensity = 0.04 + Math.sin(y * 0.02 + time * 2) * 0.02;
        currentCtx.strokeStyle = `rgba(0, 247, 255, ${intensity})`;
        currentCtx.lineWidth = 1;
        currentCtx.beginPath();
        currentCtx.moveTo(0, y);
        currentCtx.lineTo(currentCanvas.width, y);        currentCtx.stroke();
    }

    // Floating particles
    for (let i = 0; i < 20; i++) {
        const particleX = (currentCanvas.width * (i * 0.123 + time * 0.01)) % (currentCanvas.width + 50);
        const particleY = (currentCanvas.height * (i * 0.456 + time * 0.008)) % (currentCanvas.height + 50);
        const particleSize = 1 + Math.sin(time * 3 + i) * 0.5;
        const particleOpacity = 0.3 + Math.sin(time * 2 + i * 2) * 0.2;

        currentCtx.fillStyle = `rgba(255, 255, 255, ${particleOpacity})`;
        currentCtx.shadowBlur = 4;
        currentCtx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        currentCtx.beginPath();
        currentCtx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
        currentCtx.fill();
    }

    currentCtx.shadowBlur = 0;
    currentCtx.restore();
}

function drawShopCategory(title, items, prices, x, y, type) {
    // Category title
    ctx.fillStyle = '#00f7ff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(title, x, y);

    // Initialize owned items if not exists
    if (!gameState.ownedItems) {
        gameState.ownedItems = {
            color: ['blue'],
            body: ['body_halftrack'],
            weapon: ['turret_01_mk1']
        };
    }

    let displayIndex = 0;
    // Items - only show items with successfully loaded images
    items.forEach((item, index) => {
        // Check if item has valid images
        const hasValidImage = type === 'color' ?
            (tankImages[item] && Object.keys(tankImages[item]).length > 0) :
            type === 'body' ?
                (tankImages[gameState.selectedTank.color]?.[item] && tankImages[gameState.selectedTank.color][item] !== null) :
                (weaponImages[gameState.selectedTank.color]?.[item] && weaponImages[gameState.selectedTank.color][item] !== null);

        if (!hasValidImage) return; // Skip items without valid images

        const itemY = y + 30 + (displayIndex * 60);
        const price = prices[item];
        const isSelected = gameState.selectedTank[type] === item;
        const canAfford = gameState.fortzCurrency >= price;
        const isOwned = price === 0 || gameState.ownedItems[type]?.includes(item);

        // Item background
        ctx.fillStyle = isSelected ? 'rgba(0, 247, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, itemY - 20, 200, 50);

        // Item border
        ctx.strokeStyle = isSelected ? '#00f7ff' : '#666';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, itemY - 20, 200, 50);

        // Item name
        ctx.fillStyle = isOwned ? '#ffffff' : (canAfford ? '#cccccc' : '#666666');
        ctx.font = '14px Arial';
        ctx.fillText(item.replace('_', ' ').replace('turret', 'T').replace('mk', 'MK'), x + 10, itemY - 2);

        // Price/Status
        if (isOwned) {
            ctx.fillStyle = '#00ff00';
            ctx.fillText(isSelected ? 'EQUIPPED' : 'OWNED', x + 10, itemY + 15);
        } else {
            ctx.fillStyle = canAfford ? '#FFD700' : '#ff6666';
            ctx.fillText(`${price} F`, x + 10, itemY + 15);
        }

        // Store click area for this item
        if (!window.shopClickAreas) window.shopClickAreas = {};
        window.shopClickAreas[`${type}_${displayIndex}`] = {
            x: x, y: itemY - 20, width: 200, height: 50,
            type: type, item: item, price: price, isOwned: isOwned, canAfford: canAfford
        };

        displayIndex++;
    });
}

// Helper function to get color-based styling
function getColorStyle(itemColor) {
    switch (itemColor) {
        case 'blue':
            return {
                r: 30, g: 144, b: 255,
                textColor: '#1E90FF'
            }; // Dodger blue
        case 'camo':
            return {
                r: 34, g: 139, b: 34,
                textColor: '#32CD32'
            }; // Forest green
        case 'desert':
            return {
                r: 255, g: 215, b: 0,
                textColor: '#FFD700'
            }; // Gold
        case 'purple':
            return {
                r: 147, g: 0, b: 211,
                textColor: '#9400D3'
            }; // Dark violet
        case 'red':
            return {
                r: 220, g: 20, b: 60,
                textColor: '#DC143C'
            }; // Crimson
        default:
            return {
                r: 100, g: 100, b: 100,
                textColor: '#888888'
            }; // Gray fallback
    }
}

// Helper function to get consistent viewport width
function getViewportWidth() {
    const currentCanvas = gameState.isInLobby ?
        (document.getElementById('lobbyBackground') || canvas) : canvas;
    return currentCanvas.width - 80;
}

// Create HTML scroll buttons for each shop row
function createRowScrollButtons(color, rowY, squareSize, itemCount, canvasWidth) {
    // Only create buttons if shop is open
    if (!gameState.showShop) return;

    // Remove existing buttons for this color
    const existingLeftBtn = document.getElementById(`leftBtn_${color}`);
    const existingRightBtn = document.getElementById(`rightBtn_${color}`);
    if (existingLeftBtn) existingLeftBtn.remove();
    if (existingRightBtn) existingRightBtn.remove();

    // Calculate if scrolling is possible
    const totalRowWidth = itemCount * (squareSize + SHOP_GRID_SPACING);
    const viewportWidth = canvasWidth - 160;

    // Initialize scroll offsets if they don't exist
    if (!window.shopRowScrollOffsets) window.shopRowScrollOffsets = {};
    if (!window.shopTargetScrollOffsets) window.shopTargetScrollOffsets = {};
    if (typeof window.shopRowScrollOffsets[color] === 'undefined') {
        window.shopRowScrollOffsets[color] = 0;
    }
    if (typeof window.shopTargetScrollOffsets[color] === 'undefined') {
        window.shopTargetScrollOffsets[color] = window.shopRowScrollOffsets[color];
    }

    const currentOffset = window.shopTargetScrollOffsets[color];
    const targetOffset = window.shopTargetScrollOffsets[color];
    const maxScroll = Math.max(0, totalRowWidth - viewportWidth);
    const canScrollLeft = targetOffset > 5;
    const canScrollRight = targetOffset < (maxScroll - 5) && totalRowWidth > viewportWidth;

    console.log(`Button state for ${color}: offset=${targetOffset}, max=${maxScroll}, canLeft=${canScrollLeft}, canScrollRight=${canScrollRight}`);

    // Get the correct canvas container
    const canvas = gameState.isInLobby ?
        document.getElementById('lobbyBackground') :
        document.getElementById('gameCanvas');
    if (!canvas) return;

    // Create button container if it doesn't exist
    let buttonContainer = document.getElementById('shopScrollButtons');
    if (!buttonContainer) {
        buttonContainer = document.createElement('div');
        buttonContainer.id = 'shopScrollButtons';
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.top = '0';
        buttonContainer.style.left = '0';
        buttonContainer.style.pointerEvents = 'none';
        buttonContainer.style.zIndex = '1000';
        canvas.parentElement.appendChild(buttonContainer);
    }

    const arrowSize = 60;
    const arrowY = rowY + squareSize / 2 - arrowSize / 2;

    // Left scroll button
    const leftBtn = document.createElement('button');
    leftBtn.id = `leftBtn_${color}`;
    leftBtn.innerHTML = '◄';
    leftBtn.style.position = 'absolute';
    leftBtn.style.left = '15px';
    leftBtn.style.top = `${arrowY}px`;
    leftBtn.style.width = `${arrowSize}px`;
    leftBtn.style.height = `${arrowSize}px`;
    leftBtn.style.borderRadius = '50%';
    leftBtn.style.border = '4px solid #FFD700';
    leftBtn.style.background = canScrollLeft ?
        'radial-gradient(circle, #FFD700 0%, #FF8C00 100%)' :
        'radial-gradient(circle, #666 0%, #444 100%)';
    leftBtn.style.color = canScrollLeft ? '#000' : '#888';
    leftBtn.style.fontSize = '24px';
    leftBtn.style.fontWeight = 'bold';
    leftBtn.style.cursor = canScrollLeft ? 'pointer' : 'not-allowed';
    leftBtn.style.pointerEvents = 'auto';
    leftBtn.style.opacity = canScrollLeft ? '1' : '0.3';
    leftBtn.style.zIndex = '1001';
    leftBtn.disabled = !canScrollLeft;

    // Right scroll button
    const rightBtn = document.createElement('button');
    rightBtn.id = `rightBtn_${color}`;
    rightBtn.innerHTML = '►';
    rightBtn.style.position = 'absolute';
    rightBtn.style.left = `${canvasWidth - arrowSize - 15}px`;
    rightBtn.style.top = `${arrowY}px`;
    rightBtn.style.width = `${arrowSize}px`;
    rightBtn.style.height = `${arrowSize}px`;
    rightBtn.style.borderRadius = '50%';
    rightBtn.style.border = '4px solid #FFD700';
    rightBtn.style.background = canScrollRight ?
        'radial-gradient(circle, #FFD700 0%, #FF8C00 100%)' :
        'radial-gradient(circle, #666 0%, #444 100%)';
    rightBtn.style.color = canScrollRight ? '#000' : '#888';
    rightBtn.style.fontSize = '24px';
    rightBtn.style.fontWeight = 'bold';
    rightBtn.style.cursor = canScrollRight ? 'pointer' : 'not-allowed';
    rightBtn.style.pointerEvents = 'auto';
    rightBtn.style.opacity = canScrollRight ? '1' : '0.3';
    rightBtn.style.zIndex = '1001';
    rightBtn.disabled = !canScrollRight;

    // Add click handlers
    leftBtn.addEventListener('click', () => {
        if (canScrollLeft) {
            scrollShopRow(color, 'left');
        }
    });

    rightBtn.addEventListener('click', () => {
        if (canScrollRight) {
            scrollShopRow(color, 'right');
        }
    });

    // Add buttons to container
    buttonContainer.appendChild(leftBtn);
    buttonContainer.appendChild(rightBtn);
}

// Function to handle shop row scrolling
function scrollShopRow(color, direction) {
    // Initialize scroll offsets if needed
    if (!window.shopRowScrollOffsets) {
        window.shopRowScrollOffsets = {};
    }
    if (!window.shopTargetScrollOffsets) {
        window.shopTargetScrollOffsets = {};
    }

    if (typeof window.shopRowScrollOffsets[color] === 'undefined') {
        window.shopRowScrollOffsets[color] = 0;
    }
    if (typeof window.shopTargetScrollOffsets[color] === 'undefined') {
        window.shopTargetScrollOffsets[color] = window.shopRowScrollOffsets[color];
    }

    const rowArea = window.shopRowAreas[color];
    if (!rowArea) {
        console.warn(`No row area found for color: ${color}`);
        return;
    }

    // Calculate viewport and scroll amounts
    const canvas = gameState.isInLobby ?
        document.getElementById('lobbyBackground') :
        document.getElementById('gameCanvas');

    if (!canvas) return;

    const viewportWidth = canvas.width - 160; // Account for arrow button space
    const itemWidth = (SHOP_SQUARE_SIZE + SHOP_GRID_SPACING); // Use consistent item width

    // LEFT button should scroll LEFT (decrease offset to move content RIGHT)
    // RIGHT button should scroll RIGHT (increase offset to move content LEFT)
    const scrollAmount = direction === 'right' ? itemWidth * 2 : -itemWidth * 2;

    // Update target scroll position
    const currentOffset = window.shopTargetScrollOffsets[color] || 0;
    window.shopTargetScrollOffsets[color] = currentOffset + scrollAmount;

    // Calculate max scroll bounds more accurately
    const totalRowWidth = rowArea.itemCount * itemWidth;
    const maxScrollX = Math.max(0, totalRowWidth - viewportWidth + 40);

    // Clamp scroll position
    window.shopTargetScrollOffsets[color] = Math.max(0, Math.min(maxScrollX, window.shopTargetScrollOffsets[color]));

    console.log(`Scrolling ${color} row ${direction}: offset ${currentOffset} -> ${window.shopTargetScrollOffsets[color]} (max: ${maxScrollX})`);
}

// Draw all shop items grouped by color in horizontal rows with independent scrolling
function drawAllShopItems(x, y, time, currentCtx, itemsPerRow = 8) {
    // Initialize owned items if not exists
    if (!gameState.ownedItems) {
        gameState.ownedItems = {
            color: ['blue'],
            body: ['body_halftrack'],
            weapon: ['turret_01_mk1']
        };
    }

    // Initialize smooth scroll system for Netflix-style browsing
    if (!window.shopRowScrollOffsets) {
        window.shopRowScrollOffsets = {};
    }
    if (!window.shopTargetScrollOffsets) {
        window.shopTargetScrollOffsets = {};
    }
    if (!window.shopScrollVelocity) {
        window.shopScrollVelocity = {};
    }

    // Use module-scope constants for consistent sizing
    const squareSize = SHOP_SQUARE_SIZE;
    const gridSpacing = SHOP_GRID_SPACING;
    const previewSize = SHOP_PREVIEW_SIZE;

    let globalDisplayIndex = 0;
    let currentRowY = y;

    // Order: blue, camo, desert, purple, red
    const colorOrder = ['blue', 'camo', 'desert', 'purple', 'red'];
    const colorNames = {
        'blue': 'BLUE',
        'camo': 'CAMO',
        'desert': 'DESERT',
        'purple': 'PURPLE',
        'red': 'RED'
    };

    // Group items by color and display each color group in its own row
    colorOrder.forEach((color, colorIndex) => {
        let colorItems = [];

        // Get color multiplier for pricing
        const colorMultiplier = TANK_CONFIG.colorMultipliers[color] || 1;

        // Collect all items for this color - show all successfully loaded images (GIF or PNG)
        TANK_CONFIG.bodies.forEach(body => {
            const img = tankImages[color]?.[body];
            const hasValidImage = img && img !== null && img.complete;
            if (hasValidImage) {
                colorItems.push({
                    type: 'body',
                    item: body,
                    price: TANK_CONFIG.prices.bodies[body] * colorMultiplier
                });
            }
        });

        TANK_CONFIG.weapons.forEach(weapon => {
            const img = weaponImages[color]?.[weapon];
            const hasValidImage = img && img !== null && img.complete;
            if (hasValidImage) {
                colorItems.push({
                    type: 'weapon',
                    item: weapon,
                    price: TANK_CONFIG.prices.weapons[weapon] * colorMultiplier
                });
            }
        });

        // Skip if no valid items for this color
        if (colorItems.length === 0) return;

        // Initialize smooth scroll variables for this row
        if (!window.shopRowScrollOffsets[color]) {
            window.shopRowScrollOffsets[color] = 0;
        }
        if (!window.shopTargetScrollOffsets[color]) {
            window.shopTargetScrollOffsets[color] = 0;
        }

        // Draw color group title centered
        const canvasWidth = currentCtx.canvas.width;
        currentCtx.save();
        currentCtx.fillStyle = getColorStyle(color).textColor;
        currentCtx.font = 'bold 32px "Courier New", monospace';
        currentCtx.textAlign = 'center';
        currentCtx.shadowBlur = 8;
        currentCtx.shadowColor = getColorStyle(color).textColor;
        currentCtx.fillText(colorNames[color], canvasWidth / 2, currentRowY - 20);
        currentCtx.shadowBlur = 0;
        currentCtx.restore();

        // Create clipping area for this row
        const rowHeight = squareSize + 80; // Height of the row including text

        currentCtx.save();
        currentCtx.beginPath();
        currentCtx.rect(0, currentRowY - 10, canvasWidth, rowHeight);
        currentCtx.clip();

        // Initialize scroll offsets for this row if not set
        if (!window.shopRowScrollOffsets[color]) {
            window.shopRowScrollOffsets[color] = 0;
        }
        if (!window.shopTargetScrollOffsets[color]) {
            window.shopTargetScrollOffsets[color] = 0;
        }

        // Get current scroll offset for this row (smoothly interpolated in renderLobbyShop)
        const currentScrollOffset = window.shopRowScrollOffsets[color];

        // Draw all items for this color in one scrollable row
        colorItems.forEach((itemData, itemIndex) => {
            // Apply the scroll offset correctly - subtract to move items left when scrolling right
            const baseItemX = x + itemIndex * (squareSize + gridSpacing);
            const itemX = baseItemX - currentScrollOffset;
            const itemY = currentRowY;

            // Only draw items that are visible in the viewport (with larger buffer for smooth scrolling)
            if (itemX + squareSize > -200 && itemX < canvasWidth + 200) {
                drawShopItemBox(itemX, itemY, squareSize, gridSpacing, colorItems.length, itemIndex,
                    itemData.type, itemData.item, color, itemData.price,
                    previewSize, time, currentCtx, globalDisplayIndex, color);
                globalDisplayIndex++;
            }
        });

        // Store row info for click detection
        if (!window.shopRowAreas) window.shopRowAreas = {};
        window.shopRowAreas[color] = {
            y: currentRowY - 10,
            height: rowHeight,
            itemCount: colorItems.length,
            itemWidth: SHOP_SQUARE_SIZE + SHOP_GRID_SPACING
        };

        currentCtx.restore();

        // Create HTML scroll buttons OUTSIDE the clipping area so they're always visible
        createRowScrollButtons(color, currentRowY, squareSize, colorItems.length, canvasWidth);

        // Move to next row with extra spacing between color groups
        currentRowY += squareSize + 120; // Extra spacing between color groups
    });
}

// Draw individual shop item box
function drawShopItemBox(x, y, squareSize, gridSpacing, itemsPerRow, displayIndex, type, item, color, price, previewSize, time, currentCtx, globalIndex = null, rowColor = null) {
    // Use provided x, y coordinates directly for new layout
    const itemX = x;
    const itemY = y;

    // Only mark as selected if this exact item is currently equipped (matching type, item, and color)
    const isSelected = (type === 'body' && gameState.selectedTank.body === item && gameState.selectedTank.color === color) ||
        (type === 'weapon' && gameState.selectedTank.weapon === item && gameState.selectedTank.color === color);
    const canAfford = gameState.fortzCurrency >= price;
    // Check if item is owned - for bodies/weapons, also check if the color is owned
    let isOwned = false;
    if (type === 'body' || type === 'weapon') {
        // Item is owned if both the item and color are owned
        isOwned = (price === 0 || gameState.ownedItems[type]?.includes(item)) &&
            (color === 'blue' || gameState.ownedItems.color?.includes(color));
    } else {
        // For colors, just check if color is owned
        isOwned = price === 0 || gameState.ownedItems.color?.includes(item);
    }

    // Calculate power level for the item
    let powerLevel = 1;
    if (type === 'weapon') {
        // Extract power level from weapon name - start at 5
        if (item.includes('mk1')) powerLevel = 5;
        else if (item.includes('mk2')) powerLevel = 6;
        else if (item.includes('mk3')) powerLevel = 7;
        else if (item.includes('mk4')) powerLevel = 8;
        else if (item.includes('turret_02_mk1')) powerLevel = 9;
        else if (item.includes('turret_02_mk2')) powerLevel = 10;
        else if (item.includes('turret_02_mk3')) powerLevel = 11;
        else if (item.includes('turret_02_mk4')) powerLevel = 12;
    } else if (type === 'body') {
        // Body power levels - start at 3
        if (item === 'body_halftrack') powerLevel = 3; // Halftrack starts at 3
        else if (item === 'body_tracks') powerLevel = 4; // Tracks starts at 4
    }

    // Enhanced modern square design with advanced animations
    currentCtx.save();

    // Enhanced animation effects with smooth easing
    const animPhase = time * 1.5 + displayIndex * 0.8;
    const baseHover = isSelected ? 1.0 : 0.4 + Math.sin(animPhase) * 0.2;
    const pulseEffect = isSelected ? 1.06 + Math.sin(time * 5) * 0.03 : 1.0 + Math.sin(time * 2.5 + displayIndex) * 0.012;
    const glowIntensity = isSelected ? 0.9 + Math.sin(time * 4) * 0.3 : baseHover * 0.6;
    const floatOffset = isSelected ? Math.sin(time * 3) * 2 : Math.sin(time * 1.5 + displayIndex) * 1;

    currentCtx.translate(itemX + squareSize / 2, itemY + squareSize / 2 + floatOffset);
    currentCtx.scale(pulseEffect, pulseEffect);
    currentCtx.translate(-squareSize / 2, -squareSize / 2);

    // Enhanced multi-layer drop shadow for depth
    if (isSelected) {
        // Multiple shadow layers for selected items
        for (let layer = 0; layer < 3; layer++) {
            const shadowOffset = 4 + layer * 2;
            const shadowAlpha = 0.3 - layer * 0.08;
            currentCtx.shadowColor = 'rgba(0, 0, 0, ${shadowAlpha})';
            currentCtx.shadowBlur = 20 - layer * 5;
            currentCtx.shadowOffsetX = shadowOffset;
            currentCtx.shadowOffsetY = shadowOffset;
            currentCtx.fillStyle = 'rgba(0, 0, 0, 0)';
            currentCtx.fillRect(-1, -1, squareSize + 2, squareSize + 2);
        }
    } else {
        currentCtx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        currentCtx.shadowBlur = canAfford ? 12 : 6;
        currentCtx.shadowOffsetX = 3;
        currentCtx.shadowOffsetY = 3;
    }



    // Use the tank color for ALL items (bodies and weapons inherit tank color)
    const boxColor = color;
    const colorStyle = getColorStyle(boxColor);

    // Enhanced gradient backgrounds with modern effects
    if (isSelected) {
        // Selected item - premium gradient with animated glow
        const selectedGradient = currentCtx.createRadialGradient(
            squareSize / 2, squareSize / 2, 0,
            squareSize / 2, squareSize / 2, squareSize * 0.9
        );
        const glowPulse = 0.8 + Math.sin(time * 6) * 0.2;
        selectedGradient.addColorStop(0, `rgba(${Math.min(255, colorStyle.r + 80)}, ${Math.min(255, colorStyle.g + 80)}, ${Math.min(255, colorStyle.b + 80)}, ${0.95 * glowIntensity})`);
        selectedGradient.addColorStop(0.4, `rgba(${Math.min(255, colorStyle.r + 40)}, ${Math.min(255, colorStyle.g + 40)}, ${Math.min(255, colorStyle.b + 40)}, ${0.8 * glowIntensity})`);
        selectedGradient.addColorStop(0.7, `rgba(${colorStyle.r}, ${colorStyle.g}, ${colorStyle.b}, ${0.6 * glowIntensity})`);
        selectedGradient.addColorStop(1, `rgba(${Math.max(0, colorStyle.r - 40)}, ${Math.max(0, colorStyle.g - 40)}, ${Math.max(0, colorStyle.b - 40)}, ${0.4 * glowIntensity})`);

        currentCtx.fillStyle = selectedGradient;
        currentCtx.fillRect(-3, -3, squareSize + 6, squareSize + 6);

        // Enhanced outer glow with animation
        currentCtx.shadowColor = `rgba(${colorStyle.r}, ${colorStyle.g}, ${colorStyle.b}, ${glowPulse})`;
        currentCtx.shadowBlur = 25 + Math.sin(time * 4) * 5;
        currentCtx.fillRect(-1, -1, squareSize + 2, squareSize + 2);
        currentCtx.shadowBlur = 0;

    } else if (canAfford && isOwned) {
        // Owned item - gradient with subtle glow
        const ownedGradient = currentCtx.createLinearGradient(0, 0, squareSize, squareSize);
        ownedGradient.addColorStop(0, `rgba(${colorStyle.r}, ${colorStyle.g}, ${colorStyle.b}, ${0.6 * glowIntensity})`);
        ownedGradient.addColorStop(1, `rgba(${Math.max(0, colorStyle.r - 40)}, ${Math.max(0, colorStyle.g - 40)}, ${Math.max(0, colorStyle.b - 40)}, ${0.4 * glowIntensity})`);

        currentCtx.fillStyle = ownedGradient;
        currentCtx.fillRect(0, 0, squareSize, squareSize);

    } else if (canAfford) {
        // Affordable item - dimmed gradient
        const affordableGradient = currentCtx.createLinearGradient(0, 0, squareSize, squareSize);
        affordableGradient.addColorStop(0, `rgba(${colorStyle.r}, ${colorStyle.g}, ${colorStyle.b}, ${0.4 * glowIntensity})`);
        affordableGradient.addColorStop(1, `rgba(${Math.max(0, colorStyle.r - 60)}, ${Math.max(0, colorStyle.g - 60)}, ${Math.max(0, colorStyle.b - 60)}, ${0.2 * glowIntensity})`);

        currentCtx.fillStyle = affordableGradient;
        currentCtx.fillRect(0, 0, squareSize, squareSize);

    } else {
        // Unaffordable item - very dim with desaturated colors
        const lockedGradient = currentCtx.createLinearGradient(0, 0, squareSize, squareSize);
        const desatR = Math.floor(colorStyle.r * 0.5 + 60);
        const desatG = Math.floor(colorStyle.g * 0.5 + 60);
        const desatB = Math.floor(colorStyle.b * 0.5 + 60);

        lockedGradient.addColorStop(0, `rgba(${desatR}, ${desatG}, ${desatB}, ${0.3 * glowIntensity})`);
        lockedGradient.addColorStop(1, `rgba(${Math.max(0, desatR - 40)}, ${Math.max(0, desatG - 40)}, ${Math.max(0, desatB - 40)}, ${0.15 * glowIntensity})`);

        currentCtx.fillStyle = lockedGradient;
        currentCtx.fillRect(0, 0, squareSize, squareSize);
    }

    // Reset shadow for subsequent elements
    currentCtx.shadowColor = 'transparent';
    currentCtx.shadowBlur = 0;
    currentCtx.shadowOffsetX = 0;
    currentCtx.shadowOffsetY = 0;

    // Enhanced corner accents and frame effects
    if (isSelected) {
        // Simple corner brackets without white glow
        const cornerSize = 12;
        const cornerThickness = 3;
        const colorStyle = getColorStyle(boxColor);

        currentCtx.strokeStyle = colorStyle.textColor;
        currentCtx.lineWidth = cornerThickness;
        currentCtx.lineCap = 'round';

        // Top-left corner
        currentCtx.beginPath();
        currentCtx.moveTo(-3, cornerSize - 3);
        currentCtx.lineTo(-3, -3);
        currentCtx.lineTo(cornerSize - 3, -3);
        currentCtx.stroke();

        // Top-right corner
        currentCtx.beginPath();
        currentCtx.moveTo(squareSize - cornerSize + 3, -3);
        currentCtx.lineTo(squareSize + 3, -3);
        currentCtx.lineTo(squareSize + 3, cornerSize - 3);
        currentCtx.stroke();

        // Bottom-left corner
        currentCtx.beginPath();
        currentCtx.moveTo(-3, squareSize - cornerSize + 3);
        currentCtx.lineTo(-3, squareSize + 3);
        currentCtx.lineTo(cornerSize - 3, squareSize + 3);
        currentCtx.stroke();

        // Bottom-right corner
        currentCtx.beginPath();
        currentCtx.moveTo(squareSize - cornerSize + 3, squareSize + 3);
        currentCtx.lineTo(squareSize + 3, squareSize + 3);
        currentCtx.lineTo(squareSize + 3, squareSize - cornerSize + 3);
        currentCtx.stroke();
    }

    // Draw price value OR stats below the box
    currentCtx.save();

    // For BODY items, show health and armor stats instead of price
    if (type === 'body') {
        // Position on the LEFT SIDE under the box
        currentCtx.translate(20, squareSize + 25);

        // Calculate health and armor based on body type and color tier
        let baseHealth = 100;
        let baseArmor = 100;

        // Adjust base stats based on body type
        if (item === 'body_tracks') {
            baseHealth = 150;
            baseArmor = 150;
        }

        // Color tier multiplier
        const tierMultiplier = {
            'blue': 1,
            'camo': 2,
            'desert': 2.5,
            'purple': 3,
            'red': 3.5
        };

        const multiplier = tierMultiplier[color] || 1;
        const health = Math.floor(baseHealth * multiplier);
        const armor = Math.floor(baseArmor * multiplier);

        // Draw health icon (heart-like) on the left
        currentCtx.strokeStyle = '#4CAF50';
        currentCtx.fillStyle = '#4CAF50';
        currentCtx.lineWidth = 2;
        currentCtx.beginPath();
        currentCtx.arc(0, 0, 5, 0, Math.PI * 2);
        currentCtx.fill();
        currentCtx.stroke();

        // Draw health value (green) next to icon
        currentCtx.fillStyle = '#4CAF50';
        currentCtx.font = 'bold 16px "Courier New", monospace';
        currentCtx.textAlign = 'left';
        currentCtx.textBaseline = 'middle';
        currentCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        currentCtx.shadowBlur = 4;
        currentCtx.fillText(health.toString(), 10, 0);

        // Draw armor icon (shield-like) below health
        currentCtx.shadowBlur = 0;
        currentCtx.strokeStyle = '#2196F3';
        currentCtx.fillStyle = '#2196F3';
        currentCtx.beginPath();
        currentCtx.moveTo(-4, 16);
        currentCtx.lineTo(0, 24);
        currentCtx.lineTo(4, 16);
        currentCtx.lineTo(4, 20);
        currentCtx.lineTo(0, 22);
        currentCtx.lineTo(-4, 20);
        currentCtx.closePath();
        currentCtx.fill();
        currentCtx.stroke();

        // Draw armor value (blue) next to icon
        currentCtx.fillStyle = '#2196F3';
        currentCtx.shadowBlur = 4;
        currentCtx.fillText(armor.toString(), 10, 20);
        currentCtx.shadowBlur = 0;

    } else {
        // For weapons and other items, show price with Fortz coin
        currentCtx.translate(squareSize / 2, squareSize + 30);

        // Load Fortz coin image if not already loaded
        if (!window.fortzCoinImg) {
            window.fortzCoinImg = new Image();
            window.fortzCoinImg.src = '/assets/images/ui/fortz-coin.png';
        }

        // Draw coin icon if loaded
        const coinSize = 24;
        if (window.fortzCoinImg && window.fortzCoinImg.complete) {
            currentCtx.drawImage(window.fortzCoinImg, -coinSize - 35, -coinSize / 2, coinSize, coinSize);
        }

        // Draw price text
        currentCtx.fillStyle = isSelected ? '#FFD700' : (isOwned ? '#4CAF50' : (canAfford ? '#FFD700' : '#666'));
        currentCtx.font = 'bold 20px "Courier New", monospace';
        currentCtx.textAlign = 'left';
        currentCtx.textBaseline = 'middle';
        currentCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        currentCtx.shadowBlur = 4;

        if (isOwned) {
            currentCtx.fillText('EQUIPPED', -30, 0);
        } else {
            currentCtx.fillText(price.toLocaleString(), -5, 0);
        }

        currentCtx.shadowBlur = 0;
    }

    currentCtx.restore();

    // Enhanced premium star rating indicator with 3D effects
    currentCtx.save();

    // Determine number of stars based on color tier
    let starCount = 1; // Default for blue
    if (color === 'camo') starCount = 2;
    else if (color === 'desert') starCount = 3;
    else if (color === 'purple') starCount = 4;
    else if (color === 'red') starCount = 5;

    // Premium star badge with enhanced dimensions
    const starSize = 12; // Larger stars
    const starSpacing = 16; // More space between stars
    const badgeWidth = Math.max(60, starCount * starSpacing + 20); // Much wider badge
    const badgeHeight = 32; // Taller badge
    const badgeX = squareSize - badgeWidth - 8;
    const badgeY = 8;
    const badgePulse = isSelected ? 1.08 + Math.sin(time * 6) * 0.04 : 1.0 + Math.sin(time * 2.5 + displayIndex) * 0.015;

    currentCtx.translate(badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
    currentCtx.scale(badgePulse, badgePulse);
    currentCtx.translate(-badgeWidth / 2, -badgeHeight / 2);

    // Multi-layer badge background with premium gradient
    const badgeGradient = currentCtx.createRadialGradient(
        badgeWidth / 2, badgeHeight / 2, 0,
        badgeWidth / 2, badgeHeight / 2, Math.max(badgeWidth, badgeHeight) / 2
    );
    badgeGradient.addColorStop(0, 'rgba(255, 248, 220, 0.95)'); // Cream center
    badgeGradient.addColorStop(0.3, 'rgba(255, 215, 0, 0.9)');   // Gold
    badgeGradient.addColorStop(0.7, 'rgba(255, 165, 0, 0.8)');   // Orange
    badgeGradient.addColorStop(1, 'rgba(184, 134, 11, 0.7)');    // Dark gold

    // Badge shadow for depth
    currentCtx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    currentCtx.shadowBlur = 8;
    currentCtx.shadowOffsetX = 2;
    currentCtx.shadowOffsetY = 2;
    currentCtx.fillStyle = badgeGradient;
    currentCtx.fillRect(0, 0, badgeWidth, badgeHeight);
    currentCtx.shadowBlur = 0;
    currentCtx.shadowOffsetX = 0;
    currentCtx.shadowOffsetY = 0;

    // Premium metallic border with multiple layers
    currentCtx.strokeStyle = 'rgba(255, 215, 0, 1.0)';
    currentCtx.lineWidth = 2;
    currentCtx.strokeRect(1, 1, badgeWidth - 2, badgeHeight - 2);

    currentCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    currentCtx.lineWidth = 1;
    currentCtx.strokeRect(2, 2, badgeWidth - 4, badgeHeight - 4);

    // Inner highlight for premium look
    const innerGradient = currentCtx.createLinearGradient(0, 0, 0, badgeHeight);
    innerGradient.addColorStop(0, 'rgba(255, 235, 59, 0.3)');
    innerGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.1)');
    innerGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    currentCtx.fillRect(3, 3, badgeWidth - 6, badgeHeight / 2);

    // Calculate star positioning for perfect centering
    const totalStarsWidth = (starCount - 1) * starSpacing + starSize * 2;
    const startX = (badgeWidth - totalStarsWidth) / 2 + starSize;

    // Draw premium stars with 3D effects
    for (let i = 0; i < starCount; i++) {
        const starX = startX + i * starSpacing;
        const starY = badgeHeight / 2;
        const starAnimOffset = time * 0.003 + i * 0.8;
        const starTwinkle = 0.9 + Math.sin(starAnimOffset) * 0.1;
        const starRotation = Math.sin(time * 0.001 + i * 1.2) * 0.1;

        currentCtx.save();
        currentCtx.translate(starX, starY);
        currentCtx.rotate(starRotation);
        currentCtx.scale(starTwinkle, starTwinkle);

        // Star shadow for 3D depth
        currentCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        currentCtx.shadowBlur = 4;
        currentCtx.shadowOffsetX = 1;
        currentCtx.shadowOffsetY = 1;

        // Draw premium 3D star with gradient
        const starGradient = currentCtx.createRadialGradient(
            -starSize * 0.3, -starSize * 0.3, 0,
            0, 0, starSize
        );
        starGradient.addColorStop(0, 'rgba(255, 248, 220, 0.95)'); // Cream center
        starGradient.addColorStop(0.4, 'rgba(255, 215, 0, 0.9)');  // Gold
        starGradient.addColorStop(0.7, 'rgba(255, 165, 0, 0.8)');  // Orange
        starGradient.addColorStop(1, 'rgba(218, 165, 32, 0.8)');   // Dark gold

        currentCtx.fillStyle = starGradient;

        // Draw enhanced 5-pointed star
        currentCtx.beginPath();
        const spikes = 5;
        const outerRadius = starSize;
        const innerRadius = starSize * 0.45; // Better proportions

        for (let j = 0; j < spikes * 2; j++) {
            const angle = (j * Math.PI) / spikes - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (j === 0) {
                currentCtx.moveTo(x, y);
            } else {
                currentCtx.lineTo(x, y);
            }
        }
        currentCtx.closePath();
        currentCtx.fill();

        // Premium star outline
        currentCtx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
        currentCtx.lineWidth = 1.5;
        currentCtx.stroke();

        currentCtx.restore();
    }

    // Add premium badge glow effect
    currentCtx.shadowColor = 'rgba(255, 215, 0, 0.6)';
    currentCtx.shadowBlur = isSelected ? 12 + Math.sin(time * 4) * 3 : 6;
    currentCtx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
    currentCtx.lineWidth = isSelected ? 2 : 1;
    currentCtx.strokeRect(0, 0, badgeWidth, badgeHeight);
    currentCtx.shadowBlur = 0;

    currentCtx.restore();

    // Draw tank preview - perfectly centered in the box
    currentCtx.save();
    // Center the tank object perfectly in the box, accounting for text space below
    const finalPreviewSize = Math.min(previewSize, squareSize * 0.7); // Larger preview size for better visibility
    const centerX = squareSize / 2;
    const centerY = squareSize / 2 - 20; // Better vertical centering with small offset for text space
    drawAnimatedTankPreview(centerX, centerY, finalPreviewSize, type, item, color, displayIndex, currentCtx);
    currentCtx.restore();

    currentCtx.restore();

    // Store click area for this item
    if (!window.shopClickAreas) window.shopClickAreas = {};
    const clickKey = `${type}_${item}_${globalIndex || displayIndex}`;
    window.shopClickAreas[clickKey] = {
        x: itemX, y: itemY, width: squareSize, height: squareSize + 50, // Adjusted height for smaller boxes
        type: type, item: item, color: color, price: price
    };
}

// Draw animated tank preview - now shows tank body only OR weapon only
function drawAnimatedTankPreview(x, y, size, type, item, colorOrIndex, indexOrCtx, currentCtx) {
    if (!imagesLoaded) return;

    // Handle different parameter combinations
    let color, index, ctx;
    if (typeof colorOrIndex === 'string') {
        // New signature: (x, y, size, type, item, color, index, currentCtx)
        color = colorOrIndex;
        index = indexOrCtx || 0;
        ctx = currentCtx || window.ctx;
    } else {
        // Old signature: (x, y, size, type, item, index, currentCtx)
        index = colorOrIndex || 0;
        ctx = indexOrCtx || window.ctx;
        color = gameState.selectedTank.color;
    }

    // Use global ctx if not provided (for backward compatibility)
    if (!ctx) ctx = window.ctx;

    // Create animation time based on index for staggered animations
    const time = Date.now() + (index * 800); // More staggered animations
    const rotationSpeed = 0.0003; // Slower, more elegant rotation
    const rotation = (time * rotationSpeed) % (Math.PI * 2);

    // Get preview tank configuration
    let previewTank = { ...gameState.selectedTank };
    if (type === 'color') {
        previewTank.color = item;
    } else if (type === 'body') {
        previewTank.body = item;
        previewTank.color = color; // Use the provided color
    } else if (type === 'weapon') {
        previewTank.weapon = item;
        previewTank.color = color; // Use the provided color
    }

    const { tankImg, weaponImg } = getCurrentTankImages(previewTank);

    ctx.save();
    ctx.translate(x, y); // Use the provided x,y as the center point

    // Add subtle pulsing effect for selected items
    const isSelected = (type === 'body' && gameState.selectedTank.body === item && gameState.selectedTank.color === color) ||
        (type === 'weapon' && gameState.selectedTank.weapon === item && gameState.selectedTank.color === color) ||
        (type === 'color' && gameState.selectedTank.color === item);
    if (isSelected) {
        const pulse = 1 + Math.sin(time * 0.002) * 0.05; // More subtle, slower pulse
        ctx.scale(pulse, pulse);
    }

    if (type === 'weapon') {
        // Show ONLY weapon for weapon category
        if (!weaponImg || !weaponImg.complete) {
            ctx.restore();
            return;
        }

        ctx.rotate(rotation);
        const weaponScale = size / Math.max(weaponImg.width, weaponImg.height) * 0.9; // Normal size for shop preview
        ctx.drawImage(
            weaponImg,
            -weaponImg.width * weaponScale / 2,
            -weaponImg.height * weaponScale / 2,
            weaponImg.width * weaponScale,
            weaponImg.height * weaponScale
        );
    } else {
        // Show ONLY tank body for color and body categories (no weapon)
        if (!tankImg || !tankImg.complete) {
            ctx.restore();
            return;
        }

        ctx.rotate(rotation);
        const tankScale = size / Math.max(tankImg.width, tankImg.height) * 0.9; // Much bigger tank bodies
        ctx.drawImage(
            tankImg,
            -tankImg.width * tankScale / 2,
            -tankImg.height * tankScale / 2,
            tankImg.width * tankScale,
            tankImg.height * tankScale
        );
    }

    ctx.restore();
}

function handleShopClick(e) {
    if (!window.shopClickAreas) return;

    // Determine which canvas we're clicking on
    let targetCanvas = canvas;
    if (gameState.isInLobby) {
        const lobbyCanvas = document.getElementById('lobbyBackground');
        if (lobbyCanvas) {
            targetCanvas = lobbyCanvas;
        }
    }

    const rect = targetCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check close button click first
    if (window.shopClickAreas.closeButton &&
        clickX >= window.shopClickAreas.closeButton.x && clickX <= window.shopClickAreas.closeButton.x + window.shopClickAreas.closeButton.width &&
        clickY >= window.shopClickAreas.closeButton.y && clickY <= window.shopClickAreas.closeButton.y + window.shopClickAreas.closeButton.height) {

        closeAllPanels();
        return;
    }

    // Check for leave icon click
    if (window.shopClickAreas['leave_icon'] &&
        clickX >= window.shopClickAreas['leave_icon'].x && clickX <= window.shopClickAreas['leave_icon'].x + window.shopClickAreas['leave_icon'].width &&
        clickY >= window.shopClickAreas['leave_icon'].y && clickY <= window.shopClickAreas['leave_icon'].y + window.shopClickAreas['leave_icon'].height) {

        if (window.shopClickAreas['leave_icon'].action === 'leave_lobby') {
            returnToLobby();
            return;
        } else if (window.shopClickAreas['leave_icon'].action === 'close_shop') {
            // Close shop and return to lobby view
            stopLobbyShopRendering();
            closeAllPanels();
            return;
        }
    }

    // Arrow clicks are now handled by HTML buttons, so we removed this section

    // Check all other click areas
    for (const [key, area] of Object.entries(window.shopClickAreas)) {
        if (key === 'leave_icon') continue; // Skip leave icon, already handled

        if (clickX >= area.x && clickX <= area.x + area.width &&
            clickY >= area.y && clickY <= area.y + area.height) {

            if (area.isOwned) {
                // Equip the item and color
                gameState.selectedTank[area.type] = area.item;
                gameState.selectedTank.color = area.color;
                console.log(`Equipped ${area.color} ${area.item}`);
            } else if (area.canAfford && gameState.fortzCurrency >= area.price) {
                // Purchase the item with proper validation
                let totalCost = area.price;

                // If we don't own this color yet, add color cost
                if (area.color !== 'blue' && !gameState.ownedItems.colors.includes(area.color)) {
                    totalCost += TANK_CONFIG.prices.colors[area.color];
                }

                if (gameState.fortzCurrency >= totalCost) {
                    gameState.fortzCurrency -= totalCost;
                    gameState.selectedTank[area.type] = area.item;
                    gameState.selectedTank.color = area.color;

                    // Mark item as owned (use correct plural keys)
                    const itemKey = area.type === 'body' ? 'bodies' : area.type === 'weapon' ? 'weapons' : 'colors';
                    if (!gameState.ownedItems[itemKey].includes(area.item)) {
                        gameState.ownedItems[itemKey].push(area.item);
                    }

                    // Mark color as owned
                    if (!gameState.ownedItems.colors.includes(area.color)) {
                        gameState.ownedItems.colors.push(area.color);
                    }

                    console.log(`Purchased and equipped ${area.color} ${area.item} for ${totalCost} Fortz`);
                    updateFortzDisplay();
                } else {
                    console.log(`Cannot afford ${area.color} ${area.item} (${totalCost} Fortz total)`);
                }
            } else {
                console.log(`Cannot afford ${area.color} ${area.item} (${area.price} Fortz)`);
            }
            break; // Exit loop after handling the click
        }
    }
}

function updatePlayerStats(data) {
    const player = gameState.players[gameState.playerId];
    let currentScore = 0;
    let currentLevel = 1;

    // Always update from current player data first
    if (player) {
        currentScore = player.score || 0;
        currentLevel = player.level || 1;
        document.getElementById('scoreValue').textContent = currentScore.toLocaleString();
        document.getElementById('levelValue').textContent = currentLevel;
    }

    // If we have new data from server, update everything
    if (data) {
        currentScore = data.score || currentScore;
        currentLevel = data.level || currentLevel;

        // Update UI immediately
        document.getElementById('scoreValue').textContent = currentScore.toLocaleString();
        document.getElementById('levelValue').textContent = currentLevel;

        // Update the player object in game state immediately
        if (gameState.players[gameState.playerId]) {
            gameState.players[gameState.playerId].score = currentScore;
            gameState.players[gameState.playerId].level = currentLevel;
            if (data.exp !== undefined) gameState.players[gameState.playerId].exp = data.exp;
            if (data.kills) gameState.players[gameState.playerId].kills = data.kills;
        }
    }

    // Update lobby level display
    const lobbyLevelDisplay = document.getElementById('levelDisplayLobby');
    if (lobbyLevelDisplay) {
        lobbyLevelDisplay.textContent = currentLevel;
    }

    // Update progress calculation
    const currentLevelThreshold = (currentLevel - 1) * 1000;
    const progressInCurrentLevel = currentScore - currentLevelThreshold;

    // Update level progress bar (for hidden stats compatibility)
    const progressPercentage = (progressInCurrentLevel / 1000) * 100;
    const progressBar = document.getElementById('levelProgress');
    if (progressBar) {
        progressBar.style.width = Math.min(100, Math.max(0, progressPercentage)) + '%';
    }

    // Update top center score progress bar
    const scoreProgressBar = document.getElementById('scoreProgress');
    const scoreProgressText = document.getElementById('scoreProgressText');
    if (scoreProgressBar && scoreProgressText) {
        scoreProgressBar.style.width = Math.min(100, Math.max(0, progressPercentage)) + '%';
        scoreProgressText.textContent = `Level ${currentLevel}`;
    }
}

function returnToLobby() {
    // Trigger CrazyGames gameplay stop event
    if (window.CrazyGamesIntegration) {
        window.CrazyGamesIntegration.gameplayStop();
    }

    // Set lobby state first to prevent reconnection attempts
    gameState.isInLobby = true;
    gameState.isConnected = false;

    // Disconnect from current game
    if (socket) {
        socket.close();
        socket = null;
    }

    // Close lobby socket too if it exists
    if (lobbySocket) {
        lobbySocket.close();
        lobbySocket = null;
    }

    // Reset game state
    gameState.playerId = null;
    gameState.players = {};
    gameState.shapes = [];
    gameState.walls = [];
    gameState.bullets = [];
    gameState.shapeSpawnTimers = {}; // Clear shape respawn timers

    // Show lobby
    document.getElementById('lobbyScreen').classList.remove('hidden');
    document.getElementById('gameMapArea').classList.add('hidden');

    // Hide game canvas during lobby
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

    // Start lobby background rendering
    startLobbyBackgroundRendering();

    console.log('Returned to lobby');
}

// Lobby background with live game preview
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

function initializeLobbyBackground() {
    const canvas = document.getElementById('lobbyBackground');
    if (!canvas) {
        console.warn('Lobby background canvas not found');
        return;
    }
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Connect to server to get live map data
    connectLobbyToServer();

    let time = 0;
    let cameraX = 0;
    let cameraY = 0;
    let targetCameraX = 0;
    let targetCameraY = 0;
    let lastCameraUpdate = 0;
    const CAMERA_UPDATE_INTERVAL = 5000; // 5 seconds between camera movements
    
    let lastFrameTime = performance.now();
    let frameCount = 0;

    function drawBackground(currentTime) {
        if (gameState.isInLobby) {
            // Limit to 30 FPS for lobby (performance optimization)
            const deltaTime = currentTime - lastFrameTime;
            if (deltaTime < 33) { // ~30 FPS
                requestAnimationFrame(drawBackground);
                return;
            }
            lastFrameTime = currentTime;
            frameCount++;

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

            // Only render map every few frames (cache optimization)
            if (frameCount % 2 === 0 && window.MapRenderer && window.MapRenderer.isLoaded) {
                ctx.save();
                ctx.translate(-cameraX, -cameraY);
                
                const lobbyCamera = { x: cameraX, y: cameraY };
                window.MapRenderer.render(ctx, lobbyCamera);
                
                ctx.restore();
            }

            // Draw shapes and other elements on top (only visible ones)
            ctx.save();
            ctx.translate(-cameraX, -cameraY);

            // Only animate shapes in viewport
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
                } else if (shape.type === 'STAR') {
                    drawStar(ctx, 0, 0, shape.size / 2);
                    ctx.fill();
                    ctx.stroke();
                } else if (shape.type === 'DIAMOND') {
                    drawDiamond(ctx, 0, 0, shape.size / 2);
                    ctx.fill();
                    ctx.stroke();
                } else if (shape.type === 'PENTAGON') {
                    // Draw pentagon with a dark blue color
                    const darkBlue = '#1E90FF'; // Dodger blue
                    ctx.fillStyle = darkBlue;
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;

                    // Draw pentagon manually for lobby
                    const radius = shape.size / 2;
                    const numSides = 5;
                    ctx.beginPath();
                    for (let i = 0; i < numSides; i++) {
                        const angle = (Math.PI * 2 * i) / numSides - Math.PI / 2;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }

                ctx.restore();
            });

            // Draw live players (tanks) - only visible ones
            if (imagesLoaded && lobbyMapData.players && Array.isArray(lobbyMapData.players)) {
                lobbyMapData.players.forEach(player => {
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

                    // Smooth rotation animation (slow)
                    const targetRotation = typeof player.rotation === 'number' ? player.rotation : 0;
                    if (!player.smoothRotation) player.smoothRotation = targetRotation;
                    player.smoothRotation += (targetRotation - player.smoothRotation) * 0.05;
                    
                    const weaponRotation = typeof player.weaponRotation === 'number' ? player.weaponRotation : 0;
                    ctx.rotate(player.smoothRotation);

                    // Get player's tank images
                    const { tankImg, weaponImg } = getCurrentTankImages(player.selectedTank);

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
                lobbyMapData.bullets.forEach(bullet => {
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
            requestAnimationFrame(drawBackground);
        }
    }

    requestAnimationFrame(drawBackground);
}

function drawLobbyGrid(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
    const hexSize = 60;  // Bigger hexagons (was 40)
    const hexWidth = hexSize * Math.sqrt(3); // Correct horizontal spacing
    const hexHeight = hexSize * 2;
    const vertSpacing = hexHeight * 0.75; // Vertical spacing for perfect fit

    const worldSize = 4500;
    const viewLeft = cameraX;
    const viewRight = cameraX + canvasWidth;
    const viewTop = cameraY;
    const viewBottom = cameraY + canvasHeight;

    // Better colors - brighter cyan with glow
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 3;  // Thicker/fatter lines (was 1.5)

    // Calculate starting points to ensure perfect grid alignment
    const startRow = Math.floor(viewTop / vertSpacing);
    const endRow = Math.ceil(viewBottom / vertSpacing);
    const startCol = Math.floor(viewLeft / hexWidth);
    const endCol = Math.ceil(viewRight / hexWidth);

    // Draw hexagons in perfect grid pattern, ONLY inside boundaries
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const y = row * vertSpacing;
            const offsetX = (row % 2 === 0) ? 0 : hexWidth / 2;
            const x = col * hexWidth + offsetX;

            // Only draw if STRICTLY within game boundaries
            if (x >= hexSize && x <= worldSize - hexSize &&
                y >= hexSize && y <= worldSize - hexSize) {
                drawHexagonShape(ctx, x, y, hexSize);
            }
        }
    }
}

function connectLobbyToServer() {
    if (lobbySocket) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Include selected game mode for correct map preview
    const gameMode = gameState.selectedGameMode || 'ffa';
    const wsUrl = `${protocol}//${window.location.host}/ws?lobby=true&mode=${gameMode}`;

    lobbySocket = new WebSocket(wsUrl);

    lobbySocket.onopen = () => {
        console.log('Lobby connected to server for map preview');
    };

    lobbySocket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'gameState') {
                lobbyMapData.walls = data.walls || [];
                lobbyMapData.shapes = data.shapes || [];
                // Update lobby background vars
                lobbyWalls = data.walls || [];
                lobbyPlayers = data.players || {};
                // Convert players object to array
                lobbyMapData.players = data.players ? Object.values(data.players) : [];
                // Convert bullets object to array if needed
                lobbyMapData.bullets = data.bullets ? (Array.isArray(data.bullets) ? data.bullets : Object.values(data.bullets)) : [];
                // Re-render lobby background with new data
                if (gameState.isInLobby) {
                    renderLobbyBackground();
                }
            } else if (data.type === 'shapeSpawned') {
                lobbyMapData.shapes.push(data.shape);
            } else if (data.type === 'shapeDestroyed') {
                lobbyMapData.shapes = lobbyMapData.shapes.filter(s => s.id !== data.shapeId);
            } else if (data.type === 'lobbyState') {
                lobbyMapData.walls = data.walls || [];
                lobbyMapData.shapes = data.shapes || [];
                lobbyWalls = data.walls || [];
                lobbyPlayers = data.players || {};
                // Re-render lobby background
                if (gameState.isInLobby) {
                    renderLobbyBackground();
                }
            } else if (data.type === 'playerCounts') {
                // Update player counts for each game mode
                if (data.counts) {
                    Object.keys(data.counts).forEach(mode => {
                        gameModePlayers[mode] = data.counts[mode];
                    });
                }
            }
        } catch (error) {
            console.error('Error parsing lobby message:', error);
        }
    };

    lobbySocket.onclose = () => {
        lobbySocket = null;
        // Only reconnect if we're still in lobby
        if (gameState.isInLobby) {
            setTimeout(connectLobbyToServer, 3000);
        }
    };
}

// Function to close all panels and restore lobby state
function closeAllPanels() {
    // Close all features
    gameState.showShop = false;
    gameState.showLocker = false;
    gameState.showSettings = false;
    gameState.showPass = false;
    gameState.showCreateMap = false;
    gameState.showFriends = false;
    gameState.openedFeature = null;

    // Show level display
    const levelDisplay = document.getElementById('levelDisplayLobby');
    if (levelDisplay) {
        levelDisplay.style.display = 'flex';
    }

    // Show game buttons
    const bottomRightContainer = document.querySelector('.bottom-right-container');
    if (bottomRightContainer) bottomRightContainer.style.display = 'flex';

    // Show party boxes
    const partySlot1 = document.getElementById('partySlot1');
    const partySlot2 = document.getElementById('partySlot2');
    const playerTankSlot = document.getElementById('playerTankSlot');
    if (partySlot1) partySlot1.style.display = 'block';
    if (partySlot2) partySlot2.style.display = 'block';
    if (playerTankSlot) playerTankSlot.style.display = 'block';

    // Show auth buttons, user info, and chat indicator
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const chatIndicator = document.querySelector('.chat-indicator');
    if (authButtons) authButtons.style.display = 'flex';
    if (userInfo) userInfo.style.display = 'flex';
    if (chatIndicator) chatIndicator.style.display = 'flex';

    // Remove shop-open class from shop button
    const shopButton = document.getElementById('shopButton');
    if (shopButton) {
        shopButton.classList.remove('shop-open');
    }

    // Hide the HTML screens
    const createMapScreen = document.getElementById('createMapScreen');
    if (createMapScreen) {
        createMapScreen.classList.add('hidden');
    }

    const shopScreen = document.getElementById('shopScreen');
    if (shopScreen) {
        shopScreen.classList.add('hidden');
    }

    const lockerScreen = document.getElementById('lockerScreen');
    if (lockerScreen) {
        lockerScreen.classList.add('hidden');
    }

    const settingsScreen = document.getElementById('settingsScreen');
    if (settingsScreen) {
        settingsScreen.classList.add('hidden');
    }

    // Stop canvas-based rendering for features
    if (typeof window.stopPassRendering === 'function') {
        window.stopPassRendering();
    }
    if (typeof window.stopFriendsRendering === 'function') {
        window.stopFriendsRendering();
    }

    // Stop game state flags
    gameState.showSettings = false;
    gameState.showPass = false;
    gameState.showFriends = false;

    // Clear click areas
    window.shopClickAreas = {};
    window.featureClickAreas = {};
    window.createMapClickAreas = {};
    window.passClickAreas = {};
}

// Define openFeature function globally for HTML onclick handlers
window.openFeature = function openFeature(feature) {
    console.log(`Opening feature: ${feature}`);

    // Track which feature is open
    if (!gameState.openedFeature) {
        gameState.openedFeature = null;
    }

    // Hide level display when any feature is opened
    const levelDisplay = document.getElementById('levelDisplayLobby');

    if (feature === 'shop') {
        // Close all other panels first
        closeAllPanels();

        // Only allow shop to open in lobby, not during gameplay
        if (typeof gameState !== 'undefined' && gameState.isInLobby) {
            gameState.showShop = true;
            gameState.openedFeature = 'shop';

            const bottomRightContainer = document.querySelector('.bottom-right-container');
            if (bottomRightContainer) bottomRightContainer.style.display = 'none';

            // Hide level display
            if (levelDisplay) levelDisplay.style.display = 'none';

            // Hide party boxes
            const partySlot1 = document.getElementById('partySlot1');
            const partySlot2 = document.getElementById('partySlot2');
            const playerTankSlot = document.getElementById('playerTankSlot');
            if (partySlot1) partySlot1.style.display = 'none';
            if (partySlot2) partySlot2.style.display = 'none';
            if (playerTankSlot) playerTankSlot.style.display = 'none';

            // Hide auth buttons, user info, and chat indicator
            const authButtons = document.getElementById('authButtons');
            const userInfo = document.getElementById('userInfo');
            const chatIndicator = document.querySelector('.chat-indicator');
            if (authButtons) authButtons.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
            if (chatIndicator) chatIndicator.style.display = 'none';

            // Add shop-open class to shop button for yellow styling
            const shopButton = document.getElementById('shopButton');
            if (shopButton) {
                shopButton.classList.add('shop-open');
            }

            // Show the HTML shop screen
            const shopScreen = document.getElementById('shopScreen');
            if (shopScreen) {
                shopScreen.classList.remove('hidden');
                loadShopItems('tanks'); // Load tanks by default
            }
        } else {
            console.log('Shop can only be opened in the lobby!');
        }
    } else if (feature === 'create-map') {
        // Close all other panels first
        closeAllPanels();

        // Create Map functionality
        gameState.showCreateMap = true;
        gameState.openedFeature = 'create-map';

        const bottomRightContainer = document.querySelector('.bottom-right-container');
        if (bottomRightContainer) bottomRightContainer.style.display = 'none';

        // Hide level display
        const levelDisplay = document.getElementById('levelDisplayLobby');
        if (levelDisplay) levelDisplay.style.display = 'none';

        // Hide party boxes
        const partySlot1 = document.getElementById('partySlot1');
        const partySlot2 = document.getElementById('partySlot2');
        const playerTankSlot = document.getElementById('playerTankSlot');
        if (partySlot1) partySlot1.style.display = 'none';
        if (partySlot2) partySlot2.style.display = 'none';
        if (playerTankSlot) playerTankSlot.style.display = 'none';

        // Hide auth buttons, user info, and chat indicator
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        const chatIndicator = document.querySelector('.chat-indicator');
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        if (chatIndicator) chatIndicator.style.display = 'none';

        // Show the HTML screen
        const createMapScreen = document.getElementById('createMapScreen');
        if (createMapScreen) {
            createMapScreen.classList.remove('hidden');
        }
    } else if (feature === 'locker') {
        // Close all other panels first
        closeAllPanels();

        // Locker functionality - show owned items and allow equipping
        gameState.showLocker = true;
        gameState.openedFeature = 'locker';

        const bottomRightContainer = document.querySelector('.bottom-right-container');
        if (bottomRightContainer) bottomRightContainer.style.display = 'none';

        // Hide level display
        const levelDisplay = document.getElementById('levelDisplayLobby');
        if (levelDisplay) levelDisplay.style.display = 'none';

        // Hide party boxes
        const partySlot1 = document.getElementById('partySlot1');
        const partySlot2 = document.getElementById('partySlot2');
        const playerTankSlot = document.getElementById('playerTankSlot');
        if (partySlot1) partySlot1.style.display = 'none';
        if (partySlot2) partySlot2.style.display = 'none';
        if (playerTankSlot) playerTankSlot.style.display = 'none';

        // Hide auth buttons, user info, and chat indicator
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        const chatIndicator = document.querySelector('.chat-indicator');
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        if (chatIndicator) chatIndicator.style.display = 'none';

        // Show the HTML locker screen
        const lockerScreen = document.getElementById('lockerScreen');
        if (lockerScreen) {
            lockerScreen.classList.remove('hidden');
            loadLockerItems('colors'); // Load colors by default
            updateLockerPreview(); // Update the current loadout preview
        }
    } else if (feature === 'settings') {
        // Close all other panels first
        closeAllPanels();


        // Settings functionality - show actual settings panel
        gameState.showSettings = true;
        gameState.openedFeature = 'settings';

        const bottomRightContainer = document.querySelector('.bottom-right-container');
        if (bottomRightContainer) bottomRightContainer.style.display = 'none';

        // Hide level display
        const levelDisplay = document.getElementById('levelDisplayLobby');
        if (levelDisplay) levelDisplay.style.display = 'none';

        // Hide party boxes
        const partySlot1 = document.getElementById('partySlot1');
        const partySlot2 = document.getElementById('partySlot2');
        const playerTankSlot = document.getElementById('playerTankSlot');
        if (partySlot1) partySlot1.style.display = 'none';
        if (partySlot2) partySlot2.style.display = 'none';
        if (playerTankSlot) playerTankSlot.style.display = 'none';

        // Hide auth buttons, user info, and chat indicator
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        const chatIndicator = document.querySelector('.chat-indicator');
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        if (chatIndicator) chatIndicator.style.display = 'none';

        // Show the HTML settings screen
        const settingsScreen = document.getElementById('settingsScreen');
        if (settingsScreen) {
            settingsScreen.classList.remove('hidden');

            // Initialize settings UI
            if (typeof window.initSettingsUI === 'function') {
                window.initSettingsUI();
            }
        }
    } else if (feature === 'pass') {
        // Close all other panels first
        closeAllPanels();

        // Pass functionality - show battle pass screen
        gameState.showPass = true;
        gameState.openedFeature = 'pass';

        const bottomRightContainer = document.querySelector('.bottom-right-container');
        if (bottomRightContainer) bottomRightContainer.style.display = 'none';

        // Hide level display
        const levelDisplay = document.getElementById('levelDisplayLobby');
        if (levelDisplay) levelDisplay.style.display = 'none';

        // Hide party boxes
        const partySlot1 = document.getElementById('partySlot1');
        const partySlot2 = document.getElementById('partySlot2');
        const playerTankSlot = document.getElementById('playerTankSlot');
        if (partySlot1) partySlot1.style.display = 'none';
        if (partySlot2) partySlot2.style.display = 'none';
        if (playerTankSlot) playerTankSlot.style.display = 'none';

        // Hide auth buttons, user info, and chat indicator
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        const chatIndicator = document.querySelector('.chat-indicator');
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        if (chatIndicator) chatIndicator.style.display = 'none';

        startPassRendering();
    } else if (feature === 'friends') {
        // Close all other panels first
        closeAllPanels();

        // Friends functionality - show friends screen
        gameState.showFriends = true;
        gameState.openedFeature = 'friends';

        const bottomRightContainer = document.querySelector('.bottom-right-container');
        if (bottomRightContainer) bottomRightContainer.style.display = 'none';

        // Hide level display
        const levelDisplay = document.getElementById('levelDisplayLobby');
        if (levelDisplay) levelDisplay.style.display = 'none';

        // Hide party boxes
        const partySlot1 = document.getElementById('partySlot1');
        const partySlot2 = document.getElementById('partySlot2');
        const playerTankSlot = document.getElementById('playerTankSlot');
        if (partySlot1) partySlot1.style.display = 'none';
        if (partySlot2) partySlot2.style.display = 'none';
        if (playerTankSlot) playerTankSlot.style.display = 'none';

        // Hide auth buttons, user info, and chat indicator
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        const chatIndicator = document.querySelector('.chat-indicator');
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        if (chatIndicator) chatIndicator.style.display = 'none';

        startFriendsRendering();
    } else if (feature === 'armor' || feature === 'upgrades') {
        console.log(`${feature} functionality coming soon!`);
        gameState.openedFeature = feature;
    }
};

// Helper function to draw close button for all features (globally accessible)
window.drawCloseButton = function drawCloseButton(ctx, canvas) {
    const btnSize = 50;
    const btnX = canvas.width - btnSize - 30;
    const btnY = 120; // Same Y position as shop

    const isMouseOverBtn = gameState.mouse &&
        gameState.mouse.x >= btnX && gameState.mouse.x <= btnX + btnSize &&
        gameState.mouse.y >= btnY && gameState.mouse.y <= btnY + btnSize;

    const btnHoverScale = isMouseOverBtn ? 1.1 : 1.0;
    const btnOpacity = isMouseOverBtn ? 1.0 : 0.8;
    const btnGlow = isMouseOverBtn ? 15 : 8;

    ctx.save();
    ctx.translate(btnX + btnSize / 2, btnY + btnSize / 2);
    ctx.scale(btnHoverScale, btnHoverScale);
    ctx.translate(-btnSize / 2, -btnSize / 2);

    const btnGradient = ctx.createRadialGradient(
        btnSize / 2, btnSize / 2, 0,
        btnSize / 2, btnSize / 2, btnSize / 2
    );
    btnGradient.addColorStop(0, `rgba(255, 120, 120, ${btnOpacity})`);
    btnGradient.addColorStop(0.7, `rgba(255, 80, 80, ${btnOpacity * 0.8})`);
    btnGradient.addColorStop(1, `rgba(200, 50, 50, ${btnOpacity * 0.6})`);

    ctx.fillStyle = btnGradient;
    ctx.fillRect(0, 0, btnSize, btnSize);

    ctx.strokeStyle = `rgba(255, 100, 100, ${btnOpacity})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = btnGlow;
    ctx.shadowColor = '#ff6464';
    ctx.strokeRect(0, 0, btnSize, btnSize);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = `rgba(255, 255, 255, ${btnOpacity})`;
    ctx.lineWidth = isMouseOverBtn ? 4 : 3;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 3;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(15, 15);
    ctx.lineTo(35, 35);
    ctx.moveTo(35, 15);
    ctx.lineTo(15, 35);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();

    // Store click area
    if (!window.featureClickAreas) window.featureClickAreas = {};
    window.featureClickAreas.closeButton = {
        x: btnX, y: btnY, width: btnSize, height: btnSize, action: 'close'
    };
}

// Game Mode Modal functionality - Only custom maps, no default modes

// Function to get player count for each game mode
function getGameModePlayerCount(modeId) {
    // Return the actual tracked player count for this mode
    return gameModePlayers[modeId] || 0;
}

// Function to get saved maps from localStorage
function getSavedMaps() {
    return JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
}

// Function to filter and display maps based on search term
function filterGameModes(searchTerm) {
    const list = document.getElementById('gameModeList');
    if (!list) return;

    // Clear existing items
    list.innerHTML = '';

    // Get saved maps
    const maps = getSavedMaps();

    // Check if "show created maps only" is checked
    const showCreatedOnly = document.getElementById('showCreatedMapsOnly')?.checked || false;

    // Filter maps based on search term and created maps filter
    const filteredMaps = maps.filter(map => {
        // If showing created maps only, only show user-created maps
        if (showCreatedOnly && !map.isUserCreated) {
            return false;
        }

        // Apply search filter
        if (!searchTerm) return true; // Show all if search is empty

        const term = searchTerm.toLowerCase();
        return map.name.toLowerCase().includes(term);
    });

    // Display filtered maps
    filteredMaps.forEach(map => {
        const item = document.createElement('div');
        item.className = 'game-mode-item' + (gameState.selectedMap === map.id ? ' selected' : '');
        item.onclick = () => selectMap(map.id);

        // Create image/thumbnail
        const imgElement = document.createElement('img');
        imgElement.className = 'game-mode-image';
        imgElement.alt = map.name;

        if (map.thumbnail) {
            imgElement.src = map.thumbnail;
        } else {
            // Create a placeholder if no thumbnail
            imgElement.style.background = 'linear-gradient(135deg, rgba(10, 20, 40, 0.9), rgba(5, 10, 25, 0.9))';
            imgElement.style.display = 'flex';
            imgElement.style.alignItems = 'center';
            imgElement.style.justifyContent = 'center';
            imgElement.style.color = 'rgba(255, 255, 255, 0.5)';
            imgElement.alt = '🗺️';
        }

        // Create info container
        const infoDiv = document.createElement('div');
        infoDiv.className = 'game-mode-info';
        const objectCount = map.objects ? map.objects.length : 0;
        const createdDate = new Date(map.created).toLocaleDateString();
        infoDiv.innerHTML = `
            <span class="game-mode-abbr">${map.name}</span> - <span class="game-mode-count">${objectCount} Objects</span> - <span class="game-mode-creator">${createdDate}</span>
        `;

        item.appendChild(imgElement);
        item.appendChild(infoDiv);
        list.appendChild(item);
    });

    // Show "no results" message if no matches found
    if (filteredMaps.length === 0) {
        const noResults = document.createElement('div');
        noResults.style.cssText = 'color: rgba(255, 255, 255, 0.6); font-size: 1.2rem; padding: 40px; text-align: center; width: 100%;';

        if (maps.length === 0) {
            noResults.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                    <div style="font-size: 3rem;">🗺️</div>
                    <div>No maps created yet</div>
                    <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.4);">Create your first map to get started!</div>
                </div>
            `;
        } else if (showCreatedOnly) {
            noResults.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                    <div style="font-size: 3rem;">🗺️</div>
                    <div>No created maps found</div>
                    <div style="font-size: 0.9rem; color: rgba(255, 255, 255, 0.4);">Create your first map to get started!</div>
                </div>
            `;
        } else {
            noResults.textContent = `No maps found matching "${searchTerm}"`;
        }
        list.appendChild(noResults);
    }
}

// Function to select a map
function selectMap(mapId) {
    gameState.selectedMap = mapId;

    // Update UI to show selection
    const items = document.querySelectorAll('.game-mode-item');
    items.forEach(item => {
        item.classList.remove('selected');
    });

    const selectedItem = Array.from(items).find(item => {
        return item.onclick.toString().includes(mapId);
    });

    if (selectedItem) {
        selectedItem.classList.add('selected');
    }

    // Find the map
    const maps = getSavedMaps();
    const selectedMapData = maps.find(m => m.id === mapId);

    if (selectedMapData) {
        // Update play button text to show selected map name
        const playButtonMapName = document.getElementById('playButtonMapName');
        if (playButtonMapName) {
            playButtonMapName.textContent = selectedMapData.name.toUpperCase();
        }

        // Dispatch map selection event for integration system
        if (typeof window.gameEvents !== 'undefined') {
            window.gameEvents.dispatch('mapSelected', {
                mapId: mapId,
                mapName: selectedMapData.name,
                mapData: selectedMapData
            });
        }

        showNotification(`Map "${selectedMapData.name}" selected!`, '#00f7ff', 24);
    }
}

// Expose selectMap to window
window.selectMap = selectMap;

window.openBattleRoyal = function () {
    const modal = document.getElementById('gameModeModal');
    const searchInput = document.getElementById('gameModeSearch');

    if (!modal) return;

    // Clear search input
    if (searchInput) {
        searchInput.value = '';
    }

    // Auto-select most played map if no map is currently selected
    if (!gameState.selectedMap) {
        const maps = getSavedMaps();
        if (maps.length > 0) {
            // Get play counts and find most played map
            const playCountsStr = localStorage.getItem('thefortz.mapPlays') || '{}';
            const playCounts = JSON.parse(playCountsStr);

            let mostPlayedMap = null;
            let maxPlays = -1;

            maps.forEach(map => {
                const plays = playCounts[String(map.id)] || 0;
                if (plays > maxPlays) {
                    maxPlays = plays;
                    mostPlayedMap = map;
                }
            });

            // If no plays recorded, select the newest map
            if (!mostPlayedMap) {
                mostPlayedMap = maps.sort((a, b) => new Date(b.created) - new Date(a.created))[0];
            }

            if (mostPlayedMap) {
                selectMap(mostPlayedMap.id);
            }
        }
    }

    // Populate all game modes initially
    filterGameModes('');

    // Add search event listener
    if (searchInput) {
        // Remove old listener if exists
        const newInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newInput, searchInput);

        // Add new listener
        newInput.addEventListener('input', (e) => {
            filterGameModes(e.target.value);
        });
    }

    // Show modal
    modal.classList.remove('hidden');

    // Update button to show current selection
    const maps = getSavedMaps();
    const selectedMapData = gameState.selectedMap ? maps.find(m => m.id === gameState.selectedMap) : null;
    const mapButton = document.querySelector('.map-button');

    if (selectedMapData && mapButton && selectedMapData.thumbnail) {
        mapButton.textContent = '';
        mapButton.style.backgroundImage = `url('${selectedMapData.thumbnail}')`;
        mapButton.style.backgroundSize = 'cover';
        mapButton.style.backgroundRepeat = 'no-repeat';
        mapButton.style.backgroundPosition = 'center';
    } else if (mapButton) {
        // Show default map icon
        mapButton.textContent = '🗺️';
        mapButton.style.backgroundImage = 'none';
    }
};

window.closeGameModeModal = function () {
    const modal = document.getElementById('gameModeModal');
    if (modal) modal.classList.add('hidden');
};

// Filter functionality removed - only showing created maps now

window.scrollGameModeList = function (direction) {
    const list = document.getElementById('gameModeList');
    if (!list) return;

    const scrollAmount = 320; // Width of one game mode item (280px) + gap (30px) + extra (10px)

    if (direction === 'left') {
        list.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    } else if (direction === 'right') {
        list.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }
};

window.selectGameMode = function (modeId) {
    gameState.selectedGameMode = modeId;

    // Update visual selection
    const items = document.querySelectorAll('.game-mode-item');
    items.forEach(item => item.classList.remove('selected'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('selected');
    }

    // Reconnect lobby to show new map for this mode
    if (lobbySocket) {
        lobbySocket.close();
        lobbySocket = null;
    }
    connectLobbyToServer();

    console.log(`Selected game mode: ${modeId}`);
};

// Function to change game mode (sends to server)
window.changeGameMode = function (mode) {
    if (gameState.isConnected && socket && socket.readyState === WebSocket.OPEN) {
        sendToServer('changeGameMode', { mode: mode });
        gameState.selectedGameMode = mode;
        console.log(`Changed game mode to: ${mode}`);
    } else {
        // Just save selection if not connected
        gameState.selectedGameMode = mode;
        console.log(`Game mode selected: ${mode} (will apply when joining)`);
    }
};

// Pass rendering is now in pass.js

// Create Map functionality is in creatmap.js

// Fix missing closeShop function (define IMMEDIATELY at top level)
window.closeShop = function () {
    if (typeof gameState !== 'undefined') {
        gameState.showShop = false;
        window.shopClickAreas = {};

        // Update shop button appearance
        const shopButton = document.getElementById('shopButton');
        if (shopButton) {
            shopButton.classList.remove('shop-open');
        }

        // Show game buttons when shop is closed
        const gameButtons = document.getElementById('gameButtons');
        if (gameButtons) gameButtons.style.display = 'flex';
    }
};

// Lobby shop rendering system
let lobbyShopAnimationId = null;

function startLobbyShopRendering() {
    if (lobbyShopAnimationId) return; // Already running

    const canvas = document.getElementById('lobbyBackground');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function renderLobbyShop() {
        if (gameState.isInLobby && gameState.showShop) {
            // Initialize scroll systems if needed
            if (!window.shopRowScrollOffsets) window.shopRowScrollOffsets = {};
            if (!window.shopTargetScrollOffsets) window.shopTargetScrollOffsets = {};
            if (!window.shopScrollOffsetY) window.shopScrollOffsetY = 0;
            if (!window.shopTargetScrollOffsetY) window.shopTargetScrollOffsetY = 0;

            // Smooth scroll interpolation for all rows
            const colorOrder = ['blue', 'camo', 'desert', 'purple', 'red'];
            colorOrder.forEach(color => {
                // Initialize if not exists
                if (typeof window.shopRowScrollOffsets[color] === 'undefined') {
                    window.shopRowScrollOffsets[color] = 0;
                }
                if (typeof window.shopTargetScrollOffsets[color] === 'undefined') {
                    window.shopTargetScrollOffsets[color] = 0;
                }

                const current = window.shopRowScrollOffsets[color];
                const target = window.shopTargetScrollOffsets[color];
                const diff = target - current;

                // Smooth lerp with higher precision
                if (Math.abs(diff) > 0.5) {
                    window.shopRowScrollOffsets[color] = current + diff * 0.15;
                } else {
                    window.shopRowScrollOffsets[color] = target;
                }
            });

            // Smooth vertical scrolling
            const verticalDiff = window.shopTargetScrollOffsetY - window.shopScrollOffsetY;
            if (Math.abs(verticalDiff) > 0.5) {
                window.shopScrollOffsetY += verticalDiff * 0.15;
            } else {
                window.shopScrollOffsetY = window.shopTargetScrollOffsetY;
            }

            // Save the current canvas state
            ctx.save();

            // Draw shop on top of the lobby background
            drawShop();

            ctx.restore();

            lobbyShopAnimationId = requestAnimationFrame(renderLobbyShop);
        } else {
            lobbyShopAnimationId = null;
        }
    }

    renderLobbyShop();
}

function stopLobbyShopRendering() {
    if (lobbyShopAnimationId) {
        cancelAnimationFrame(lobbyShopAnimationId);
        lobbyShopAnimationId = null;
    }

    // Remove scroll buttons
    const buttonContainer = document.getElementById('shopScrollButtons');
    if (buttonContainer) buttonContainer.remove();

    // Clear the lobby background canvas to remove shop overlay
    const canvas = document.getElementById('lobbyBackground');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw the lobby background if needed
        if (gameState.isInLobby) {
            initializeLobbyBackground(); // This should redraw the lobby
        }
    }
}

// Add lobby shop click handler
function setupLobbyShopHandler() {
    const lobbyCanvas = document.getElementById('lobbyBackground');
    if (!lobbyCanvas) return;

    lobbyCanvas.addEventListener('mousedown', (e) => {
        if (e.button === 0 && gameState.isInLobby && gameState.showShop) {
            e.preventDefault();
            handleShopClick(e);
        }
    });

    // Add scroll support for shop (vertical and horizontal per row)
    lobbyCanvas.addEventListener('wheel', (e) => {
        if (gameState.isInLobby && gameState.showShop) {
            e.preventDefault();
            const scrollSpeed = 60;

            // Initialize all scroll systems properly
            if (!window.shopScrollOffsetY) window.shopScrollOffsetY = 0;
            if (!window.shopTargetScrollOffsetY) window.shopTargetScrollOffsetY = 0;
            if (!window.shopRowScrollOffsets) window.shopRowScrollOffsets = {};
            if (!window.shopTargetScrollOffsets) window.shopTargetScrollOffsets = {};
            if (!window.shopRowAreas) window.shopRowAreas = {};

            const rect = lobbyCanvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            console.log(`Mouse at: ${mouseX}, ${mouseY}, deltaX: ${e.deltaX}, deltaY: ${e.deltaY}, shift: ${e.shiftKey}`);

            // Find which row the mouse is over
            let targetRow = null;
            let rowInfo = null;

            for (const [color, area] of Object.entries(window.shopRowAreas)) {
                const rowStartY = area.y - (window.shopScrollOffsetY || 0);
                const rowEndY = rowStartY + area.height;

                console.log(`Checking row ${color}: rowY ${rowStartY}-${rowEndY}, mouseY: ${mouseY}`);

                if (mouseY >= rowStartY && mouseY <= rowEndY && mouseX > 80 && mouseX < lobbyCanvas.width - 80) {
                    targetRow = color;
                    rowInfo = area;
                    console.log(`Mouse is over row: ${targetRow}`);
                    break;
                }
            }

            // Determine scroll type
            let isHorizontalScroll = false;
            let scrollDelta = 0;

            // Check for horizontal scroll intent
            if (targetRow && (Math.abs(e.deltaX) > 2 || (e.shiftKey && Math.abs(e.deltaY) > 2))) {
                isHorizontalScroll = true;
                scrollDelta = Math.abs(e.deltaX) > 2 ? e.deltaX : e.deltaY;
                console.log(`Horizontal scroll detected for ${targetRow}, delta: ${scrollDelta}`);
            }

            if (isHorizontalScroll && targetRow && rowInfo) {
                // Initialize scroll offsets for this row if needed
                if (typeof window.shopRowScrollOffsets[targetRow] === 'undefined') {
                    window.shopRowScrollOffsets[targetRow] = 0;
                    console.log(`Initialized row scroll offset for ${targetRow}`);
                }
                if (typeof window.shopTargetScrollOffsets[targetRow] === 'undefined') {
                    window.shopTargetScrollOffsets[targetRow] = 0;
                    console.log(`Initialized target scroll offset for ${targetRow}`);
                }

                // Calculate scroll parameters
                const itemWidth = SHOP_SQUARE_SIZE + SHOP_GRID_SPACING;
                const scrollAmount = scrollDelta > 0 ? itemWidth * 1.5 : -itemWidth * 1.5;
                const currentOffset = window.shopTargetScrollOffsets[targetRow] || 0;
                const newOffset = currentOffset + scrollAmount;

                // Calculate max horizontal scroll for this row
                const totalRowWidth = rowInfo.itemCount * itemWidth;
                const viewportWidth = lobbyCanvas.width - 160;
                const maxScrollX = Math.max(0, totalRowWidth - viewportWidth + 40);

                // Apply new offset with bounds
                window.shopTargetScrollOffsets[targetRow] = Math.max(0, Math.min(maxScrollX, newOffset));

                console.log(`Horizontal scroll ${targetRow}: ${currentOffset} -> ${window.shopTargetScrollOffsets[targetRow]} (max: ${maxScrollX})`);
                console.log(`Row has ${rowInfo.itemCount} items, totalWidth: ${totalRowWidth}, viewportWidth: ${viewportWidth}`);

                return; // Exit early for horizontal scroll
            }

            // Vertical scrolling (default behavior)
            const verticalDelta = e.deltaY;
            window.shopTargetScrollOffsetY += verticalDelta > 0 ? scrollSpeed : -scrollSpeed;

            // Calculate max vertical scroll
            const contentHeight = Object.keys(window.shopRowAreas || {}).length * (SHOP_SQUARE_SIZE + 120);
            const viewportHeight = lobbyCanvas.height - 160;
            const maxScrollY = Math.max(0, contentHeight - viewportHeight);

            // Clamp vertical scroll
            window.shopTargetScrollOffsetY = Math.max(0, Math.min(maxScrollY, window.shopTargetScrollOffsetY));

            console.log(`Vertical scroll: ${window.shopScrollOffsetY} -> ${window.shopTargetScrollOffsetY} (max: ${maxScrollY})`);
        }
    });

    // Add touch support for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;
    let touchCurrentRow = null;

    lobbyCanvas.addEventListener('touchstart', (e) => {
        if (gameState.isInLobby && gameState.showShop) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = lobbyCanvas.getBoundingClientRect();
            touchStartX = touch.clientX - rect.left;
            touchStartY = touch.clientY - rect.top;

            // Find which row the touch started in
            if (window.shopRowAreas) {
                for (const [color, area] of Object.entries(window.shopRowAreas)) {
                    const rowStartY = area.y - (window.shopScrollOffsetY || 0);
                    const rowEndY = rowStartY + area.height;
                    if (touchStartY >= rowStartY && touchStartY <= rowEndY) {
                        touchCurrentRow = color;
                        break;
                    }
                }
            }
        }
    });

    lobbyCanvas.addEventListener('touchmove', (e) => {
        if (gameState.isInLobby && gameState.showShop) {
            e.preventDefault();
        }
    });

    lobbyCanvas.addEventListener('touchend', (e) => {
        if (gameState.isInLobby && gameState.showShop) {
            e.preventDefault();
            if (e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                const rect = lobbyCanvas.getBoundingClientRect();
                const touchEndX = touch.clientX - rect.left;
                const touchEndY = touch.clientY - rect.top;

                const deltaX = touchEndX - touchStartX;
                const deltaY = touchEndY - touchStartY;

                // If we started in a row and moved horizontally more than vertically
                if (touchCurrentRow && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
                    // Initialize scroll offsets consistently
                    if (!window.shopRowScrollOffsets) {
                        window.shopRowScrollOffsets = {};
                    }
                    if (!window.shopTargetScrollOffsets) {
                        window.shopTargetScrollOffsets = {};
                    }

                    if (typeof window.shopRowScrollOffsets[touchCurrentRow] === 'undefined') {
                        window.shopRowScrollOffsets[touchCurrentRow] = 0;
                    }
                    if (typeof window.shopTargetScrollOffsets[touchCurrentRow] === 'undefined') {
                        window.shopTargetScrollOffsets[touchCurrentRow] = window.shopRowScrollOffsets[touchCurrentRow];
                    }

                    const rowArea = window.shopRowAreas[touchCurrentRow];
                    const itemWidth = rowArea.itemWidth;
                    const scrollAmount = deltaX > 0 ? -itemWidth * 2 : itemWidth * 2; // Swipe right = scroll left
                    window.shopTargetScrollOffsets[touchCurrentRow] += scrollAmount;

                    // Calculate max horizontal scroll for this row
                    const totalRowWidth = rowArea.itemCount * rowArea.itemWidth;
                    const viewportWidth = lobbyCanvas.width - 160;
                    const maxScrollX = Math.max(0, totalRowWidth - viewportWidth + 40);

                    // Clamp target scroll
                    window.shopTargetScrollOffsets[touchCurrentRow] = Math.max(0, Math.min(maxScrollX, window.shopTargetScrollOffsets[touchCurrentRow]));
                }
                // Vertical scrolling for touch
                else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
                    // Initialize target vertical scroll if needed
                    if (typeof window.shopTargetScrollOffsetY === 'undefined') {
                        window.shopTargetScrollOffsetY = window.shopScrollOffsetY || 0;
                    }

                    const scrollSpeed = 60;
                    window.shopTargetScrollOffsetY += deltaY > 0 ? -scrollSpeed * 3 : scrollSpeed * 3; // Swipe down = scroll up

                    // Calculate max vertical scroll
                    const contentHeight = Object.keys(window.shopRowAreas).length * (SHOP_SQUARE_SIZE + 120);
                    const viewportHeight = lobbyCanvas.height - 160;
                    const maxScrollY = Math.max(0, contentHeight - viewportHeight);

                    // Clamp target vertical scroll
                    window.shopTargetScrollOffsetY = Math.max(0, Math.min(maxScrollY, window.shopTargetScrollOffsetY));
                }

                touchCurrentRow = null;
            }
        }
    });
}

// Vehicle type selection function
function selectVehicleType(type) {
    console.log(`Selected vehicle type: ${type}`);
    
    // Update button states
    const tankBtn = document.getElementById('tankBtn');
    const jetBtn = document.getElementById('jetBtn');
    
    if (type === 'tank') {
        tankBtn.classList.add('active');
        jetBtn.classList.remove('active');
        
        // Show tank customization options
        gameState.selectedVehicleType = 'tank';
        
        // Update UI to show tank-related options
        console.log('Tank mode activated - showing tank customization');
        
    } else if (type === 'jet') {
        jetBtn.classList.add('active');
        tankBtn.classList.remove('active');
        
        // Show jet customization options (future feature)
        gameState.selectedVehicleType = 'jet';
        
        // Update UI to show jet-related options
        console.log('Jet mode activated - jet customization coming soon!');
        
        // For now, show a notification that jets are coming soon
        if (typeof showNotification === 'function') {
            showNotification('Jets Coming Soon!', '#FFA500', 32);
        }
    }
}

// Make functions global for onclick handlers
window.openFeature = openFeature;
window.joinGame = joinGame;
window.returnToLobby = returnToLobby;
window.selectVehicleType = selectVehicleType;
window.leaveLobby = function () {
    console.log('Going to lobby...');
    // Close shop if open
    if (gameState.showShop) {
        gameState.showShop = false;
        stopLobbyShopRendering();
    }

    // Reset to initial lobby state without reloading
    gameState.isInLobby = true;
    gameState.isConnected = false;

    // Show lobby screen if it's hidden
    const lobbyScreen = document.getElementById('lobbyScreen');
    if (lobbyScreen && lobbyScreen.classList.contains('hidden')) {
        lobbyScreen.classList.remove('hidden');
        lobbyScreen.style.animation = 'fadeIn 0.5s ease-out';
    }

    // Hide any game elements that might be showing
    const gameMapArea = document.getElementById('gameMapArea');
    const ui = document.getElementById('ui');
    const scoreProgress = document.getElementById('scoreProgressContainer');
    const centerBoxes = document.getElementById('centerBottomBoxes');

    if (gameMapArea) gameMapArea.classList.add('hidden');
    if (ui) ui.classList.add('hidden');
    if (scoreProgress) scoreProgress.classList.add('hidden');
    if (centerBoxes) centerBoxes.classList.add('hidden');

    // Render DOM map to lobby
    if (window.DOMMapRenderer && window.DOMMapRenderer.initialized) {
        window.DOMMapRenderer.renderToLobby();
    }

    // Make sure lobby background is running
    initializeLobbyBackground();
};



// Render tank on lobby preview canvas (uses animated GIFs)
function renderTankOnCanvas(canvasId, tankConfig) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    // Use GIF images for lobby preview
    const { tankImg, weaponImg } = getCurrentTankImages(tankConfig, true);

    if (!tankImg || !weaponImg || !tankImg.complete || !weaponImg.complete) {
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Simple continuous 360-degree rotation - 2x slower
    const rotation = (Date.now() * 0.00005) % (Math.PI * 2);
    ctx.rotate(rotation);

    // Draw tank body (use GIF for animated lobby preview)
    const size = Math.min(canvas.width, canvas.height) * 0.66; // 10% bigger (0.6 * 1.1)
    const tankScale = size / Math.max(tankImg.width, tankImg.height);
    ctx.drawImage(
        tankImg,
        -tankImg.width * tankScale / 2,
        -tankImg.height * tankScale / 2,
        tankImg.width * tankScale,
        tankImg.height * tankScale
    );

    // Draw weapon (use GIF for animated lobby preview) - 20% bigger
    const weaponScale = size / Math.max(weaponImg.width, weaponImg.height); // Normal size for lobby preview
    ctx.drawImage(
        weaponImg,
        -weaponImg.width * weaponScale / 2,
        -weaponImg.height * weaponScale / 2,
        weaponImg.width * weaponScale,
        weaponImg.height * weaponScale
    );

    ctx.restore();
}

// Animate lobby tank previews
function animateLobbyTanks() {
    if (gameState.isInLobby && imagesLoaded) {
        renderTankOnCanvas('playerTankCanvas', gameState.selectedTank);

        // Render party member tanks if they exist
        if (window.partyMembers && window.partyMembers.length > 0) {
            window.partyMembers.forEach((member, index) => {
                const slotNumber = index + 1;
                const canvasId = `partyTank${slotNumber}Canvas`;
                if (member && member.selectedTank) {
                    renderTankOnCanvas(canvasId, member.selectedTank);
                }
            });
        }

        requestAnimationFrame(animateLobbyTanks);
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initializeLobbyBackground();

    // Initialize currency display
    updateFortzDisplay();

    // Initialize map button with default icon
    const mapButton = document.querySelector('.map-button');
    if (mapButton) {
        mapButton.textContent = '🗺️';
        mapButton.style.backgroundImage = 'none';
    }

    // Initialize shop category
    window.currentShopCategory = 'tanks';

    // Initialize shop scroll offsets
    window.shopScrollOffset = 0;
    window.shopScrollOffsetX = 0;
    window.shopScrollOffsetY = 0;
    window.shopTargetScrollOffsetY = 0; // Initialize target offset

    // Setup lobby shop handlers
    setupLobbyShopHandler();

    // Setup input handlers
    setupInputHandlers();

    // Start animating lobby tank previews
    setTimeout(() => {
        if (imagesLoaded) {
            animateLobbyTanks();
        } else {
            // Wait for images to load
            const checkInterval = setInterval(() => {
                if (imagesLoaded) {
                    clearInterval(checkInterval);
                    animateLobbyTanks();
                }
            }, 100);
        }
    }, 100);

    // Window resize handler
    window.addEventListener('resize', () => {
        const lobbyCanvas = document.getElementById('lobbyBackground');
        if (lobbyCanvas) {
            lobbyCanvas.width = window.innerWidth;
            lobbyCanvas.height = window.innerHeight;
        }

        if (canvas) {
            resizeCanvas();
        }
    });
});
// Game mode modal is now handled with HTML elements above

// Locker rendering is now in locker.js

// Add click handlers for new panels
document.addEventListener('click', (e) => {
    const rect = document.getElementById('lobbyBackground')?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check for close button click on any feature
    if (window.featureClickAreas?.closeButton) {
        const area = window.featureClickAreas.closeButton;
        if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
            closeAllPanels();
            return;
        }
    }

    if (gameState.showGameModes && window.gameModeClickAreas) {
        for (const [id, area] of Object.entries(window.gameModeClickAreas)) {
            if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
                gameState.selectedGameMode = area.mode;
                console.log('Selected game mode:', area.mode);

                // Show confirmation message
                const modeNames = {
                    'ffa': 'Free For All',
                    'tdm': 'Team Deathmatch',
                    'ctf': 'Capture the Flag',
                    'koth': 'King of the Hill',
                    'br': 'Battle Royale'
                };
                showNotification(`${modeNames[area.mode]} selected!`, '#00f7ff', 24);

                // If in game, immediately change the map
                if (gameState.isConnected) {
                    changeGameMode(area.mode);
                }
            }
        }
    }

    if (gameState.showLocker && window.lockerClickAreas) {
        for (const [id, area] of Object.entries(window.lockerClickAreas)) {
            if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
                const key = area.category === 'colors' ? 'color' : area.category === 'bodies' ? 'body' : 'weapon';
                gameState.selectedTank[key] = area.item;
                console.log('Equipped:', area.item);
            }
        }
    }

    if (gameState.showSettings && settingSliders) {
        for (const [id, slider] of Object.entries(settingSliders)) {
            if (slider.category === 'sound' && x >= slider.x && x <= slider.x + slider.width &&
                y >= slider.y && y <= slider.y + slider.height) {
                const value = Math.round(((x - slider.x) / slider.width) * 100);
                gameState.settings.sound[slider.type] = Math.max(0, Math.min(100, value));
            } else if (slider.category === 'graphics' && x >= slider.x && x <= slider.x + slider.width &&
                y >= slider.y && y <= slider.y + slider.height) {
                gameState.settings.graphics.quality = slider.quality;
            }
        }
    }

    if (gameState.showPass && window.passClickAreas) {
        for (const [id, area] of Object.entries(window.passClickAreas)) {
            if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
                // Claim the reward
                const tier = PASS_TIERS.find(t => t.tier === area.tier);
                if (tier && !tier.claimed) {
                    tier.claimed = true;
                    // Award the reward based on tier
                    if (tier.reward.includes('Fortz')) {
                        const amount = parseInt(tier.reward);
                        if (!isNaN(amount)) {
                            gameState.fortzCurrency += amount;
                            updateFortzDisplay();
                        }
                    }
                    console.log(`Claimed reward: ${tier.reward}`);
                }
            }
        }
    }

    // Create map clicks are now handled by handleMapCreatorClick in creatmap.js
});

// Close panels with ESC key and handle chat input
document.addEventListener('keydown', (e) => {
    // Handle chat modal
    const chatModal = document.getElementById('chatModal');
    const chatInput = document.getElementById('chatInput');

    if (chatModal && !chatModal.classList.contains('hidden')) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (message) {
                // Send chat message (functionality to be implemented)
                console.log('Chat message:', message);
                // TODO: Send to server/party members
            }
            chatInput.value = '';
            chatModal.classList.add('hidden');
        } else if (e.key === 'Escape') {
            e.preventDefault();
            chatInput.value = '';
            chatModal.classList.add('hidden');
        }
        return;
    }

    // ESC key closes any open feature
    if (e.key === 'Escape') {
        if (gameState.showGameModes || gameState.showLocker || gameState.showSettings || gameState.showShop ||
            gameState.showPass || gameState.showCreateMap || gameState.showFriends) {
            e.preventDefault();
            closeAllPanels();
        }
    }
});
// Shop category switching
window.switchShopCategory = function (category) {
    // Update tabs
    const tabs = document.querySelectorAll('.shop-category-tab');
    tabs.forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update content
    const tanksTab = document.getElementById('tanksTab');
    const musicTab = document.getElementById('musicTab');

    if (category === 'tanks') {
        tanksTab.classList.remove('hidden');
        musicTab.classList.add('hidden');
        loadShopItems('tanks');
    } else if (category === 'music') {
        tanksTab.classList.add('hidden');
        musicTab.classList.remove('hidden');
        loadShopItems('music');
    }
};

// Load shop items
function loadShopItems(category) {
    if (category === 'tanks') {
        loadTankItems();
    } else if (category === 'music') {
        loadMusicItems();
    }
}

// Load tank items
function loadTankItems() {
    const grid = document.getElementById('tanksItemsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // Define tank items (colors, bodies, weapons)
    const tankItems = [
        // Colors
        { id: 'blue', name: 'Blue Tank', type: 'color', price: 0, description: 'Classic blue color', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk1.png' },
        { id: 'camo', name: 'Camo Tank', type: 'color', price: 500, description: 'Camouflage pattern', bodyImage: 'camo_body_halftrack.png', turretImage: 'camo_turret_01_mk1.png' },
        { id: 'desert', name: 'Desert Tank', type: 'color', price: 750, description: 'Desert camouflage', bodyImage: 'desert_body_halftrack.png', turretImage: 'desert_turret_01_mk1.png' },
        { id: 'purple', name: 'Purple Tank', type: 'color', price: 1000, description: 'Royal purple color', bodyImage: 'purple_body_halftrack.png', turretImage: 'purple_turret_01_mk1.png' },
        { id: 'red', name: 'Red Tank', type: 'color', price: 1250, description: 'Aggressive red color', bodyImage: 'red_body_halftrack.png', turretImage: 'red_turret_01_mk1.png' },

        // Bodies
        { id: 'body_halftrack', name: 'Halftrack', type: 'body', price: 0, description: 'Fast and agile', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk1.png' },
        { id: 'body_tracks', name: 'Full Tracks', type: 'body', price: 800, description: 'Heavy and durable', bodyImage: 'body_tracks.png', turretImage: 'blue_turret_01_mk1.png' },

        // Weapons
        { id: 'turret_01_mk1', name: 'Basic Turret', type: 'weapon', price: 0, description: 'Standard firepower', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk1.png' },
        { id: 'turret_01_mk2', name: 'Turret MK2', type: 'weapon', price: 600, description: 'Improved firepower', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk2.png' },
        { id: 'turret_01_mk3', name: 'Turret MK3', type: 'weapon', price: 900, description: 'Advanced firepower', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk3.png' },
        { id: 'turret_01_mk4', name: 'Turret MK4', type: 'weapon', price: 1200, description: 'Elite firepower', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk4.png' },
        { id: 'turret_02_mk1', name: 'Light Cannon', type: 'weapon', price: 700, description: 'Rapid fire cannon', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_02_mk1.png' },
        { id: 'turret_02_mk2', name: 'Heavy Cannon', type: 'weapon', price: 1000, description: 'Powerful shots', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_02_mk2.png' },
        { id: 'turret_02_mk3', name: 'Plasma Cannon', type: 'weapon', price: 1300, description: 'Energy weapon', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_02_mk3.png' },
        { id: 'turret_02_mk4', name: 'Ultimate Cannon', type: 'weapon', price: 1600, description: 'Maximum destruction', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_02_mk4.png' }
    ];

    tankItems.forEach(item => {
        createShopItemCard(item, grid);
    });
}

// Load music items
function loadMusicItems() {
    const grid = document.getElementById('musicItemsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    // Define music items
    const musicItems = [
        { id: 'music_1', name: 'Battle Theme', price: 500, description: 'Epic battle music', icon: '🎵' },
        { id: 'music_2', name: 'Victory March', price: 750, description: 'Triumphant victory theme', icon: '🎶' },
        { id: 'music_3', name: 'Stealth Mode', price: 600, description: 'Sneaky stealth music', icon: '🎼' },
        { id: 'music_4', name: 'Boss Fight', price: 1000, description: 'Intense boss battle', icon: '🎸' },
        { id: 'music_5', name: 'Chill Vibes', price: 400, description: 'Relaxing background music', icon: '🎹' },
        { id: 'music_6', name: 'Electronic Beat', price: 800, description: 'Modern electronic music', icon: '🎧' }
    ];

    musicItems.forEach(item => {
        createShopItemCard(item, grid, 'music');
    });
}

// Create shop item card
function createShopItemCard(item, container, category = 'tank') {
    const card = document.createElement('div');
    const isOwned = checkIfOwned(item);
    card.className = 'shop-item-card' + (isOwned ? ' owned' : '');

    // Preview
    const preview = document.createElement('div');
    preview.className = 'shop-item-preview';

    // Render tank or music icon
    if (category === 'tank' && item.bodyImage && item.turretImage) {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        preview.appendChild(canvas);

        // Render tank on canvas
        renderTankPreview(canvas, item);
    } else if (item.icon) {
        preview.innerHTML = `<div class="shop-item-icon">${item.icon}</div>`;
    }

    // Info
    const info = document.createElement('div');
    info.className = 'shop-item-info';

    const name = document.createElement('div');
    name.className = 'shop-item-name';
    name.textContent = item.name;

    const description = document.createElement('div');
    description.className = 'shop-item-description';
    description.textContent = item.description;

    const price = document.createElement('div');
    price.className = 'shop-item-price';

    if (item.price === 0) {
        price.innerHTML = `<span style="color: #00ff88;">FREE</span>`;
    } else {
        price.innerHTML = `<img src="/assets/images/ui/fortz-coin.png" alt="Fortz"> <span>${item.price}</span>`;
    }

    const buyBtn = document.createElement('button');
    buyBtn.className = 'shop-item-buy-btn';

    if (isOwned) {
        buyBtn.textContent = 'OWNED';
        buyBtn.className += ' owned-btn';
        buyBtn.disabled = true;
    } else if (gameState.fortzCurrency < item.price) {
        buyBtn.textContent = 'INSUFFICIENT FORTZ';
        buyBtn.disabled = true;
    } else {
        buyBtn.textContent = 'BUY NOW';
        buyBtn.onclick = () => buyShopItem(item, category);
    }

    info.appendChild(name);
    info.appendChild(description);
    info.appendChild(price);
    info.appendChild(buyBtn);

    card.appendChild(preview);
    card.appendChild(info);
    container.appendChild(card);
}

// Render tank preview on canvas
function renderTankPreview(canvas, item) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Determine color folder
    let colorFolder = 'blue';
    if (item.type === 'color') {
        colorFolder = item.id;
    }

    // Determine body and turret images
    let bodyPath = item.bodyImage;
    let turretPath = item.turretImage;

    // Fix paths for default body
    if (bodyPath === 'body_tracks.png') {
        bodyPath = 'default/body_tracks.png';
    } else if (!bodyPath.includes('/')) {
        bodyPath = `${colorFolder}/${bodyPath}`;
    }

    if (!turretPath.includes('/')) {
        turretPath = `${colorFolder}/${turretPath}`;
    }

    // Load and draw body
    const bodyImg = new Image();
    bodyImg.onload = () => {
        const scale = 0.4;
        const bodyWidth = bodyImg.width * scale;
        const bodyHeight = bodyImg.height * scale;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(bodyImg, -bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);
        ctx.restore();

        // Load and draw turret
        const turretImg = new Image();
        turretImg.onload = () => {
            const turretWidth = turretImg.width * scale;
            const turretHeight = turretImg.height * scale;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(-Math.PI / 2);
            ctx.drawImage(turretImg, -turretWidth / 2, -turretHeight / 2, turretWidth, turretHeight);
            ctx.restore();
        };
        turretImg.onerror = () => {
            console.warn('Failed to load turret:', turretPath);
        };
        turretImg.src = `/assets/images/tanks/${turretPath}`;
    };
    bodyImg.onerror = () => {
        console.warn('Failed to load body:', bodyPath);
        // Draw fallback
        ctx.fillStyle = 'rgba(0, 247, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00f7ff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚗', centerX, centerY);
    };
    bodyImg.src = `/assets/images/tanks/${bodyPath}`;
}

// Check if item is owned
function checkIfOwned(item) {
    if (item.type === 'color') {
        return gameState.ownedItems.colors.includes(item.id);
    } else if (item.type === 'body') {
        return gameState.ownedItems.bodies.includes(item.id);
    } else if (item.type === 'weapon') {
        return gameState.ownedItems.weapons.includes(item.id);
    }
    return false;
}

// Buy shop item
function buyShopItem(item, category) {
    if (gameState.fortzCurrency < item.price) {
        showNotification('Not enough Fortz!', '#ff6464', 24);
        return;
    }

    // Deduct currency
    gameState.fortzCurrency -= item.price;
    updateFortzDisplay();

    // Add to owned items
    if (item.type === 'color' && !gameState.ownedItems.colors.includes(item.id)) {
        gameState.ownedItems.colors.push(item.id);
    } else if (item.type === 'body' && !gameState.ownedItems.bodies.includes(item.id)) {
        gameState.ownedItems.bodies.push(item.id);
    } else if (item.type === 'weapon' && !gameState.ownedItems.weapons.includes(item.id)) {
        gameState.ownedItems.weapons.push(item.id);
    }

    // Save to storage
    savePlayerProgress();

    // Show notification
    showNotification(`Purchased ${item.name}!`, '#00ff88', 24);

    // Reload shop items to update UI
    if (category === 'music') {
        loadMusicItems();
    } else {
        loadTankItems();
    }
}


// Locker category switching
window.switchLockerCategory = function (category) {
    // Update tabs
    const tabs = document.querySelectorAll('.locker-category-tab');
    tabs.forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update content
    const colorsTab = document.getElementById('colorsTab');
    const bodiesTab = document.getElementById('bodiesTab');
    const weaponsTab = document.getElementById('weaponsTab');

    colorsTab.classList.add('hidden');
    bodiesTab.classList.add('hidden');
    weaponsTab.classList.add('hidden');

    if (category === 'colors') {
        colorsTab.classList.remove('hidden');
        loadLockerItems('colors');
    } else if (category === 'bodies') {
        bodiesTab.classList.remove('hidden');
        loadLockerItems('bodies');
    } else if (category === 'weapons') {
        weaponsTab.classList.remove('hidden');
        loadLockerItems('weapons');
    }
};

// Load locker items
function loadLockerItems(category) {
    let grid, items;

    if (category === 'colors') {
        grid = document.getElementById('colorsItemsGrid');
        items = [
            { id: 'blue', name: 'Blue', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk1.png' },
            { id: 'camo', name: 'Camo', bodyImage: 'camo_body_halftrack.png', turretImage: 'camo_turret_01_mk1.png' },
            { id: 'desert', name: 'Desert', bodyImage: 'desert_body_halftrack.png', turretImage: 'desert_turret_01_mk1.png' },
            { id: 'purple', name: 'Purple', bodyImage: 'purple_body_halftrack.png', turretImage: 'purple_turret_01_mk1.png' },
            { id: 'red', name: 'Red', bodyImage: 'red_body_halftrack.png', turretImage: 'red_turret_01_mk1.png' }
        ];
    } else if (category === 'bodies') {
        grid = document.getElementById('bodiesItemsGrid');
        items = [
            { id: 'body_halftrack', name: 'Halftrack', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk1.png' },
            { id: 'body_tracks', name: 'Full Tracks', bodyImage: 'body_tracks.png', turretImage: 'blue_turret_01_mk1.png' }
        ];
    } else if (category === 'weapons') {
        grid = document.getElementById('weaponsItemsGrid');
        items = [
            { id: 'turret_01_mk1', name: 'Basic Turret', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk1.png' },
            { id: 'turret_01_mk2', name: 'Turret MK2', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk2.png' },
            { id: 'turret_01_mk3', name: 'Turret MK3', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk3.png' },
            { id: 'turret_01_mk4', name: 'Turret MK4', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_01_mk4.png' },
            { id: 'turret_02_mk1', name: 'Light Cannon', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_02_mk1.png' },
            { id: 'turret_02_mk2', name: 'Heavy Cannon', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_02_mk2.png' },
            { id: 'turret_02_mk3', name: 'Plasma Cannon', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_02_mk3.png' },
            { id: 'turret_02_mk4', name: 'Ultimate Cannon', bodyImage: 'blue_body_halftrack.png', turretImage: 'blue_turret_02_mk4.png' }
        ];
    }

    if (!grid) return;
    grid.innerHTML = '';

    items.forEach(item => {
        createLockerItemCard(item, grid, category);
    });
}

// Create locker item card
function createLockerItemCard(item, container, category) {
    const card = document.createElement('div');
    const isOwned = checkIfItemOwned(item, category);
    const isEquipped = checkIfItemEquipped(item, category);

    card.className = 'locker-item-card';
    if (isEquipped) card.className += ' equipped';
    if (!isOwned) card.className += ' locked';

    // Preview
    const preview = document.createElement('div');
    preview.className = 'locker-item-preview';

    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 160;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    preview.appendChild(canvas);

    // Render tank on canvas
    if (isOwned) {
        renderLockerTankPreview(canvas, item, category);
    } else {
        // Show locked icon
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', canvas.width / 2, canvas.height / 2);
    }

    // Info
    const info = document.createElement('div');
    info.className = 'locker-item-info';

    const name = document.createElement('div');
    name.className = 'locker-item-name';
    name.textContent = item.name;

    const status = document.createElement('div');
    status.className = 'locker-item-status';
    if (isEquipped) {
        status.textContent = '✓ Equipped';
    } else if (!isOwned) {
        status.textContent = '🔒 Locked - Purchase in Shop';
    } else {
        status.textContent = 'Click to equip';
    }

    const equipBtn = document.createElement('button');
    equipBtn.className = 'locker-equip-btn';

    if (isEquipped) {
        equipBtn.textContent = 'EQUIPPED';
        equipBtn.disabled = true;
    } else if (!isOwned) {
        equipBtn.textContent = 'LOCKED';
        equipBtn.disabled = true;
    } else {
        equipBtn.textContent = 'EQUIP';
        equipBtn.onclick = () => equipLockerItem(item, category);
    }

    info.appendChild(name);
    info.appendChild(status);
    info.appendChild(equipBtn);

    card.appendChild(preview);
    card.appendChild(info);
    container.appendChild(card);
}

// Check if item is owned
function checkIfItemOwned(item, category) {
    if (category === 'colors') {
        return gameState.ownedItems.colors.includes(item.id);
    } else if (category === 'bodies') {
        return gameState.ownedItems.bodies.includes(item.id);
    } else if (category === 'weapons') {
        return gameState.ownedItems.weapons.includes(item.id);
    }
    return false;
}

// Check if item is equipped
function checkIfItemEquipped(item, category) {
    if (category === 'colors') {
        return gameState.selectedTank.color === item.id;
    } else if (category === 'bodies') {
        return gameState.selectedTank.body === item.id;
    } else if (category === 'weapons') {
        return gameState.selectedTank.weapon === item.id;
    }
    return false;
}

// Equip locker item
function equipLockerItem(item, category) {
    if (category === 'colors') {
        gameState.selectedTank.color = item.id;
        document.getElementById('currentColor').textContent = item.name;
    } else if (category === 'bodies') {
        gameState.selectedTank.body = item.id;
        document.getElementById('currentBody').textContent = item.name;
    } else if (category === 'weapons') {
        gameState.selectedTank.weapon = item.id;
        document.getElementById('currentWeapon').textContent = item.name;
    }

    // Save to storage
    savePlayerProgress();

    // Show notification
    showNotification(`Equipped ${item.name}!`, '#FFD700', 24);

    // Update locker preview
    updateLockerPreview();

    // Reload items to update UI
    loadLockerItems(category);

    // Update party tank preview if it exists
    if (typeof updatePlayerTankPreview === 'function') {
        updatePlayerTankPreview();
    }
}

// Render tank preview in locker
function renderLockerTankPreview(canvas, item, category) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let colorFolder = gameState.selectedTank.color;
    let bodyPath = item.bodyImage;
    let turretPath = item.turretImage;

    // Adjust paths based on category
    if (category === 'colors') {
        colorFolder = item.id;
    }

    if (!bodyPath.includes('/')) {
        if (bodyPath === 'body_tracks.png') {
            bodyPath = 'default/body_tracks.png';
        } else {
            bodyPath = `${colorFolder}/${bodyPath}`;
        }
    }

    if (!turretPath.includes('/')) {
        turretPath = `${colorFolder}/${turretPath}`;
    }

    const bodyImg = new Image();
    bodyImg.onload = () => {
        const scale = 0.4;
        const bodyWidth = bodyImg.width * scale;
        const bodyHeight = bodyImg.height * scale;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(bodyImg, -bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);
        ctx.restore();

        const turretImg = new Image();
        turretImg.onload = () => {
            const turretWidth = turretImg.width * scale;
            const turretHeight = turretImg.height * scale;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(-Math.PI / 2);
            ctx.drawImage(turretImg, -turretWidth / 2, -turretHeight / 2, turretWidth, turretHeight);
            ctx.restore();
        };
        turretImg.src = `/assets/images/tanks/${turretPath}`;
    };
    bodyImg.src = `/assets/images/tanks/${bodyPath}`;
}

// Update locker preview (main loadout display)
function updateLockerPreview() {
    const canvas = document.getElementById('lockerTankPreview');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const colorFolder = gameState.selectedTank.color;
    const bodyName = gameState.selectedTank.body;
    const weaponName = gameState.selectedTank.weapon;

    let bodyPath = `${colorFolder}/${colorFolder}_${bodyName}.png`;
    let turretPath = `${colorFolder}/${colorFolder}_${weaponName}.png`;

    const bodyImg = new Image();
    bodyImg.onload = () => {
        const scale = 0.5;
        const bodyWidth = bodyImg.width * scale;
        const bodyHeight = bodyImg.height * scale;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(bodyImg, -bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);
        ctx.restore();

        const turretImg = new Image();
        turretImg.onload = () => {
            const turretWidth = turretImg.width * scale;
            const turretHeight = turretImg.height * scale;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(-Math.PI / 2);
            ctx.drawImage(turretImg, -turretWidth / 2, -turretHeight / 2, turretWidth, turretHeight);
            ctx.restore();
        };
        turretImg.src = `/assets/images/tanks/${turretPath}`;
    };
    bodyImg.src = `/assets/images/tanks/${bodyPath}`;

    // Update text labels
    const colorNames = { blue: 'Blue', camo: 'Camo', desert: 'Desert', purple: 'Purple', red: 'Red' };
    const bodyNames = { body_halftrack: 'Halftrack', body_tracks: 'Full Tracks' };
    const weaponNames = {
        turret_01_mk1: 'Basic Turret', turret_01_mk2: 'Turret MK2', turret_01_mk3: 'Turret MK3', turret_01_mk4: 'Turret MK4',
        turret_02_mk1: 'Light Cannon', turret_02_mk2: 'Heavy Cannon', turret_02_mk3: 'Plasma Cannon', turret_02_mk4: 'Ultimate Cannon'
    };

    document.getElementById('currentColor').textContent = colorNames[gameState.selectedTank.color] || gameState.selectedTank.color;
    document.getElementById('currentBody').textContent = bodyNames[gameState.selectedTank.body] || gameState.selectedTank.body;
    document.getElementById('currentWeapon').textContent = weaponNames[gameState.selectedTank.weapon] || gameState.selectedTank.weapon;
}