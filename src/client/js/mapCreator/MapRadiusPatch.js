// Map Radius Patch - Make water area 2x bigger
// This file patches the map radius from 2500 to 5000 at runtime

(function() {
    'use strict';
    
    console.log('🌊 Applying map radius patch - making water area 2x bigger...');
    
    // Global map radius override
    window.MAP_RADIUS_OVERRIDE = 5000; // 2x bigger than original 2500
    
    // Function to patch map radius in runtime
    function patchMapRadius() {
        // Override any global constants
        if (typeof window.MAP_RADIUS !== 'undefined') {
            window.MAP_RADIUS = 5000;
        }
        
        // Patch string replacements in functions at runtime
        if (typeof String.prototype.replaceMapRadius === 'undefined') {
            String.prototype.replaceMapRadius = function() {
                return this.replace(/2500/g, '5000');
            };
        }
        
        console.log('✅ Map radius patched: 2500 → 5000 (2x bigger water area)');
    }
    
    // Apply patch immediately
    patchMapRadius();
    
    // Patch the startMapEditor function to ensure the override is applied
    const originalStartMapEditor = window.startMapEditor;
    window.startMapEditor = function() {
        // Apply the patch before starting
        window.MAP_RADIUS_OVERRIDE = 5000;
        
        // Call original function if it exists
        if (originalStartMapEditor) {
            return originalStartMapEditor.apply(this, arguments);
        }
    };
    
    // Patch key functions that use map radius
    setTimeout(function() {
        // Override drawIsometricWater if it exists
        if (typeof window.drawIsometricWater === 'function') {
            const originalDrawWater = window.drawIsometricWater;
            window.drawIsometricWater = function(ctx, camera, viewWidth, viewHeight) {
                // Temporarily replace 2500 with 5000 in the function
                const funcStr = originalDrawWater.toString().replace(/2500/g, '5000');
                try {
                    const patchedFunc = new Function('ctx', 'camera', 'viewWidth', 'viewHeight', 
                        funcStr.substring(funcStr.indexOf('{') + 1, funcStr.lastIndexOf('}'))
                    );
                    return patchedFunc.call(this, ctx, camera, viewWidth, viewHeight);
                } catch (e) {
                    console.warn('Could not patch drawIsometricWater, using original');
                    return originalDrawWater.apply(this, arguments);
                }
            };
        }
        
        // Override drawGroundSamples if it exists
        if (typeof window.drawGroundSamples === 'function') {
            const originalDrawGround = window.drawGroundSamples;
            window.drawGroundSamples = function(ctx, camera, viewWidth, viewHeight) {
                // Temporarily replace 2500 with 5000 in the function
                const funcStr = originalDrawGround.toString().replace(/2500/g, '5000');
                try {
                    const patchedFunc = new Function('ctx', 'camera', 'viewWidth', 'viewHeight', 
                        funcStr.substring(funcStr.indexOf('{') + 1, funcStr.lastIndexOf('}'))
                    );
                    return patchedFunc.call(this, ctx, camera, viewWidth, viewHeight);
                } catch (e) {
                    console.warn('Could not patch drawGroundSamples, using original');
                    return originalDrawGround.apply(this, arguments);
                }
            };
        }
        
        console.log('🌊 Advanced map radius patches applied!');
    }, 1000);
    
})();