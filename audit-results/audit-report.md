# JavaScript-HTML Connection Audit Report

*Generated on 12/8/2025, 12:31:24 PM*

## Executive Summary

- **Total Issues**: 430
- **Critical**: 0
- **Warnings**: 42
- **Info**: 388

---

## 1. Orphaned Functions ⚠️

**27 function(s)** reference HTML elements that don't exist.

### Missing Element: `<dynamic>`

Referenced by 27 location(s):

- **Function**: `anonymous`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 4291
  - **Method**: `getElementById`

- **Function**: `anonymous`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 4294
  - **Method**: `getElementById`

- **Function**: `updateVolume`
  - **File**: `src/client/js/settings.js`
  - **Line**: 31
  - **Method**: `getElementById`

- **Function**: `anonymous`
  - **File**: `src/client/js/settings.js`
  - **Line**: 52
  - **Method**: `getElementById`

- **Function**: `anonymous`
  - **File**: `src/client/js/scrollButtons.js`
  - **Line**: 9
  - **Method**: `getElementById`

- **Function**: `cancelMapCreation`
  - **File**: `src/client/js/missingHandlers.js`
  - **Line**: 145
  - **Method**: `getElementById`

- **Function**: `createMap`
  - **File**: `src/client/js/missingHandlers.js`
  - **Line**: 168
  - **Method**: `getElementById`

- **Function**: `openMapCreator`
  - **File**: `src/client/js/missingHandlers.js`
  - **Line**: 229
  - **Method**: `getElementById`

- **Function**: `closeMapCreator`
  - **File**: `src/client/js/missingHandlers.js`
  - **Line**: 245
  - **Method**: `getElementById`

- **Function**: `switchTab`
  - **File**: `src/client/js/missingHandlers.js`
  - **Line**: 300
  - **Method**: `getElementById`

- **Function**: `switchTab`
  - **File**: `src/client/js/missingHandlers.js`
  - **Line**: 306
  - **Method**: `getElementById`

- **Function**: `switchChampionsTab`
  - **File**: `src/client/js/missingHandlers.js`
  - **Line**: 363
  - **Method**: `getElementById`

- **Function**: `switchChampionsTab`
  - **File**: `src/client/js/missingHandlers.js`
  - **Line**: 368
  - **Method**: `getElementById`

- **Function**: `switchShopTab`
  - **File**: `src/client/js/missingHandlers.js`
  - **Line**: 414
  - **Method**: `getElementById`

- **Function**: `openModal`
  - **File**: `src/client/js/missingHandlers.js`
  - **Line**: 422
  - **Method**: `getElementById`

- **Function**: `closeModal`
  - **File**: `src/client/js/missingHandlers.js`
  - **Line**: 429
  - **Method**: `getElementById`

- **Function**: `scrollShopItems`
  - **File**: `src/client/js/missingHandlers.js`
  - **Line**: 622
  - **Method**: `getElementById`

- **Function**: `selectVehicleType`
  - **File**: `src/client/js/game.js`
  - **Line**: 318
  - **Method**: `getElementById`

- **Function**: `switchChampionsTab`
  - **File**: `src/client/js/game.js`
  - **Line**: 399
  - **Method**: `getElementById`

- **Function**: `anonymous`
  - **File**: `src/client/js/ui/LobbyUI.js`
  - **Line**: 380
  - **Method**: `getElementById`

- **Function**: `anonymous`
  - **File**: `src/client/js/ui/LobbyUI.js`
  - **Line**: 712
  - **Method**: `getElementById`

- **Function**: `anonymous`
  - **File**: `src/client/js/ui/LobbyUI.js`
  - **Line**: 742
  - **Method**: `getElementById`

- **Function**: `showAuthError`
  - **File**: `src/client/js/ui/Auth.js`
  - **Line**: 6
  - **Method**: `getElementById`

- **Function**: `anonymous`
  - **File**: `src/client/js/systems/InputSystem.js`
  - **Line**: 109
  - **Method**: `getElementById`

- **Function**: `global`
  - **File**: `src/client/js/assets/ImageLoader.js`
  - **Line**: 438
  - **Method**: `getElementById`

- **Function**: `global`
  - **File**: `src/client/js/assets/ImageLoader.js`
  - **Line**: 490
  - **Method**: `getElementById`

- **Function**: `global`
  - **File**: `src/client/js/assets/ImageLoader.js`
  - **Line**: 524
  - **Method**: `getElementById`

---

## 3. Unused Functions ℹ️

**388 function(s)** are defined but never called.

### File: `src/client/js/weaponSystem.js`

- `initPlayerWeapon` (line 183)
- `createBullets` (line 210)
- `startCharge` (line 271)
- `getChargeProgress` (line 283)
- `switchWeapon` (line 295)
- `getCurrentWeapon` (line 308)
- `getUnlockedWeapons` (line 315)
- `updateBullet` (line 322)

### File: `src/client/js/gameIntegration.js`

- `handleBulletHit` (line 79)
- `handleTankDestruction` (line 146)
- `handlePowerUpCollection` (line 170)
- `handleTerrainHit` (line 206)
- `applyCameraShake` (line 305)
- `getWeatherEffects` (line 317)
- `handlePlayerShoot` (line 339)
- `handlePlayerMovement` (line 366)

### File: `src/client/js/visualPolish.js`

- `renderMuzzleFlashes` (line 301)

### File: `src/client/js/utils.js`

- `randomInt` (line 26)

### File: `src/client/js/tournament-system.js`

- `registerPlayer` (line 366)
- `getActiveTournaments` (line 1171)
- `getPlayerTournaments` (line 1176)
- `rounds` (line 56)
- `unregisterPlayer` (line 422)
- `getTournament` (line 1163)
- `getAllTournaments` (line 1167)
- `getSeasonData` (line 1206)

### File: `src/client/js/tournamentSystem.js`

- `reportMatchResult` (line 212)

### File: `src/client/js/miniGameSystem.js`

- `getLeaderboard` (line 346)
- `startGame` (line 102)
- `updateSession` (line 171)
- `getAllPlayerStats` (line 341)
- `getDailyChallenge` (line 369)

### File: `src/client/js/assets/ImageLoader.js`

- `constructor` (line 12)
- `getLoadingProgress` (line 409)
- `loadImageWithFallback` (line 115)
- `loadJetImage` (line 306)
- `loadRaceImage` (line 318)
- `loadAsteroidImages` (line 330)
- `createAsteroidPlaceholder` (line 340)
- `verifyDefaultTank` (line 397)
- `createFallbackImage` (line 557)
- `batchLoadImages` (line 582)

### File: `src/client/js/terrainSystem.js`

- `getTerrainEffect` (line 344)
- `applyTerrainEffects` (line 365)
- `generateBiomeMap` (line 385)

### File: `src/client/js/tankCreatmap.js`

- `backToObjects` (line 2341)
- `clearAllObjects` (line 2437)
- `drawIsometricTile` (line 3308)
- `syncPreviewAITanks` (line 4158)
- `publishMap` (line 4344)
- `getMostPlayedMap` (line 4420)
- `incrementMapPlays` (line 4429)
- `drawIsometricGrid` (line 4446)
- `renderParallelogramTerrain` (line 4610)
- `drawGroundIsometricTile` (line 5099)
- `drawSubtleIsometricGrid` (line 5113)
- `renderHexTerrainForEditor` (line 5160)
- `easeOutCubic` (line 5297)
- `zoomIn` (line 5405)
- `zoomOut` (line 5437)
- `editMap` (line 5565)
- `analyzeMap` (line 5654)

### File: `src/client/js/mapGenerator.js`

- `deleteMap` (line 344)
- `generateMap` (line 93)

### File: `src/client/js/spectatorSystem.js`

- `enableSpectatorMode` (line 59)
- `disableSpectatorMode` (line 76)
- `setCameraMode` (line 83)
- `nextPlayer` (line 104)
- `previousPlayer` (line 116)
- `selectPlayer` (line 128)
- `updateAutoDirector` (line 138)
- `getCameraTarget` (line 217)
- `getCameraSettings` (line 244)
- `renderSpectatorUI` (line 293)

### File: `src/client/js/performanceMonitor.js`

- `toggleOverlay` (line 210)
- `setEntityCount` (line 95)
- `setParticleCount` (line 100)
- `setDrawCalls` (line 105)
- `setNetworkLatency` (line 110)
- `renderOverlay` (line 115)
- `getReport` (line 185)
- `isPerformanceGood` (line 195)
- `getPerformanceGrade` (line 200)

### File: `src/client/js/skillTreeSystem.js`

- `addSkillPoints` (line 255)
- `upgradeSkill` (line 261)
- `getEffects` (line 347)
- `getSkillTree` (line 353)
- `resetSkills` (line 410)

### File: `src/client/js/seasonalEventSystem.js`

- `startEvent` (line 97)
- `joinEvent` (line 121)
- `getActiveEvents` (line 212)
- `endEvent` (line 254)
- `getTimeRemaining` (line 269)

### File: `src/client/js/screenEffects.js`

- `setVignette` (line 76)
- `renderPostEffects` (line 131)
- `hit` (line 234)
- `death` (line 246)
- `speedBoost` (line 259)
- `normal` (line 264)

### File: `src/client/js/replaySystem.js`

- `startRecording` (line 24)
- `recordEvent` (line 117)
- `startPlayback` (line 177)
- `updatePlayback` (line 200)
- `pausePlayback` (line 271)
- `resumePlayback` (line 279)
- `seekTo` (line 288)
- `setSpeed` (line 302)
- `getReplayList` (line 316)
- `deleteReplay` (line 327)
- `loadFromStorage` (line 345)
- `exportReplay` (line 360)
- `importReplay` (line 372)

### File: `src/client/js/rankingSystem.js`

- `updateAfterMatch` (line 58)
- `getRankInfo` (line 131)
- `resetSeason` (line 229)

### File: `src/client/js/randomMapLoader.js`

- `getPlayerCreatedMaps` (line 7)

### File: `src/client/js/battlePassSystem.js`

- `claimReward` (line 205)
- `addXP` (line 144)
- `purchasePremium` (line 173)
- `getAllRewards` (line 254)
- `newSeason` (line 269)

### File: `src/client/js/questSystem.js`

- `getActiveQuests` (line 283)

### File: `src/client/js/advancedPowerUps.js`

- `getActivePowerUps` (line 416)
- `spawnPowerUp` (line 318)
- `applyPowerUp` (line 369)
- `clearPlayerPowerUps` (line 421)
- `getPowerUpData` (line 426)

### File: `src/client/js/power-up-system.js`

- `forcePowerUpSpawn` (line 1049)
- `removePowerUp` (line 1053)
- `setMaxPowerUps` (line 1063)
- `setRarePowerUpsEnabled` (line 1071)

### File: `src/client/js/playerProgressionSystem.js`

- `prestige` (line 128)
- `trackWeaponKill` (line 164)
- `getPlayerSummary` (line 246)
- `renderProgressionUI` (line 274)

### File: `src/client/js/bug-fixes.js`

- `debounce` (line 234)
- `throttle` (line 247)
- `safeJSONParse` (line 191)

### File: `src/client/js/performance.js`

- `requestAnimationFrameThrottled` (line 33)
- `throttledCallback` (line 37)
- `cacheRender` (line 56)
- `batchDOMUpdates` (line 79)
- `lazyLoadImage` (line 86)
- `measurePerformance` (line 124)
- `getFPS` (line 149)

### File: `src/client/js/performance-config.js`

- `recordFPS` (line 116)
- `getLimit` (line 155)
- `toggleFeature` (line 160)

### File: `src/client/js/templates/BaseSystem.js`

- `isEnabled` (line 59)
- `enable` (line 44)
- `disable` (line 51)
- `isInitialized` (line 67)

### File: `src/client/js/particles-optimized.js`

- `spawnExplosion` (line 109)
- `spawnSmoke` (line 135)
- `getCount` (line 263)

### File: `src/client/js/notificationSystem.js`

- `dismiss` (line 128)
- `clearAll` (line 136)
- `showAchievement` (line 210)
- `showLevelUp` (line 221)
- `showKill` (line 232)
- `showReward` (line 243)
- `showQuestComplete` (line 254)
- `showError` (line 265)
- `showInfo` (line 269)
- `showWarning` (line 273)

### File: `src/client/js/newPowerUps.js`

- `callMissileStrike` (line 302)

### File: `src/client/js/createdMapsIntegration.js`

- `hideMapLoadingScreen` (line 219)
- `setupMapForGameStart` (line 242)

### File: `src/client/js/missingHandlers.js`

- `closeMapCreator` (line 236)
- `openGameModesScreen` (line 280)
- `switchTab` (line 288)
- `switchShopTab` (line 406)
- `openAiBotConfigModal` (line 436)
- `closeAiBotConfigModal` (line 440)
- `openChatModal` (line 444)
- `closeChatModal` (line 448)
- `openFriendsModal` (line 452)
- `openGameModeModal` (line 460)

### File: `src/client/js/matchmakingSystem.js`

- `joinQueue` (line 40)
- `leaveQueue` (line 72)
- `getQueueStatus` (line 167)
- `getMatch` (line 196)
- `endMatch` (line 201)

### File: `src/client/js/mapRenderer.js`

- `_setPlayCounts` (line 431)
- `drawAnimatedWaterTile` (line 451)

### File: `src/client/js/map-renderer.js`

- `renderDefaultTerrain` (line 389)
- `renderWaterBackground` (line 450)
- `isBuildingVisible` (line 682)
- `getMapBounds` (line 757)
- `getCurrentMap` (line 777)
- `setRenderDistance` (line 790)
- `setCollisionsEnabled` (line 794)

### File: `src/client/js/lootBoxSystem.js`

- `openCrate` (line 159)
- `purchaseCrate` (line 246)
- `getPlayerCrates` (line 272)
- `getOpenHistory` (line 278)
- `getCrateInfo` (line 284)
- `getAllCrateTypes` (line 289)

### File: `src/client/js/image-fallback.js`

- `getLevelBadge` (line 29)
- `hasFailed` (line 111)
- `createPlaceholder` (line 151)

### File: `src/client/js/hexTerrainSystem.js`

- `renderMinimap` (line 347)

### File: `src/client/js/gameplay-enhancements.js`

- `addKillFeed` (line 121)
- `addComboKill` (line 187)
- `applyScreenShakeToContext` (line 263)

### File: `src/client/js/entities/Tank.js`

- `getStats` (line 203)
- `getConfig` (line 20)
- `setConfig` (line 32)
- `getTankAssetKey` (line 42)
- `getWeaponAssetKey` (line 50)
- `isValidConfig` (line 239)
- `getDefaultConfig` (line 253)

### File: `src/client/js/game-loop-optimized.js`

- `displayStats` (line 130)

### File: `src/client/js/core/ModuleManager.js`

- `getSystem` (line 85)
- `getGameStateManager` (line 93)
- `getGameLoop` (line 101)

### File: `src/client/js/game-integration.js`

- `getAllSystems` (line 858)
- `setSettings` (line 866)
- `getSettings` (line 871)
- `enableSystem` (line 876)
- `unlisten` (line 965)

### File: `src/client/js/game-improvements.js`

- `updateDeltaTime` (line 29)
- `bufferInput` (line 40)
- `processInputBuffer` (line 53)
- `updateSpatialGrid` (line 65)
- `getNearbyEntities` (line 82)
- `shouldSendNetworkUpdate` (line 115)
- `interpolate` (line 124)
- `predictPosition` (line 129)
- `isInViewport` (line 137)
- `circleCollision` (line 159)
- `rectCollision` (line 165)
- `angleBetween` (line 175)
- `lerpAngle` (line 187)

### File: `src/client/js/entities/Bullet.js`

- `deactivate` (line 157)
- `deserialize` (line 218)
- `getSpeed` (line 165)
- `getDirection` (line 173)
- `isExpired` (line 189)
- `createFromPlayer` (line 228)

### File: `src/client/js/enhancedSoundSystem.js`

- `setVolume` (line 104)
- `playEngineSound` (line 157)

### File: `src/client/js/enhanced-audio.js`

- `loadDefaultSounds` (line 95)
- `generateFallbackSounds` (line 182)
- `generateFallbackMusic` (line 302)
- `generateFallbackAmbient` (line 340)
- `fadeOutMusic` (line 434)
- `fadeInMusic` (line 448)
- `updateMusicState` (line 458)
- `setSfxVolume` (line 500)
- `setAmbientVolume` (line 505)

### File: `src/client/js/advancedSound.js`

- `playMusic` (line 196)
- `updateListener` (line 307)
- `preloadAll` (line 319)

### File: `src/client/js/endlessDirector.js`

- `onKill` (line 71)
- `onDamage` (line 91)
- `getScoreMultiplier` (line 98)

### File: `src/client/js/dynamic-weather.js`

- `setWeatherType` (line 706)
- `getFrictionModifier` (line 716)
- `getWindEffect` (line 721)
- `setParticleQuality` (line 737)
- `setWeatherChangeInterval` (line 741)
- `onWeatherChange` (line 746)

### File: `src/client/js/domMapRenderer.js`

- `renderToGame` (line 134)
- `startCameraSync` (line 142)
- `hide` (line 312)
- `clearMap` (line 341)
- `clearGameMap` (line 359)

### File: `src/client/js/dailyChallenges.js`

- `getChallengeProgress` (line 175)

### File: `src/client/js/customizationSystem.js`

- `getLoadout` (line 370)
- `getItemsByType` (line 376)
- `getItemsByRarity` (line 392)
- `getUnlockedItems` (line 404)

### File: `src/client/js/crazygames-integration.js`

- `showRewardedAd` (line 140)
- `saveToCloud` (line 307)
- `loadFromCloud` (line 329)

### File: `src/client/js/clanSystem.js`

- `createClan` (line 95)
- `invitePlayer` (line 150)
- `acceptInvite` (line 186)
- `leaveClan` (line 213)
- `kickMember` (line 235)
- `promoteMember` (line 269)
- `addClanXP` (line 301)
- `getClanPerks` (line 342)
- `getClan` (line 368)
- `getPlayerClan` (line 373)
- `searchClans` (line 380)
- `getClanLeaderboard` (line 388)

### File: `src/client/js/cameraSystem.js`

- `setRotation` (line 129)
- `addShake` (line 134)
- `addTrauma` (line 159)
- `applyTransform` (line 193)
- `resetTransform` (line 211)
- `screenToWorld` (line 216)
- `worldToScreen` (line 229)
- `isInView` (line 242)
- `panTo` (line 254)
- `zoomTo` (line 279)
- `followPlayer` (line 303)
- `spectator` (line 309)
- `sniper` (line 319)

### File: `src/client/js/animation-manager.js`

- `createTankBodyAnimation` (line 13)
- `updateMovementAnimation` (line 28)
- `getAnimation` (line 53)
- `clearPlayerAnimations` (line 66)

### File: `src/client/js/analyticsSystem.js`

- `startSession` (line 48)
- `endSession` (line 76)
- `trackKill` (line 133)
- `trackDeath` (line 142)
- `trackPowerUpCollected` (line 150)
- `trackWeaponFired` (line 158)
- `trackAchievement` (line 167)
- `trackPurchase` (line 175)
- `getSessionStats` (line 185)
- `getEventSummary` (line 201)
- `getHeatmapData` (line 215)
- `getAggregateStats` (line 251)
- `clearAllData` (line 296)

### File: `src/client/js/ai-opponents.js`

- `removeAITank` (line 1042)
- `getAITank` (line 1046)
- `damageAITank` (line 1064)
- `findPath` (line 1109)
- `createNode` (line 1122)
- `execute` (line 1127)

### File: `src/client/js/advancedVisualEffects.js`

- `addMotionTrail` (line 35)
- `addLightRay` (line 47)
- `addImpactWave` (line 57)
- `addEnergyField` (line 69)
- `applyHeatWave` (line 273)

### File: `src/client/js/advancedParticles.js`

- `createImpact` (line 238)
- `createEngineSmoke` (line 265)
- `createPowerUpEffect` (line 285)
- `createHealEffect` (line 309)
- `createShieldEffect` (line 332)
- `createDamageNumber` (line 354)
- `createLevelUpEffect` (line 401)
- `createEmitter` (line 425)
- `getParticleCount` (line 467)

### File: `src/client/js/advancedLighting.js`

- `addLight` (line 37)
- `removeLight` (line 44)
- `muzzleFlash` (line 200)

### File: `src/client/js/advancedCombat.js`

- `repairComponent` (line 188)

### File: `src/client/js/entities/Player.js`

- `takeDamage` (line 127)
- `addKill` (line 169)
- `heal` (line 146)
- `respawn` (line 157)
- `getPosition` (line 178)
- `getTankConfig` (line 196)
- `setTankConfig` (line 204)

### File: `src/client/js/advancedAI.js`

- `removeBot` (line 395)
- `getBot` (line 417)
- `addMixedBots` (line 427)
- `getBotData` (line 437)

### File: `src/client/js/advanced-graphics.js`

- `createTrail` (line 137)
- `updateTrail` (line 152)

### File: `src/client/js/achievementSystem.js`

- `updateStats` (line 222)
- `getPlayerAchievements` (line 280)
- `getByCategory` (line 292)
- `getByRarity` (line 297)
- `awardAchievement` (line 302)
- `getCompletionPercentage` (line 316)

### File: `src/client/js/ui/LobbyUI.js`

- `stopVehicleHexagonRendering` (line 494)

### File: `src/client/js/systems/NetworkSystem.js`

- `handleDisconnection` (line 132)
- `unregisterMessageHandler` (line 635)
- `sendQueuedMessages` (line 711)
- `getConnectionStatus` (line 743)
- `sendPlayerShoot` (line 752)
- `sendCollectPowerUp` (line 763)
- `sendRequestShapeSpawn` (line 772)
- `sendUpdateFortzCurrency` (line 780)
- `sendChangeGameMode` (line 788)

### File: `src/client/js/systems/InputSystem.js`

- `handleTouchStart` (line 508)
- `handleTouchEnd` (line 521)
- `handleTouchMove` (line 530)
- `isKeyPressed` (line 543)
- `getMouseState` (line 551)
- `getTouchState` (line 559)
- `getInputState` (line 567)
- `isMoving` (line 609)
- `getGameInputFlags` (line 618)

### File: `src/client/js/game/network.js`

- `sendMovement` (line 70)

### File: `src/client/js/game/gameManager.js`

- `addDamage` (line 10)
- `addPowerUp` (line 102)
- `health` (line 124)
- `shield` (line 125)
- `ammo` (line 126)

### File: `src/client/js/examples/modular-game-example.js`

- `createCanvas` (line 79)

### File: `src/client/js/core/GameState.js`

- `updateLockerState` (line 52)

---

## 4. Non-Functional Interactive Elements ⚠️

**15 interactive element(s)** have no event handlers or JavaScript references.

1. **BUTTON**
   - **HTML Line**: 513
   - **Reason**: No event handler or JavaScript reference found

2. **BUTTON**
   - **HTML Line**: 519
   - **Reason**: No event handler or JavaScript reference found

3. **BUTTON**
   - **HTML Line**: 526
   - **Reason**: No event handler or JavaScript reference found

4. **BUTTON**
   - **HTML Line**: 532
   - **Reason**: No event handler or JavaScript reference found

5. **BUTTON**
   - **HTML Line**: 539
   - **Reason**: No event handler or JavaScript reference found

6. **BUTTON**
   - **HTML Line**: 545
   - **Reason**: No event handler or JavaScript reference found

7. **BUTTON**
   - **HTML Line**: 552
   - **Reason**: No event handler or JavaScript reference found

8. **BUTTON**
   - **HTML Line**: 558
   - **Reason**: No event handler or JavaScript reference found

9. **BUTTON**
   - **HTML Line**: 1155
   - **Reason**: No event handler or JavaScript reference found

10. **BUTTON**
   - **HTML Line**: 1192
   - **Reason**: No event handler or JavaScript reference found

11. **INPUT**
   - **HTML Line**: 380
   - **Reason**: No event handler or JavaScript reference found

12. **INPUT**
   - **HTML Line**: 381
   - **Reason**: No event handler or JavaScript reference found

13. **INPUT**
   - **HTML Line**: 382
   - **Reason**: No event handler or JavaScript reference found

14. **INPUT**
   - **HTML Line**: 383
   - **Reason**: No event handler or JavaScript reference found

15. **INPUT**
   - **HTML Line**: 384
   - **Reason**: No event handler or JavaScript reference found

---

## Recommendations

### ⚠️ High Priority

2. **Fix orphaned functions** - These query non-existent elements
   - Add missing HTML elements with the correct IDs
   - Or update the JavaScript to use correct element IDs
   - Or remove the orphaned code if it's no longer needed

3. **Add handlers to interactive elements** - These elements appear clickable but do nothing
   - Add event handlers to make them functional
   - Or remove them if they're not needed

### ℹ️ Low Priority

4. **Remove unused functions** - These increase bundle size unnecessarily
   - Review each function to confirm it's truly unused
   - Remove dead code to improve maintainability

### 🛠️ Automated Fixes

Some issues can be fixed automatically:
- Run with `--fix` flag to remove unused functions (with backup)
- Review the changes before committing

