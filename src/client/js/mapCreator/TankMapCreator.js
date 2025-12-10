// Tank Map Creator
class TankMapCreator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isActive = false;
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    init() {
        console.log('🚗 TankMapCreator initialized');
    }

    start(mapName) {
        console.log('🚗 Starting tank map creator for:', mapName);
        this.setupCanvas();
        this.render();
    }

    setupCanvas() {
        this.canvas = document.getElementById('mapCreatorCanvas');
        if (!this.canvas) {
            console.error('❌ Canvas not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Add event listeners
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        console.log('✅ Tank canvas setup complete');
    }

    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();
        
        // Draw UI
        this.drawUI();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50 * this.zoom;
        const startX = this.offsetX % gridSize;
        const startY = this.offsetY % gridSize;
        
        for (let x = startX; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = startY; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawUI() {
        // Draw title
        this.ctx.fillStyle = '#00f7ff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('TANK MAP CREATOR', 20, 40);
        
        // Draw instructions
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#ccc';
        this.ctx.fillText('Click to place objects • Mouse wheel to zoom', 20, 70);
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        console.log('🖱️ Click at:', x, y);
        
        // Draw a test object
        this.ctx.fillStyle = '#ff6600';
        this.ctx.fillRect(x - 10, y - 10, 20, 20);
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom *= delta;
        this.zoom = Math.max(0.1, Math.min(5, this.zoom));
        this.render();
    }
}

// Export
window.TankMapCreator = TankMapCreator;