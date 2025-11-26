// Created Maps Integration: populate game mode list, selection, and play routing
(function(){
  function getSavedMaps(){
    try { 
      const maps = JSON.parse(localStorage.getItem('thefortz.customMaps') || '[]');
      // Filter out default Battle Arena - only return player-created maps
      return maps.filter(m => m.isUserCreated !== false && m.name !== 'Battle Arena');
    } catch { return []; }
  }
  function getPlayCounts(){
    try { return JSON.parse(localStorage.getItem('thefortz.mapPlays') || '{}'); } catch { return {}; }
  }
  function setPlayCounts(obj){ localStorage.setItem('thefortz.mapPlays', JSON.stringify(obj||{})); }
  function mostPlayedMapId(){
    const maps = getSavedMaps();
    const plays = getPlayCounts();
    let best = null; let bestPlays = -1;
    maps.forEach(m => { const id = String(m.id||''); const p = plays[id] || 0; if (p > bestPlays) { bestPlays=p; best=id; } });
    if (best) return best;
    // fallback newest
    if (maps.length>0) {
      const newest = maps.slice().sort((a,b)=> new Date(b.created) - new Date(a.created))[0];
      return String(newest.id);
    }
    return null;
  }
  function fmtDate(iso){ try { const d=new Date(iso); return d.toLocaleDateString(); } catch { return iso || ''; } }

  function buildMapItem(map){
    const div = document.createElement('div');
    div.className = 'game-mode-item';
    div.dataset.mapId = String(map.id);

    const img = document.createElement('img');
    img.className = 'game-mode-image';
    img.alt = map.name || 'Map';
    if (map.thumbnail) img.src = map.thumbnail; else img.src = '/assets/images/ui/logo.png';

    const info = document.createElement('div');
    info.className = 'game-mode-info';
    const abbr = document.createElement('span'); abbr.className = 'game-mode-abbr'; abbr.textContent = map.name || 'Map';
    const count = document.createElement('span'); count.className = 'game-mode-count'; count.textContent = `${(map.objects||[]).length} Objects`;
    const creator = document.createElement('span'); creator.className = 'game-mode-creator'; creator.textContent = fmtDate(map.created);

    info.appendChild(abbr); info.appendChild(document.createTextNode(' - ')); info.appendChild(count);
    info.appendChild(document.createTextNode(' - ')); info.appendChild(creator);

    div.appendChild(img); div.appendChild(info);

    div.addEventListener('click', () => selectCreatedMap(String(map.id)));
    return div;
  }

  function clearList(el){ while (el.firstChild) el.removeChild(el.firstChild); }

  function populateGameModeList(){
    const list = document.getElementById('gameModeList');
    if (!list) return;
    const maps = getSavedMaps();
    clearList(list);

    if (!maps || maps.length===0) {
      // Show message when no maps exist
      const emptyMsg = document.createElement('div');
      emptyMsg.style.cssText = 'padding: 40px; text-align: center; color: rgba(255,255,255,0.6); font-size: 16px;';
      emptyMsg.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">🗺️</div>
        <div style="font-weight: 600; margin-bottom: 10px;">No Custom Maps Yet</div>
        <div>Create your first map in the "Create Map" section!</div>
      `;
      list.appendChild(emptyMsg);
      return;
    }

    // sort by plays desc, then newest
    const plays = getPlayCounts();
    maps.sort((a,b)=> (plays[String(b.id)]||0)-(plays[String(a.id)]||0) || new Date(b.created)-new Date(a.created));

    maps.forEach(m => list.appendChild(buildMapItem(m)));

    // select default (most played)
    const defaultId = mostPlayedMapId();
    if (defaultId) selectCreatedMap(defaultId);
  }

  function selectCreatedMap(mapId){
    // Skip if already selected
    if (window.selectedCreatedMapId === String(mapId) && window.DOMMapRenderer?.currentMap?.id === String(mapId)) {
      console.log('🗺️ Map already selected:', mapId);
      return;
    }

    window.selectedCreatedMapId = String(mapId);

    // Get the full map data
    const maps = getSavedMaps();
    const selectedMap = maps.find(m => String(m.id) === String(mapId));

    if (!selectedMap) {
      console.error('❌ Map not found:', mapId);
      return;
    }

    console.log('🗺️ Selected map:', selectedMap.name);
    console.log('   - Ground tiles:', selectedMap.groundTiles?.length || 0);
    console.log('   - Buildings:', selectedMap.objects?.length || 0);

    // Store the full map data globally for immediate access
    window.currentSelectedMapData = selectedMap;

    // Also update gameState.selectedMap so quickPlayFFA uses it
    if (window.gameState) {
      window.gameState.selectedMap = String(mapId);
    }

    // highlight selection
    const list = document.getElementById('gameModeList');
    if (!list) return;
    const items = list.querySelectorAll('.game-mode-item');
    items.forEach(it => {
      if (it.dataset.mapId === String(mapId)) it.classList.add('selected'); else it.classList.remove('selected');
    });

    // Clear previous map before loading new one
    if (window.DOMMapRenderer?.lobbyMapContainer) {
      window.DOMMapRenderer.lobbyMapContainer.innerHTML = '';
    }

    // Update DOM map renderer (most efficient for lobby)
    if (window.DOMMapRenderer) {
      window.DOMMapRenderer.currentMap = selectedMap;
      window.DOMMapRenderer.renderToLobby();
      console.log('✅ DOM renderer loaded map:', selectedMap.name);
    }

    // CRITICAL: Immediately load into MapRenderer for game use
    if (window.MapRenderer) {
      window.MapRenderer.loadMap(selectedMap, () => {
        console.log('✅ MapRenderer PRE-LOADED for gameplay:', selectedMap.name);
      });
    }
  }

  // Show loading screen overlay
  function showMapLoadingScreen() {
    let loadingScreen = document.getElementById('mapLoadingScreen');
    if (!loadingScreen) {
      loadingScreen = document.createElement('div');
      loadingScreen.id = 'mapLoadingScreen';
      loadingScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(10px);
      `;
      loadingScreen.innerHTML = `
        <div style="text-align: center;">
          <div style="
            width: 80px;
            height: 80px;
            border: 5px solid rgba(0, 247, 255, 0.2);
            border-top-color: #00f7ff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          "></div>
          <div style="
            color: #00f7ff;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 0 20px rgba(0, 247, 255, 0.5);
          ">Loading Map...</div>
          <div style="
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            margin-top: 10px;
          ">Preparing terrain and buildings</div>
        </div>
      `;

      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);

      document.body.appendChild(loadingScreen);
    }
    loadingScreen.style.display = 'flex';
  }

  // Hide loading screen
  function hideMapLoadingScreen() {
    // No loading screen to hide - instant loading
    return;
  }

  function applyLobbyBackground(){
    try {
      const lobbyCanvas = document.getElementById('lobbyBackground');
      if (!lobbyCanvas || !window.MapRenderer) return;
      const ctx = lobbyCanvas.getContext('2d');
      // DO NOT reload the map here - selectCreatedMap already loaded it
      // Just render the current map that's already loaded in MapRenderer
      if (window.MapRenderer.currentMap) {
        window.MapRenderer.renderLobbyPreview(ctx, lobbyCanvas);
        // overlay subtle vignette for readability
        ctx.fillStyle = 'rgba(10,14,24,0.25)';
        ctx.fillRect(0,0,lobbyCanvas.width,lobbyCanvas.height);
      }
    } catch(e){ console.warn('applyLobbyBackground failed', e); }
  }

  // Helper function to load selected map when game starts
  // This will be called from game.js after quickPlayFFA is defined
  function setupMapForGameStart(){
    // Use gameState.selectedMap if available, otherwise fall back to most played
    let selectedMapId = window.gameState?.selectedMap;
    if (!selectedMapId) {
      selectedMapId = mostPlayedMapId();
      if (selectedMapId && window.gameState) {
        window.gameState.selectedMap = selectedMapId;
      }
    }

    // Only proceed if we have a valid map ID (not null or undefined)
    if (!selectedMapId || selectedMapId === 'null' || selectedMapId === 'undefined') {
      console.log('ℹ️ No player-created maps available, using default terrain');
      return;
    }

    // Show loading screen while map loads
    showMapLoadingScreen();

    // Load the selected map into MapRenderer (DON'T increment play count yet)
    if (window.MapRenderer) {
      const maps = getSavedMaps();
      const selectedMap = maps.find(m => String(m.id) === String(selectedMapId));

      if (selectedMap) {
        window.MapRenderer.loadMap(selectedMap, () => {
          console.log(`🗺️ Map ${selectedMapId} fully loaded for gameplay`);
          // Map is ready, loading screen will be hidden by game start sequence
        });
      } else {
        window.MapRenderer.loadById(selectedMapId);
      }
    }

    // Store the map ID for play count increment after successful connection
    window.pendingMapPlayCount = selectedMapId;
  }

  // Helper to increment play count - called after game successfully connects
  function confirmMapPlay(){
    if (window.pendingMapPlayCount) {
      const mapId = window.pendingMapPlayCount;
      const plays = getPlayCounts();
      plays[String(mapId)] = (plays[String(mapId)] || 0) + 1;
      setPlayCounts(plays);
      console.log(`🎮 Incremented play count for map ${mapId}`);
      window.pendingMapPlayCount = null; // Clear pending count
    }
  }

  // Expose globals
  window.populateGameModeList = populateGameModeList;
  window.selectCreatedMap = selectCreatedMap;
  window.getMostPlayedCreatedMapId = mostPlayedMapId;
  window.applyLobbyBackground = applyLobbyBackground;
  window.setupMapForGameStart = setupMapForGameStart;
  window.confirmMapPlay = confirmMapPlay;
  window.showMapLoadingScreen = showMapLoadingScreen;
  window.hideMapLoadingScreen = hideMapLoadingScreen;

  // Init after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    try {
      if (window.MapRenderer && !window.MapRenderer.initialized) window.MapRenderer.init();
      populateGameModeList();
      // draw lobby background once on load; resize handler can redraw via game.js
      applyLobbyBackground();
    } catch(e){ console.warn('createdMapsIntegration init failed', e); }
  });
})();