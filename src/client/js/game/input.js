// Input handling
const InputHandler = {
    keys: {},
    mouse: { x: 0, y: 0, down: false },
    lastShootTime: 0,
    shootCooldown: 500, // 500ms cooldown

    init() {
        document.addEventListener('keydown', (e) => {
            if (!this.shouldHandleInput()) return;
            this.onKeyDown(e);
        });
        document.addEventListener('keyup', (e) => {
            if (!this.shouldHandleInput()) return;
            this.onKeyUp(e);
        });
        document.addEventListener('mousemove', (e) => {
            if (!this.shouldHandleInput()) return;
            this.onMouseMove(e);
        });
        document.addEventListener('mousedown', (e) => {
            if (!this.shouldHandleInput()) return;
            this.onMouseDown(e);
        });
        document.addEventListener('mouseup', (e) => {
            if (!this.shouldHandleInput()) return;
            this.onMouseUp(e);
        });
    },

    shouldHandleInput() {
        // Handle input when game is active (check both state objects)
        const gameStateObj = window.gameState || window.GameState;
        if (!gameStateObj) return false;
        
        // Check if we're in game (not in lobby)
        const isInLobby = gameStateObj.isInLobby;
        const gameCanvas = document.getElementById('gameCanvas');
        const gameMapArea = document.getElementById('gameMapArea');
        
        // Allow input if game canvas is visible or we're not in lobby
        return !isInLobby || (gameCanvas && !gameCanvas.classList.contains('hidden')) || (gameMapArea && !gameMapArea.classList.contains('hidden'));
    },

    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        if (window.gameState) {
            window.gameState.keys[e.key.toLowerCase()] = true;
        }
    },

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
        if (window.gameState) {
            window.gameState.keys[e.key.toLowerCase()] = false;
        }
    },

    update() {
        // Update keys
    },

    onMouseMove(e) {
        if (!window.gameState) return;

        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();

        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        // Update cooldown cursor position
        this.updateCooldownCursor(e.clientX, e.clientY);

        // Calculate mouse angle relative to player position
        const player = window.gameState.players[window.gameState.playerId];
        if (player) {
            // Convert screen mouse position to world coordinates
            const zoom = window.gameState.camera.zoom || 1;
            
            // Calculate mouse position relative to screen center
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const mouseOffsetX = (this.mouse.x - centerX) / zoom;
            const mouseOffsetY = (this.mouse.y - centerY) / zoom;
            
            // World mouse position relative to player (who is at screen center)
            const worldMouseX = player.x + mouseOffsetX;
            const worldMouseY = player.y + mouseOffsetY;

            // Calculate angle from player to mouse position
            this.mouse.angle = Math.atan2(worldMouseY - player.y, worldMouseX - player.x);
        }

        window.gameState.mouse = { ...this.mouse };
    },

    onMouseDown(e) {
        if (!window.gameState) return;

        this.mouse.down = true;

        if (e.button === 0) { // Left click
            if (this.canShoot()) {
                this.shoot();
            } else {
                // Show cooldown cursor if trying to shoot during cooldown
                this.showCooldownCursor();
            }
        }
    },

    onMouseUp(e) {
        this.mouse.down = false;
    },

    shoot() {
        if (!window.gameState) return;

        const player = window.gameState.players[window.gameState.playerId];
        if (!player) return;

        const now = Date.now();
        
        // Check cooldown
        if (now - this.lastShootTime < this.shootCooldown) {
            // Show cooldown cursor if not already showing
            this.showCooldownCursor();
            return;
        }

        this.lastShootTime = now;
        window.gameState.lastShootTime = now;

        // Hide cooldown cursor
        this.hideCooldownCursor();

        const bullet = {
            id: `bullet_${now}_${Math.random()}`,
            x: player.x,
            y: player.y,
            vx: Math.cos(window.gameState.mouse.angle) * 10, // bullet speed
            vy: Math.sin(window.gameState.mouse.angle) * 10,
            playerId: window.gameState.playerId
        };

        window.gameState.bullets.push(bullet);

        // Send to server if available
        if (window.socket && window.socket.readyState === WebSocket.OPEN) {
            window.socket.send(JSON.stringify({
                type: 'shoot',
                bullet: bullet
            }));
        }

        // Start cooldown timer
        this.startCooldownTimer();
    },

    updateCooldownCursor(clientX, clientY) {
        const cooldownCursor = document.getElementById('cooldownCursor');
        if (cooldownCursor) {
            cooldownCursor.style.left = clientX + 'px';
            cooldownCursor.style.top = clientY + 'px';
        }
    },

    showCooldownCursor() {
        const cooldownCursor = document.getElementById('cooldownCursor');
        const gameCanvas = document.getElementById('gameCanvas');
        
        if (cooldownCursor && gameCanvas) {
            cooldownCursor.classList.remove('hidden');
            gameCanvas.classList.add('game-canvas-cooldown');
        }
    },

    hideCooldownCursor() {
        const cooldownCursor = document.getElementById('cooldownCursor');
        const gameCanvas = document.getElementById('gameCanvas');
        
        if (cooldownCursor && gameCanvas) {
            cooldownCursor.classList.add('hidden');
            gameCanvas.classList.remove('game-canvas-cooldown');
        }
    },

    startCooldownTimer() {
        // Show cooldown cursor immediately after shooting
        this.showCooldownCursor();
        
        // Hide it after cooldown period
        setTimeout(() => {
            this.hideCooldownCursor();
        }, this.shootCooldown);
    },

    canShoot() {
        const now = Date.now();
        return (now - this.lastShootTime) >= this.shootCooldown;
    },

    update() {
        if (!window.gameState) return;

        const player = window.gameState.players[window.gameState.playerId];
        if (!player) return;

        // Check cooldown status and update cursor accordingly
        if (!this.canShoot() && !document.getElementById('cooldownCursor').classList.contains('hidden')) {
            // Keep showing cooldown cursor
        } else if (this.canShoot() && !document.getElementById('cooldownCursor').classList.contains('hidden')) {
            // Hide cooldown cursor when cooldown is over
            this.hideCooldownCursor();
        }

        // Movement
        let moveX = 0;
        let moveY = 0;

        if (window.gameState.keys['w']) moveY -= 1;
        if (window.gameState.keys['s']) moveY += 1;
        if (window.gameState.keys['a']) moveX -= 1;
        if (window.gameState.keys['d']) moveX += 1;

        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707;
            moveY *= 0.707;
        }

        // Simple movement with speed
        const speed = 3;
        player.x += moveX * speed;
        player.y += moveY * speed;

        // Update angle to face mouse
        if (window.gameState.mouse.angle !== undefined) {
            player.angle = window.gameState.mouse.angle;
        }

        // Keep player in bounds
        player.x = Math.max(50, Math.min(window.gameState.gameWidth - 50, player.x));
        player.y = Math.max(50, Math.min(window.gameState.gameHeight - 50, player.y));

        // Send position to server if available
        if (window.socket && window.socket.readyState === WebSocket.OPEN) {
            window.socket.send(JSON.stringify({
                type: 'move',
                x: player.x,
                y: player.y,
                angle: player.angle
            }));
        }
    }
};

window.InputHandler = InputHandler;