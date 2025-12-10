/**
 * RenderSystem - Centralized rendering system for all game visuals
 * Handles canvas management, rendering coordination, and all drawing operations
 */

export default class RenderSystem {
    constructor(gameState, canvas, ctx, minimapCanvas, minimapCtx) {
        this.gameState = gameState;
        this.canvas = canvas;
        this.ctx = ctx;
        this.minimapCanvas = minimapCanvas;
        this.minimapCtx = minimapCtx;
        
        // Constants
        this.TANK_VISUAL_SIZE = 428;
        this.GUN_SIZE = 1503;
        
        // State
        this.wallHitAnimations = [];
        this.notifications = [];
        this.damageNumbers = [];
        this.hitMarkers = [];
        
        // Dependencies (will be injected)
        this.particleSystem = null;
        this.imageLoader = null;
        this.tankImages = {};
        this.weaponImages = {};
        this.imagesLoaded = false;
        this.spriteAnimations = { tanks: {}, weapons: {} };
    }
    
    /**
     * Set dependencies after construction
     */
    setDependencies(particleSystem, imageLoader, tankImages, weaponImages, imagesLoaded, spriteAnimations) {
        this.particleSystem = particleSystem;
        this.imageLoader = imageLoader;
        this.tankImages = tankImages;
        this.weaponImages = weaponImages;
        this.imagesLoaded = imagesLoaded;
        this.spriteAnimations = spriteAnimations;
    }
    
    /**
     * Resize canvas to window dimensions
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    /**
     * Main render function - coordinates all rendering
     */
    render() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Clear canvas with bright blue water background
        ctx.fillStyle = '#4a9ad8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Save context for camera transform
        ctx.save();

        // Apply camera transformation to center the player tank
        const zoom = this.gameState.camera.zoom || 1;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Get player position
        const player = Object.values(this.gameState.players).find(p => p.id === this.gameState.playerId);
        
        if (player) {
            // Center the player tank on screen
            ctx.translate(centerX, centerY);
            ctx.scale(zoom, zoom);
            ctx.translate(-player.x, -player.y);
        } else {
            // Fallback if no player found
            ctx.translate(centerX, centerY);
            ctx.scale(zoom, zoom);
            ctx.translate(-this.gameState.camera.x, -this.gameState.camera.y);
        }

        // Only render the created map - no default backgrounds
        if (window.MapRenderer && window.MapRenderer.currentMap) {
            // Render map (ground tiles and buildings) - map provides its own ground
            window.MapRenderer.render(ctx, this.gameState, canvas);
        }

        // Draw AI tanks from map
        this.drawAITanks();

        // Draw player tank only
        this.drawPlayers();
        
        // Render particle effects
        if (this.particleSystem) {
            this.particleSystem.render();
        }

        // Restore context
        ctx.restore();
    }
    
    /**
     * Render lobby background
     */
    renderLobbyBackground() {
        // Only render full map on tank canvas
        const vehicleType = window.currentLobbyVehicleType || this.gameState.selectedVehicleType || 'tank';
        if (vehicleType !== 'tank') return;
        
        const lobbyCanvas = document.getElementById('tankLobbyBackground');
        if (!lobbyCanvas) {
            console.warn('❌ Tank lobby background canvas not found in renderLobbyBackground');
            return;
        }

        const ctx = lobbyCanvas.getContext('2d');

        // Set canvas size to full screen
        lobbyCanvas.width = window.innerWidth;
        lobbyCanvas.height = window.innerHeight;

        // Fill with dark background first
        ctx.fillStyle = '#0a1a2a';
        ctx.fillRect(0, 0, lobbyCanvas.width, lobbyCanvas.height);

        // Only render created map - NO WATER
        if (window.MapRenderer && window.MapRenderer.currentMap) {
            // Create a mock game state for rendering with centered camera
            const mockGameState = {
                camera: { 
                    x: -lobbyCanvas.width / 2, 
                    y: -lobbyCanvas.height / 2 
                }
            };
            
            // Render the created map
            window.MapRenderer.render(ctx, mockGameState, lobbyCanvas);
            console.log('✅ Tank lobby created map rendered');
        } else {
            // No map available - just show dark background (no water)
            console.log('⚠️ No created map available for tank lobby');
        }
    }
    
    /**
     * Draw AI tanks that were placed in the map creator
     */
    drawAITanks() {
        if (!this.gameState.aiTanks || this.gameState.aiTanks.length === 0) return;
        if (!this.imagesLoaded) return;
        
        const ctx = this.ctx;
        
        this.gameState.aiTanks.forEach(ai => {
            if (ai.health <= 0) return;
            
            ctx.save();
            
            // Get tank images based on AI color
            const aiColor = ai.color || 'red';
            const tankImg = this.tankImages[aiColor]?.['body_halftrack'];
            const weaponImg = this.weaponImages[aiColor]?.['turret_01_mk1'];
            
            // Draw shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(ai.x + 5, ai.y + 5, 45, 30, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw tank body
            ctx.translate(ai.x, ai.y);
            ctx.rotate(ai.angle + Math.PI / 2);
            
            // Apply engine pulse animation
            const pulseScale = 1 + (ai.enginePulse || 0);
            ctx.scale(pulseScale, pulseScale);
            
            if (tankImg && tankImg.complete && tankImg.naturalWidth > 0) {
                const scale = this.TANK_VISUAL_SIZE / Math.max(tankImg.width * 2, tankImg.height);
                ctx.drawImage(
                    tankImg,
                    -tankImg.width * scale / 2,
                    -tankImg.height * scale / 2,
                    tankImg.width * scale,
                    tankImg.height * scale
                );
            } else {
                // Fallback: draw simple tank shape
                ctx.fillStyle = this.getTankColorHex(aiColor);
                ctx.fillRect(-30, -40, 60, 80);
                ctx.fillStyle = '#333';
                ctx.fillRect(-35, -35, 10, 70);
                ctx.fillRect(25, -35, 10, 70);
            }
            
            // Reset rotation for turret
            ctx.scale(1/pulseScale, 1/pulseScale);
            ctx.rotate(-(ai.angle + Math.PI / 2));
            
            // Draw turret
            ctx.rotate(ai.turretAngle + Math.PI / 2);
            
            if (weaponImg && weaponImg.complete && weaponImg.naturalWidth > 0) {
                const weaponScale = (this.TANK_VISUAL_SIZE * 4.32) / Math.max(weaponImg.width, weaponImg.height);
                ctx.drawImage(
                    weaponImg,
                    -weaponImg.width * weaponScale / 2,
                    -weaponImg.height * weaponScale / 2,
                    weaponImg.width * weaponScale,
                    weaponImg.height * weaponScale
                );
            } else {
                // Fallback: draw simple turret
                ctx.fillStyle = this.darkenColor(this.getTankColorHex(aiColor), 20);
                ctx.beginPath();
                ctx.arc(0, 0, 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#444';
                ctx.fillRect(-5, -50, 10, 35);
            }
            
            ctx.restore();
            
            // Draw AI name tag
            ctx.save();
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(ai.x - 40, ai.y - 70, 80, 20);
            ctx.fillStyle = '#ff6b6b';
            ctx.fillText('🤖 ' + ai.name, ai.x, ai.y - 55);
            ctx.restore();
            
            // Draw health bar
            if (ai.health < ai.maxHealth) {
                const barWidth = 60;
                const barHeight = 6;
                const healthPercent = ai.health / ai.maxHealth;
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(ai.x - barWidth/2, ai.y - 85, barWidth, barHeight);
                
                ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#f44336';
                ctx.fillRect(ai.x - barWidth/2, ai.y - 85, barWidth * healthPercent, barHeight);
            }
        });
    }
    
    /**
     * Draw players
     */
    drawPlayers() {
        if (!this.imagesLoaded) return;

        const player = this.gameState.players[this.gameState.playerId];
        if (!player) return;

        const playerTankConfig = player.selectedTank || this.gameState.selectedTank;
        const { tankImg, weaponImg } = this.getCurrentTankImages(playerTankConfig);

        if (!tankImg || !weaponImg || !tankImg.complete || !weaponImg.complete) return;

        // Import Tank class dynamically
        const Tank = window.Tank;
        if (!Tank) return;

        // Create Tank instance for rendering
        const tank = new Tank(playerTankConfig);
        tank.visualSize = this.TANK_VISUAL_SIZE;

        // Use smooth position
        const renderX = player.smoothX !== undefined ? player.smoothX : player.x;
        const renderY = player.smoothY !== undefined ? player.smoothY : player.y;

        // Tank body rotation
        const currentRotation = player.currentRotation || 0;
        
        // Draw weapon angle
        const weaponAngle = player.smoothGunAngle !== undefined ? player.smoothGunAngle : (player.angle || 0);

        // Get sprite animations
        const tankAssetKey = tank.getTankAssetKey();
        const tankAnimKey = `${player.id}_${tankAssetKey}`;
        const tankAnim = this.spriteAnimations.tanks[tankAnimKey];
        
        const weaponAssetKey = tank.getWeaponAssetKey();
        const weaponAnimKey = `${player.id}_${weaponAssetKey}`;
        let weaponAnim = this.spriteAnimations.weapons[weaponAnimKey];
        
        // Initialize weapon animation if it doesn't exist
        if (!weaponAnim) {
            weaponAnim = this.initSpriteAnimation('weapons', player.id, weaponAssetKey);
            weaponAnim.isPlaying = false;
            weaponAnim.loop = false;
            weaponAnim.currentFrame = 0;
        }

        // Render tank using Tank class
        tank.render(this.ctx, { tankImg, weaponImg }, {
            x: renderX,
            y: renderY,
            bodyRotation: currentRotation,
            weaponAngle: weaponAngle,
            scale: 1,
            tankAnimation: tankAnim,
            weaponAnimation: weaponAnim
        });
    }
    
    /**
     * Get current tank images based on player selection
     */
    getCurrentTankImages(playerTank, forLobby = false) {
        if (this.imageLoader) {
            return this.imageLoader.getCurrentTankImages(playerTank, forLobby);
        }
        return { tankImg: null, weaponImg: null };
    }
    
    /**
     * Initialize sprite animation
     */
    initSpriteAnimation(type, playerId, assetKey) {
        const key = `${playerId}_${assetKey}`;
        if (!this.spriteAnimations[type][key]) {
            const numFrames = type === 'tanks' ? 2 : 8;

            this.spriteAnimations[type][key] = {
                currentFrame: 0,
                lastFrameTime: 0,
                frameDuration: type === 'weapons' ? 10 : 80,
                numFrames: numFrames,
                frameWidth: 128,
                frameHeight: 128,
                isPlaying: type === 'tanks',
                loop: type === 'tanks'
            };
        }
        return this.spriteAnimations[type][key];
    }
    
    /**
     * Helper to get hex color for AI tank
     */
    getTankColorHex(color) {
        const colors = {
            'blue': '#2196F3',
            'red': '#f44336',
            'camo': '#4CAF50',
            'desert': '#D2691E',
            'purple': '#9C27B0'
        };
        return colors[color] || colors.red;
    }
    
    /**
     * Darken a color by a percentage
     */
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
    
    /**
     * Lighten a color by a percentage
     */
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
    
    /**
     * Update and draw notifications
     */
    updateAndDrawNotifications() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        ctx.save();
        this.notifications = this.notifications.filter(n => {
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
    
    /**
     * Add notification
     */
    showNotification(text, color = '#FFD700', size = 32) {
        this.notifications.push({
            text,
            color,
            y: 200,
            life: 1,
            decay: 0.01,
            size: size
        });
    }
}
