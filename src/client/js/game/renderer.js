// Game renderer
const Renderer = {
    canvas: null,
    ctx: null,
    groundTextures: [],
    groundTileSize: 500,
    texturesLoaded: false,

    init() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) return false;

        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = true;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loadGroundTextures();
        
        return true;
    },

    loadGroundTextures() {
        const groundFiles = [
            'water.png', 'WaterBlue.png', 'BlueGrass.png', 'BrownCobblestone.png', 'BrownGrass.png',
            'Goldcobblestone.png', 'GoldenCobblestone.png', 'GrayGround.png',
            'GreenGrass.png', 'Grey Cobblestone.png', 'LightBrownCobblestone.png',
            'LightGreyCobblestone.png', 'LightGreyGround.png', 'LightSand.png',
            'PurpleCobblestone.png', 'RedCobblestone.png', 'Sand.png',
            'WoodenPlanks.png', 'WoodenTile.png', 'YellowGrass.png'
        ];
        let loadedCount = 0;

        groundFiles.forEach(filename => {
            const img = new Image();
            img.src = `/assets/tank/Grounds/${filename}`;
            
            img.onload = () => {
                loadedCount++;
                if (loadedCount === groundFiles.length) {
                    this.texturesLoaded = true;
                }
            };
            
            img.onerror = () => {
                console.warn(`Failed to load ground texture: ${filename}`);
                loadedCount++;
                if (loadedCount === groundFiles.length) {
                    this.texturesLoaded = true;
                }
            };
            
            this.groundTextures.push(img);
        });
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    clear() {
        // Fill with bright blue water background to make sure it's visible
        this.ctx.fillStyle = '#4a9ad8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('🌊 Cleared canvas with blue background');
    },

    drawDefaultTerrain() {
        // Draw sparse grass patches over water background (don't cover everything)
        const tileSize = 120;
        const camera = GameState.camera;
        const viewWidth = this.canvas.width;
        const viewHeight = this.canvas.height;
        
        const startX = Math.floor((camera.x - viewWidth / 2) / tileSize) * tileSize;
        const startY = Math.floor((camera.y - viewHeight / 2) / tileSize) * tileSize;
        const endX = startX + viewWidth + tileSize * 2;
        const endY = startY + viewHeight + tileSize * 2;
        
        // Draw sparse grass islands over water
        for (let x = startX; x < endX; x += tileSize) {
            for (let y = startY; y < endY; y += tileSize) {
                const screenX = x - camera.x + this.canvas.width / 2;
                const screenY = y - camera.y + this.canvas.height / 2;
                
                // Calculate distance from map center for circular boundary
                const distFromCenter = Math.sqrt(x * x + y * y);
                
                // Only draw grass in center area, leave water visible at edges
                if (distFromCenter < 2000) {
                    // Use noise-like pattern to create islands
                    const noiseX = Math.sin(x * 0.001) * Math.cos(y * 0.001);
                    const noiseY = Math.cos(x * 0.001) * Math.sin(y * 0.001);
                    const noise = (noiseX + noiseY) * 0.5;
                    
                    // Only draw grass where noise is positive (creates islands)
                    if (noise > 0.2) {
                        // Draw isometric grass tile
                        this.ctx.fillStyle = 'rgba(60, 120, 80, 0.8)';
                        
                        // Draw isometric diamond shape
                        const tileWidth = tileSize;
                        const tileHeight = 30;
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(screenX, screenY - tileHeight / 2);
                        this.ctx.lineTo(screenX + tileWidth / 2, screenY);
                        this.ctx.lineTo(screenX, screenY + tileHeight / 2);
                        this.ctx.lineTo(screenX - tileWidth / 2, screenY);
                        this.ctx.closePath();
                        this.ctx.fill();
                        
                        // Add grass texture
                        this.ctx.strokeStyle = 'rgba(40, 100, 60, 0.6)';
                        this.ctx.lineWidth = 1;
                        this.ctx.stroke();
                    }
                }
            }
        }
        
        // Draw map boundary circle
        this.ctx.strokeStyle = 'rgba(0, 247, 255, 0.3)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        const screenCenterX = this.canvas.width / 2;
        const screenCenterY = this.canvas.height / 2;
        this.ctx.arc(screenCenterX, screenCenterY, 3750, 0, Math.PI * 2);
        this.ctx.stroke();
    },

    drawWaterBackground() {
        // Use GameState camera if available, otherwise use default camera position
        const camera = (GameState && GameState.camera) ? GameState.camera : { x: 0, y: 0 };
        
        // Add a simple test to make sure this function is being called
        console.log('🌊 Drawing water background at camera:', camera);
        
        const tileWidth = 120;
        const tileHeight = 30;
        const drawHeight = 70;

        // Calculate visible viewport bounds
        const viewLeft = camera.x - this.canvas.width / 2;
        const viewTop = camera.y - this.canvas.height / 2;
        const viewRight = camera.x + this.canvas.width / 2;
        const viewBottom = camera.y + this.canvas.height / 2;

        // Add padding to ensure full coverage
        const paddingX = tileWidth * 4;
        const paddingY = drawHeight * 6;

        // Calculate tile range
        const startCol = Math.floor((viewLeft - paddingX) / tileWidth);
        const endCol = Math.ceil((viewRight + paddingX) / tileWidth);
        const startRow = Math.floor((viewTop - paddingY) / tileHeight);
        const endRow = Math.ceil((viewBottom + paddingY) / tileHeight);

        // Draw water tiles
        let tilesDrawn = 0;
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const isoX = col * tileWidth + (row % 2) * (tileWidth / 2);
                const isoY = row * tileHeight;

                const screenX = isoX - camera.x + this.canvas.width / 2;
                const screenY = isoY - camera.y + this.canvas.height / 2;

                // Draw water tile
                this.drawWaterTile(screenX, screenY, tileWidth, drawHeight);
                tilesDrawn++;
            }
        }
        
        console.log('🌊 Drew', tilesDrawn, 'water tiles');
        
        // Fallback: if no tiles were drawn, fill with solid blue
        if (tilesDrawn === 0) {
            this.ctx.fillStyle = '#4a9ad8';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            console.log('🌊 Drew fallback water background');
        }
    },

    drawWaterTile(x, y, width, height) {
        // Isometric diamond points
        const top = { x: x + width / 2, y: y };
        const right = { x: x + width, y: y + height / 2 };
        const bottom = { x: x + width / 2, y: y + height };
        const left = { x: x, y: y + height / 2 };

        // Enhanced water gradient with vibrant colors
        const gradient = this.ctx.createLinearGradient(left.x, top.y, right.x, bottom.y);
        gradient.addColorStop(0, '#4a9ad8');    // Brighter blue (top-left, lit by sun)
        gradient.addColorStop(0.3, '#3a8ac8');  // Medium blue
        gradient.addColorStop(0.7, '#2a7ab8');  // Darker blue
        gradient.addColorStop(1, '#1a6aa8');    // Deep blue (bottom-right, shadow)

        // Draw the water diamond
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(top.x, top.y);
        this.ctx.lineTo(right.x, right.y);
        this.ctx.lineTo(bottom.x, bottom.y);
        this.ctx.lineTo(left.x, left.y);
        this.ctx.closePath();
        this.ctx.fill();

        // Enhanced border for better definition
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        // Bright highlight on top-left edge (sun reflection)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(top.x, top.y);
        this.ctx.lineTo(left.x, left.y);
        this.ctx.stroke();

        // Secondary highlight (water shimmer)
        this.ctx.strokeStyle = 'rgba(150, 200, 255, 0.5)';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(top.x + 2, top.y + 2);
        this.ctx.lineTo(left.x + 4, left.y);
        this.ctx.stroke();

        // Deep shadow on bottom-right edge
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(right.x, right.y);
        this.ctx.lineTo(bottom.x, bottom.y);
        this.ctx.stroke();

        // Add subtle inner glow for water depth
        this.ctx.save();
        this.ctx.globalAlpha = 0.2;
        const centerX = (left.x + right.x) / 2;
        const centerY = (top.y + bottom.y) / 2;
        const radialGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.4);
        radialGradient.addColorStop(0, 'rgba(120, 200, 255, 0.4)');
        radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = radialGradient;
        this.ctx.fill();
        this.ctx.restore();
    },

    render() {
        this.clear();
        
        // Always draw water background first
        this.drawWaterBackground();
        
        // Use MapRenderer if a map is loaded, otherwise show default terrain
        if (window.MapRenderer && window.MapRenderer.isLoaded) {
            window.MapRenderer.render(this.ctx, GameState.camera);
        } else {
            this.drawDefaultTerrain();
        }
        
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.translate(-GameState.camera.x, -GameState.camera.y);

        // Update particles
        if (window.ParticleSystem) {
            window.ParticleSystem.update(16);
        }

        // Draw powerups first
        if (window.gameState && window.gameState.powerUps) {
            window.gameState.powerUps.forEach(pu => this.drawPowerUp(pu));
        }

        // Draw players
        Object.values(GameState.players).forEach(player => {
            this.drawPlayer(player);
        });

        // Draw bullets
        GameState.bullets.forEach(bullet => {
            this.drawBullet(bullet);
        });

        // Draw particles
        if (window.ParticleSystem) {
            window.ParticleSystem.render(this.ctx, GameState.camera, this.canvas);
        }

        // Draw damage numbers
        if (window.damageNumbers) {
            window.damageNumbers.forEach((dn, i) => {
                dn.y -= 2;
                dn.life -= 0.02;
                
                if (dn.life > 0) {
                    this.ctx.fillStyle = dn.color;
                    this.ctx.globalAlpha = dn.life;
                    this.ctx.font = `bold ${16 + (1 - dn.life) * 8}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(dn.text, dn.x, dn.y);
                    this.ctx.globalAlpha = 1;
                } else {
                    window.damageNumbers.splice(i, 1);
                }
            });
        }

        this.ctx.restore();

        // Draw UI
        this.drawUI();
    },

    drawPowerUp(pu) {
        this.ctx.save();
        this.ctx.translate(pu.x, pu.y);
        
        const time = Date.now() * 0.003;
        this.ctx.scale(1 + Math.sin(time) * 0.1, 1 + Math.sin(time) * 0.1);
        
        const colors = {
            health: '#00ff00',
            shield: '#00ffff',
            ammo: '#ffff00',
            speed: '#ff00ff',
            damage: '#ff6600'
        };
        
        this.ctx.fillStyle = colors[pu.type] || '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    },

    drawPlayer(player) {
        // Initialize animation frame if not exists
        if (!player.animFrame) player.animFrame = 0;
        if (!player.lastAnimUpdate) player.lastAnimUpdate = Date.now();
        
        // Update track animation when moving
        const speed = Math.sqrt((player.vx || 0) ** 2 + (player.vy || 0) ** 2);
        if (speed > 0.1) {
            const now = Date.now();
            if (now - player.lastAnimUpdate > 50) {
                player.animFrame = (player.animFrame + 1) % 4;
                player.lastAnimUpdate = now;
            }
        }

        this.ctx.save();
        this.ctx.translate(player.x, player.y);
        this.ctx.rotate(player.angle || 0);

        // Glow effect for player
        if (player.id === GameState.playerId) {
            this.ctx.shadowColor = '#00f7ff';
            this.ctx.shadowBlur = 20;
        }

        // Draw tank body with gradient
        const bodyGradient = this.ctx.createLinearGradient(-45, -30, 45, 30);
        const playerColor = player.id === GameState.playerId ? '#00f7ff' : '#ff6b6b';
        bodyGradient.addColorStop(0, playerColor);
        bodyGradient.addColorStop(1, player.id === GameState.playerId ? '#0088ff' : '#ff3333');
        
        this.ctx.fillStyle = bodyGradient;
        this.ctx.fillRect(-45, -30, 90, 60);
        
        // Animated tank tracks
        this.ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
        this.ctx.lineWidth = 2;
        
        // Left track
        this.ctx.fillRect(-45, -30, 15, 60);
        this.ctx.strokeRect(-45, -30, 15, 60);
        
        // Right track
        this.ctx.fillRect(30, -30, 15, 60);
        this.ctx.strokeRect(30, -30, 15, 60);
        
        // Track tread marks (animated)
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        this.ctx.lineWidth = 2;
        const trackOffset = (player.animFrame * 15) % 60;
        
        for (let i = -30 + trackOffset; i < 30; i += 15) {
            // Left track treads
            this.ctx.beginPath();
            this.ctx.moveTo(-42, i);
            this.ctx.lineTo(-33, i);
            this.ctx.stroke();
            
            // Right track treads
            this.ctx.beginPath();
            this.ctx.moveTo(33, i);
            this.ctx.lineTo(42, i);
            this.ctx.stroke();
        }

        // Draw turret with rotation
        const turretColor = player.id === GameState.playerId ? '#00d4dd' : '#ff5252';
        const turretGradient = this.ctx.createLinearGradient(-15, -50, 15, 20);
        turretGradient.addColorStop(0, turretColor);
        turretGradient.addColorStop(1, player.id === GameState.playerId ? '#0066aa' : '#cc2222');
        
        this.ctx.fillStyle = turretGradient;
        
        // Turret base
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Turret barrel
        this.ctx.fillRect(-8, -55, 16, 60);
        
        // Barrel highlight
        this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
        this.ctx.fillRect(-6, -55, 12, 8);
        
        // Barrel tip
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(-6, -55, 12, 3);

        // Reset shadow
        this.ctx.shadowBlur = 0;

        this.ctx.restore();
        
        // Draw name tag
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 13px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
        this.ctx.shadowBlur = 4;
        this.ctx.fillText(player.name || 'Tank', player.x, player.y - 70);
        this.ctx.shadowBlur = 0;

        // Draw health bar
        const barWidth = 90;
        const barHeight = 10;
        const healthPercent = (player.health || 100) / 100;
        
        // Background
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(player.x - barWidth/2, player.y - 55, barWidth, barHeight);
        
        // Health gradient
        const healthGradient = this.ctx.createLinearGradient(player.x - barWidth/2, 0, player.x + barWidth/2, 0);
        if (healthPercent > 0.6) {
            healthGradient.addColorStop(0, '#00ff00');
            healthGradient.addColorStop(1, '#44ff44');
        } else if (healthPercent > 0.3) {
            healthGradient.addColorStop(0, '#ffaa00');
            healthGradient.addColorStop(1, '#ffdd44');
        } else {
            healthGradient.addColorStop(0, '#ff3333');
            healthGradient.addColorStop(1, '#ff6666');
        }
        
        this.ctx.fillStyle = healthGradient;
        this.ctx.fillRect(player.x - barWidth/2, player.y - 55, barWidth * healthPercent, barHeight);
        
        // Border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(player.x - barWidth/2, player.y - 55, barWidth, barHeight);

        // Draw level indicator
        if (player.level) {
            this.ctx.fillStyle = '#00f7ff';
            this.ctx.font = 'bold 11px Arial';
            this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
            this.ctx.shadowBlur = 3;
            this.ctx.fillText(`LvL ${player.level}`, player.x, player.y - 40);
            this.ctx.shadowBlur = 0;
        }
    },

    drawBullet(bullet) {
        this.ctx.save();
        
        // Trail effect
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(bullet.x - bullet.vx, bullet.y - bullet.vy);
        this.ctx.lineTo(bullet.x, bullet.y);
        this.ctx.stroke();
        
        // Bullet glow
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(bullet.x, bullet.y, CONFIG.BULLET.SIZE + 1, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Core
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        this.ctx.arc(bullet.x, bullet.y, CONFIG.BULLET.SIZE - 1, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    },

    drawUI() {
        const player = GameState.getPlayer();
        if (!player) return;

        const padding = 20;
        const lineHeight = 25;
        
        // Health panel background
        this.ctx.fillStyle = 'rgba(0, 20, 40, 0.7)';
        this.ctx.fillRect(padding - 5, padding - 5, 250, lineHeight * 4 + 10);
        this.ctx.strokeStyle = '#00f7ff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(padding - 5, padding - 5, 250, lineHeight * 4 + 10);

        // Draw health
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`❤️ Health: ${Math.ceil(player.health || 100)}`, padding, padding + lineHeight);
        
        // Draw score
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillText(`⭐ Score: ${player.score || 0}`, padding, padding + lineHeight * 2);
        
        // Draw kills
        this.ctx.fillStyle = '#ff6666';
        this.ctx.fillText(`💥 Kills: ${player.kills || 0}`, padding, padding + lineHeight * 3);
        
        // Draw ammo
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillText(`🔫 Ammo: ${player.ammo || '∞'}`, padding, padding + lineHeight * 4);

        // Minimap in corner
        this.drawMinimap();
        
        // FPS counter
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(`FPS: ${Math.round(1000/16)}`, this.canvas.width - 20, 20);
    },

    drawMinimap() {
        const minimapX = this.canvas.width - 170;
        const minimapY = 20;
        const minimapSize = 150;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
        
        // Border
        this.ctx.strokeStyle = '#00f7ff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
        
        // Scale
        const scale = minimapSize / 7500;
        
        // Draw all players on minimap
        Object.values(GameState.players).forEach(p => {
            const px = minimapX + p.x * scale;
            const py = minimapY + p.y * scale;
            
            this.ctx.fillStyle = p.id === GameState.playerId ? '#00ff00' : '#ff3333';
            this.ctx.beginPath();
            this.ctx.arc(px, py, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
};

window.Renderer = Renderer;
