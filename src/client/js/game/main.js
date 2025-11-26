// Main game loop
const Game = {
    lastTime: 0,
    animationId: null,

    init() {
        console.log('Initializing game...');
        
        // Initialize systems
        if (!Renderer.init()) {
            console.error('Failed to initialize renderer');
            return;
        }

        // InputHandler.init(); // Disabled - using original game.js input system

        // Hide loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
            }, 500);
        }

        console.log('Game initialized successfully');
    },

    start() {
        console.log('Starting game...');
        
        // Hide lobby, show game
        document.getElementById('lobbyScreen').classList.add('hidden');
        document.getElementById('ui').classList.remove('hidden');

        GameState.isInLobby = false;

        // Connect to server
        Network.connect('ffa');

        // Start game loop
        this.lastTime = performance.now();
        this.loop();
    },

    loop(currentTime = 0) {
        this.animationId = requestAnimationFrame((time) => this.loop(time));

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update
        this.update(deltaTime);

        // Render
        Renderer.render();
    },

    update(deltaTime) {
        // Update input
        // InputHandler.update(); // Disabled - using original game.js input system

        // Update camera
        GameState.updateCamera();

        // Update bullets
        GameState.bullets.forEach(bullet => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
        });

        // Remove out of bounds bullets
        GameState.bullets = GameState.bullets.filter(bullet => {
            return bullet.x >= 0 && bullet.x <= GameState.gameWidth &&
                   bullet.y >= 0 && bullet.y <= GameState.gameHeight;
        });
    },

    stop() {
        console.log('Stopping game...');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        Network.disconnect();

        // Show lobby, hide game
        document.getElementById('lobbyScreen').classList.remove('hidden');
        document.getElementById('ui').classList.add('hidden');

        GameState.isInLobby = true;
        GameState.reset();
    }
};

// Global function for joining game
window.joinGame = function() {
    Game.start();
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Game.init());
} else {
    Game.init();
}

window.Game = Game;
