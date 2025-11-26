# 🎯 How to Use the Performance Optimizations

## Quick Start

The performance optimizations are **already loaded** and ready to use! Here's how to integrate them into your game.

## 1. Fix Shop Lag (Immediate)

### Replace Old Shop Rendering

Find in `game.js` or `shop.js`:
```javascript
// OLD CODE (causes lag)
function renderShop() {
    requestAnimationFrame(renderShop);
    // ... heavy rendering ...
}
```

Replace with:
```javascript
// NEW CODE (optimized)
function openShop() {
    gameState.showShop = true;
    OptimizedShop.start(); // Use optimized renderer
}

function closeShop() {
    gameState.showShop = false;
    OptimizedShop.stop();
}
```

## 2. Optimize Particles (Recommended)

### Replace Particle Arrays

Find in `game.js`:
```javascript
// OLD CODE
let explosionParticles = [];

function createExplosion(x, y, size) {
    for (let i = 0; i < 30; i++) {
        explosionParticles.push({...});
    }
}

function updateExplosions() {
    explosionParticles = explosionParticles.filter(p => {
        // update logic
    });
}
```

Replace with:
```javascript
// NEW CODE (uses object pooling)
function createExplosion(x, y, size) {
    OptimizedParticles.spawnExplosion(x, y, size);
}

function updateExplosions() {
    OptimizedParticles.update(); // Updates all particle types
}

function drawExplosions() {
    OptimizedParticles.render(ctx); // Renders all particle types
}
```

## 3. Add Quality Settings (Optional)

### Check Quality Before Expensive Operations

```javascript
// Only render particles if enabled
if (PerformanceConfig.isEnabled('particles')) {
    OptimizedParticles.render(ctx);
}

// Only render shadows if enabled
if (PerformanceConfig.isEnabled('shadows')) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
}

// Respect particle limits
const maxParticles = PerformanceConfig.getLimit('maxParticles');
if (currentParticles < maxParticles) {
    spawnParticle();
}
```

## 4. Monitor Performance (Debugging)

### Display FPS Counter

Add to your render function:
```javascript
function render() {
    // ... your rendering code ...
    
    // Show FPS in top-left corner
    if (OptimizedGameLoop) {
        OptimizedGameLoop.displayStats(ctx, 10, 10);
    }
}
```

### Check Performance in Console

```javascript
// Get current FPS
console.log('FPS:', OptimizedGameLoop.getStats().fps);

// Get particle count
console.log('Particles:', OptimizedParticles.getCount());

// Get current quality
console.log('Quality:', PerformanceConfig.quality);

// Get average FPS
console.log('Avg FPS:', PerformanceConfig.getAverageFPS());
```

## 5. Add Quality Settings to UI (Advanced)

### Create Settings Menu

```javascript
function createQualitySettings() {
    const settingsHTML = `
        <div class="quality-settings">
            <h3>Graphics Quality</h3>
            <button onclick="setQuality('low')">Low (30 FPS)</button>
            <button onclick="setQuality('medium')">Medium (45 FPS)</button>
            <button onclick="setQuality('high')">High (60 FPS)</button>
            
            <h3>Features</h3>
            <label>
                <input type="checkbox" id="particles" 
                       ${PerformanceConfig.isEnabled('particles') ? 'checked' : ''}>
                Particles
            </label>
            <label>
                <input type="checkbox" id="shadows"
                       ${PerformanceConfig.isEnabled('shadows') ? 'checked' : ''}>
                Shadows
            </label>
            <label>
                <input type="checkbox" id="autoAdjust"
                       ${PerformanceConfig.autoAdjust ? 'checked' : ''}>
                Auto-Adjust Quality
            </label>
        </div>
    `;
    
    document.getElementById('settingsPanel').innerHTML = settingsHTML;
}

function setQuality(quality) {
    PerformanceConfig.setQuality(quality);
    alert(`Quality set to ${quality}`);
}

// Toggle features
document.getElementById('particles').addEventListener('change', (e) => {
    PerformanceConfig.toggleFeature('particles');
});
```

## Example Integration

### Complete Example: Optimized Game Loop

```javascript
// Initialize optimized systems
function initGame() {
    // Initialize performance systems
    OptimizedParticles.init();
    PerformanceConfig.init();
    
    // Setup game loop
    OptimizedGameLoop.init(updateGame, renderGame);
    OptimizedGameLoop.start();
}

// Update function (60 times per second)
function updateGame(deltaTime) {
    // Update player
    updatePlayer(deltaTime);
    
    // Update particles
    OptimizedParticles.update();
    
    // Record FPS for auto-adjustment
    const stats = OptimizedGameLoop.getStats();
    PerformanceConfig.recordFPS(stats.fps);
}

// Render function (60 FPS or throttled based on performance)
function renderGame(deltaTime) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game
    drawBackground();
    drawPlayers();
    
    // Draw particles (if enabled)
    if (PerformanceConfig.isEnabled('particles')) {
        OptimizedParticles.render(ctx);
    }
    
    // Draw UI
    drawUI();
    
    // Show FPS (debug mode)
    if (debugMode) {
        OptimizedGameLoop.displayStats(ctx, 10, 10);
    }
}

// Start game
initGame();
```

## Testing Your Changes

### 1. Test Shop Performance
1. Open shop
2. Check FPS in console: `OptimizedGameLoop.getStats().fps`
3. Should be smooth 60 FPS (shop renders at 30 FPS internally)

### 2. Test Particle Performance
1. Create many explosions
2. Check particle count: `OptimizedParticles.getCount()`
3. FPS should remain stable

### 3. Test Quality Adjustment
1. Set quality to low: `PerformanceConfig.setQuality('low')`
2. Verify particles are disabled
3. Set back to high: `PerformanceConfig.setQuality('high')`

## Common Issues

### Shop Still Lags
**Solution**: Make sure you're calling `OptimizedShop.start()` instead of the old shop renderer

### Particles Not Showing
**Solution**: Check if particles are enabled: `PerformanceConfig.isEnabled('particles')`

### FPS Still Low
**Solution**: 
1. Check quality: `PerformanceConfig.quality`
2. Enable auto-adjust: `PerformanceConfig.autoAdjust = true`
3. Reduce particle limits manually

## Performance Tips

### 1. Limit Draw Calls
```javascript
// BAD: Draw each item separately
items.forEach(item => {
    ctx.fillRect(item.x, item.y, 10, 10);
});

// GOOD: Batch similar items
ctx.fillStyle = 'red';
items.forEach(item => {
    ctx.fillRect(item.x, item.y, 10, 10);
});
```

### 2. Use Offscreen Canvas for Static Content
```javascript
// Cache static background
const bgCanvas = document.createElement('canvas');
const bgCtx = bgCanvas.getContext('2d');
// Draw background once
drawBackground(bgCtx);

// In render loop, just copy it
ctx.drawImage(bgCanvas, 0, 0);
```

### 3. Throttle Expensive Operations
```javascript
// Use throttle for network updates
const sendUpdate = PerformanceOptimizer.throttle(() => {
    socket.send(JSON.stringify(playerData));
}, 33); // Max 30 updates per second
```

## Summary

✅ **Shop optimized** - Use `OptimizedShop.start()`
✅ **Particles optimized** - Use `OptimizedParticles`
✅ **Quality settings** - Use `PerformanceConfig`
✅ **Performance monitoring** - Use `OptimizedGameLoop`

**Your game should now run much smoother!** 🚀

For more details, see `PERFORMANCE_OPTIMIZATIONS.md`
