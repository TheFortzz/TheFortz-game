/**
 * AssetFallbackManager - Asset Loading with Fallback Support
 * 
 * This module provides asset loading capabilities with automatic fallback
 * to default assets when loading fails. Supports pattern-based fallbacks
 * for different asset types.
 * 
 * **Validates: Requirements 1.1**
 * 
 * @module state/AssetFallbackManager
 */

// ============================================================================
// ASSET FALLBACK MANAGER CLASS
// ============================================================================

/**
 * AssetFallbackManager class that handles asset loading with fallback support.
 * 
 * Provides:
 * - Pattern-based fallback registration
 * - Automatic fallback on loading failures
 * - Loading status tracking
 * - Support for images and audio assets
 */
export class AssetFallbackManager {
  /**
   * Creates a new AssetFallbackManager instance.
   */
  constructor() {
    // Registry for fallback patterns
    this._fallbackRegistry = new Map();
    
    // Cache for loaded assets
    this._assetCache = new Map();
    
    // Loading status tracking
    this._loadingStatus = new Map();
    
    // Default fallback assets
    this._registerDefaultFallbacks();
  }

  /**
   * Loads an asset with fallback support.
   * 
   * Attempts to load the asset from the specified path. If loading fails,
   * searches for a matching fallback pattern and loads the fallback asset.
   * 
   * **Validates: Requirements 1.1**
   * 
   * @param {string} assetPath - Path to the asset to load
   * @param {string} assetType - Type of asset ('image' or 'audio')
   * @returns {Promise<{success: boolean, asset?: any, fallbackUsed?: boolean, error?: string}>} Load result
   */
  async loadAsset(assetPath, assetType) {
    // Check cache first
    if (this._assetCache.has(assetPath)) {
      return {
        success: true,
        asset: this._assetCache.get(assetPath),
        fallbackUsed: false,
      };
    }

    // Check if already loading
    if (this._loadingStatus.has(assetPath)) {
      return this._loadingStatus.get(assetPath);
    }

    // Create loading promise
    const loadingPromise = this._loadAssetInternal(assetPath, assetType);
    this._loadingStatus.set(assetPath, loadingPromise);

    try {
      const result = await loadingPromise;
      
      // Cache successful loads
      if (result.success && result.asset) {
        this._assetCache.set(assetPath, result.asset);
      }
      
      return result;
    } finally {
      // Clean up loading status
      this._loadingStatus.delete(assetPath);
    }
  }

  /**
   * Registers a fallback pattern for asset types.
   * 
   * **Validates: Requirements 1.1**
   * 
   * @param {string} pattern - Pattern to match against asset paths (regex string)
   * @param {string} fallbackPath - Path to fallback asset
   * @param {string} assetType - Type of asset ('image' or 'audio')
   */
  registerFallback(pattern, fallbackPath, assetType) {
    if (typeof pattern !== 'string' || pattern.length === 0) {
      throw new Error('Pattern must be a non-empty string');
    }
    
    if (typeof fallbackPath !== 'string' || fallbackPath.length === 0) {
      throw new Error('Fallback path must be a non-empty string');
    }
    
    if (!['image', 'audio'].includes(assetType)) {
      throw new Error('Asset type must be "image" or "audio"');
    }

    const key = `${assetType}:${pattern}`;
    this._fallbackRegistry.set(key, {
      pattern: new RegExp(pattern),
      fallbackPath,
      assetType,
    });
  }

  /**
   * Clears the asset cache.
   */
  clearCache() {
    this._assetCache.clear();
  }

  /**
   * Gets the current cache size.
   * 
   * @returns {number} Number of cached assets
   */
  getCacheSize() {
    return this._assetCache.size;
  }

  /**
   * Checks if an asset is cached.
   * 
   * @param {string} assetPath - Path to check
   * @returns {boolean} True if asset is cached
   */
  isCached(assetPath) {
    return this._assetCache.has(assetPath);
  }

  /**
   * Gets loading status for an asset.
   * 
   * @param {string} assetPath - Path to check
   * @returns {boolean} True if asset is currently loading
   */
  isLoading(assetPath) {
    return this._loadingStatus.has(assetPath);
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Internal asset loading with fallback logic.
   * 
   * @private
   * @param {string} assetPath - Path to the asset
   * @param {string} assetType - Type of asset
   * @returns {Promise<{success: boolean, asset?: any, fallbackUsed?: boolean, error?: string}>} Load result
   */
  async _loadAssetInternal(assetPath, assetType) {
    try {
      // Attempt to load the primary asset
      const asset = await this._loadAssetByType(assetPath, assetType);
      
      return {
        success: true,
        asset,
        fallbackUsed: false,
      };
    } catch (primaryError) {
      console.warn(`[AssetFallbackManager] Failed to load ${assetType} from ${assetPath}: ${primaryError.message}`);
      
      // Try to find a fallback
      const fallback = this._findFallback(assetPath, assetType);
      
      if (!fallback) {
        return {
          success: false,
          error: `No fallback found for ${assetType}: ${assetPath}`,
        };
      }

      try {
        // Load the fallback asset
        const fallbackAsset = await this._loadAssetByType(fallback.fallbackPath, assetType);
        
        console.warn(`[AssetFallbackManager] Using fallback ${fallback.fallbackPath} for ${assetPath}`);
        
        return {
          success: true,
          asset: fallbackAsset,
          fallbackUsed: true,
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: `Failed to load fallback ${fallback.fallbackPath}: ${fallbackError.message}`,
        };
      }
    }
  }

  /**
   * Loads an asset based on its type.
   * 
   * @private
   * @param {string} assetPath - Path to the asset
   * @param {string} assetType - Type of asset
   * @returns {Promise<any>} Loaded asset
   */
  async _loadAssetByType(assetPath, assetType) {
    switch (assetType) {
      case 'image':
        return this._loadImage(assetPath);
      
      case 'audio':
        return this._loadAudio(assetPath);
      
      default:
        throw new Error(`Unsupported asset type: ${assetType}`);
    }
  }

  /**
   * Loads an image asset.
   * 
   * @private
   * @param {string} imagePath - Path to the image
   * @returns {Promise<HTMLImageElement>} Loaded image
   */
  _loadImage(imagePath) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${imagePath}`));
      
      img.src = imagePath;
    });
  }

  /**
   * Loads an audio asset.
   * 
   * @private
   * @param {string} audioPath - Path to the audio
   * @returns {Promise<HTMLAudioElement>} Loaded audio
   */
  _loadAudio(audioPath) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = () => reject(new Error(`Failed to load audio: ${audioPath}`));
      
      audio.src = audioPath;
      audio.load();
    });
  }

  /**
   * Finds a fallback for the given asset path and type.
   * 
   * @private
   * @param {string} assetPath - Path to match against
   * @param {string} assetType - Type of asset
   * @returns {Object|null} Fallback configuration or null
   */
  _findFallback(assetPath, assetType) {
    for (const [key, fallback] of this._fallbackRegistry) {
      if (key.startsWith(`${assetType}:`) && fallback.pattern.test(assetPath)) {
        return fallback;
      }
    }
    
    return null;
  }

  /**
   * Registers default fallback patterns.
   * 
   * @private
   */
  _registerDefaultFallbacks() {
    // Tank body fallbacks
    this.registerFallback('tank.*\\.png$', 'assets/tank/default-body.png', 'image');
    
    // Weapon fallbacks
    this.registerFallback('weapon.*\\.png$', 'assets/tank/default-weapon.png', 'image');
    
    // Audio fallbacks
    this.registerFallback('.*\\.(mp3|wav|ogg)$', 'assets/Music/silence.mp3', 'audio');
    
    // General image fallbacks
    this.registerFallback('.*\\.png$', 'assets/images/missing.png', 'image');
    this.registerFallback('.*\\.(jpg|jpeg)$', 'assets/images/missing.png', 'image');
  }
}

export default AssetFallbackManager;