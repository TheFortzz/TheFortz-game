# JavaScript-HTML Connection Audit Report

*Generated on 12/8/2025, 10:54:36 AM*

## Executive Summary

- **Total Issues**: 603
- **Critical**: 38
- **Warnings**: 154
- **Info**: 411

---

## 1. Orphaned Functions ⚠️

**122 function(s)** reference HTML elements that don't exist.

### Missing Element: `mapZoomSlider`

Referenced by 2 location(s):

- **Function**: `initZoomSlider`
  - **File**: `src/client/js/zoomSlider.js`
  - **Line**: 8
  - **Method**: `getElementById`

- **Function**: `updateZoomSlider`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 5388
  - **Method**: `getElementById`

### Missing Element: `mapZoomSliderFill`

Referenced by 2 location(s):

- **Function**: `initZoomSlider`
  - **File**: `src/client/js/zoomSlider.js`
  - **Line**: 9
  - **Method**: `getElementById`

- **Function**: `updateZoomSlider`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 5389
  - **Method**: `getElementById`

### Missing Element: `mapZoomSliderThumb`

Referenced by 2 location(s):

- **Function**: `initZoomSlider`
  - **File**: `src/client/js/zoomSlider.js`
  - **Line**: 10
  - **Method**: `getElementById`

- **Function**: `updateZoomSlider`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 5390
  - **Method**: `getElementById`

### Missing Element: `zoomDisplay`

Referenced by 6 location(s):

- **Function**: `anonymous`
  - **File**: `src/client/js/zoomSlider.js`
  - **Line**: 37
  - **Method**: `getElementById`

- **Function**: `createZoomSlider`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1653
  - **Method**: `getElementById`

- **Function**: `handleCanvasWheel`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 3021
  - **Method**: `getElementById`

- **Function**: `anonymous`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 5374
  - **Method**: `getElementById`

- **Function**: `zoomIn`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 5426
  - **Method**: `getElementById`

- **Function**: `zoomOut`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 5458
  - **Method**: `getElementById`

### Missing Element: `mapCreatorMinimapCanvas`

Referenced by 2 location(s):

- **Function**: `captureMapThumbnail`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 16
  - **Method**: `getElementById`

- **Function**: `updateMinimapViewer`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1824
  - **Method**: `getElementById`

### Missing Element: `createNewMapBtn`

Referenced by 2 location(s):

- **Function**: `stopCreateMapRendering`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 624
  - **Method**: `getElementById`

- **Function**: `createInteractiveElements`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 630
  - **Method**: `getElementById`

### Missing Element: `tankMapNameInput`

Referenced by 1 location(s):

- **Function**: `showTankMapNameInput`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 820
  - **Method**: `getElementById`

### Missing Element: `tankCancelBtn`

Referenced by 1 location(s):

- **Function**: `showTankMapNameInput`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 823
  - **Method**: `getElementById`

### Missing Element: `tankCreateBtn`

Referenced by 2 location(s):

- **Function**: `showTankMapNameInput`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 825
  - **Method**: `getElementById`

- **Function**: `anonymous`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 845
  - **Method**: `getElementById`

### Missing Element: `cancelVehicleBtn`

Referenced by 1 location(s):

- **Function**: `showVehicleTypeSelection`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 989
  - **Method**: `getElementById`

### Missing Element: `mapNameInput`

Referenced by 1 location(s):

- **Function**: `showMapNameInput`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1072
  - **Method**: `getElementById`

### Missing Element: `backBtn`

Referenced by 1 location(s):

- **Function**: `showMapNameInput`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1076
  - **Method**: `getElementById`

### Missing Element: `createBtn`

Referenced by 2 location(s):

- **Function**: `showMapNameInput`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1082
  - **Method**: `getElementById`

- **Function**: `anonymous`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1104
  - **Method**: `getElementById`

### Missing Element: `mapCreatorLoadingScreen`

Referenced by 2 location(s):

- **Function**: `showMapCreatorLoading`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1111
  - **Method**: `getElementById`

- **Function**: `hideMapCreatorLoading`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1205
  - **Method**: `getElementById`

### Missing Element: `mapLoadProgress`

Referenced by 1 location(s):

- **Function**: `updateMapCreatorLoadingProgress`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1197
  - **Method**: `getElementById`

### Missing Element: `mapLoadStatus`

Referenced by 1 location(s):

- **Function**: `updateMapCreatorLoadingProgress`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1198
  - **Method**: `getElementById`

### Missing Element: `vehicleTypeIndicator`

Referenced by 2 location(s):

- **Function**: `addVehicleTypeIndicator`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1370
  - **Method**: `getElementById`

- **Function**: `closeBlankMapCreator`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 2015
  - **Method**: `getElementById`

### Missing Element: `renameMapInput`

Referenced by 1 location(s):

- **Function**: `showRenameMapDialog`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1500
  - **Method**: `getElementById`

### Missing Element: `cancelRenameBtn`

Referenced by 1 location(s):

- **Function**: `showRenameMapDialog`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1514
  - **Method**: `getElementById`

### Missing Element: `confirmRenameBtn`

Referenced by 1 location(s):

- **Function**: `showRenameMapDialog`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1519
  - **Method**: `getElementById`

### Missing Element: `mapNameDisplay`

Referenced by 1 location(s):

- **Function**: `confirmRename`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1532
  - **Method**: `getElementById`

### Missing Element: `mapCreatorZoomSlider`

Referenced by 2 location(s):

- **Function**: `createZoomSlider`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1552
  - **Method**: `getElementById`

- **Function**: `closeBlankMapCreator`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 2003
  - **Method**: `getElementById`

### Missing Element: `mapCreatorMinimap`

Referenced by 2 location(s):

- **Function**: `createMinimapViewer`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1690
  - **Method**: `getElementById`

- **Function**: `closeBlankMapCreator`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 2009
  - **Method**: `getElementById`

### Missing Element: `mapCreatorHelpButton`

Referenced by 2 location(s):

- **Function**: `createHelpButton`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 1746
  - **Method**: `getElementById`

- **Function**: `closeBlankMapCreator`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 2021
  - **Method**: `getElementById`

### Missing Element: `mapCreatorHelpTooltip`

Referenced by 1 location(s):

- **Function**: `closeBlankMapCreator`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 2027
  - **Method**: `getElementById`

### Missing Element: `mapTestOverlay`

Referenced by 1 location(s):

- **Function**: `anonymous`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 3592
  - **Method**: `getElementById`

### Missing Element: `mapTestCanvas`

Referenced by 1 location(s):

- **Function**: `stopMapTest`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 3736
  - **Method**: `getElementById`

### Missing Element: `<dynamic>`

Referenced by 15 location(s):

- **Function**: `anonymous`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 4291
  - **Method**: `getElementById`

- **Function**: `anonymous`
  - **File**: `src/client/js/tankCreatmap.js`
  - **Line**: 4294
  - **Method**: `getElementById`

- **Function**: `updateSlider`
  - **File**: `src/client/js/settings.js`
  - **Line**: 18
  - **Method**: `getElementById`

- **Function**: `updateSlider`
  - **File**: `src/client/js/settings.js`
  - **Line**: 19
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

### Missing Element: `raceMapNameInput`

Referenced by 1 location(s):

- **Function**: `showRaceMapNameInput`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 368
  - **Method**: `getElementById`

### Missing Element: `raceCancelBtn`

Referenced by 1 location(s):

- **Function**: `showRaceMapNameInput`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 371
  - **Method**: `getElementById`

### Missing Element: `raceCreateBtn`

Referenced by 2 location(s):

- **Function**: `showRaceMapNameInput`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 373
  - **Method**: `getElementById`

- **Function**: `anonymous`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 387
  - **Method**: `getElementById`

### Missing Element: `raceMapCreator`

Referenced by 5 location(s):

- **Function**: `createRaceMapEditorUI`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 408
  - **Method**: `getElementById`

- **Function**: `updateRaceMinimap`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1282
  - **Method**: `getElementById`

- **Function**: `closeRaceMapCreator`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1426
  - **Method**: `getElementById`

- **Function**: `handleRaceKeyDown`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1531
  - **Method**: `getElementById`

- **Function**: `panLoop`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1553
  - **Method**: `getElementById`

### Missing Element: `raceMapCanvas`

Referenced by 4 location(s):

- **Function**: `initRaceMapCanvas`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 755
  - **Method**: `getElementById`

- **Function**: `renderRaceMap`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 841
  - **Method**: `getElementById`

- **Function**: `handleRaceCanvasZoom`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1062
  - **Method**: `getElementById`

- **Function**: `handleRaceCanvasMouseMove`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1106
  - **Method**: `getElementById`

### Missing Element: `raceObjectCount`

Referenced by 1 location(s):

- **Function**: `renderRaceMap`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 955
  - **Method**: `getElementById`

### Missing Element: `raceAssetGrid`

Referenced by 1 location(s):

- **Function**: `loadRaceAssets`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1161
  - **Method**: `getElementById`

### Missing Element: `raceMinimap`

Referenced by 2 location(s):

- **Function**: `createRaceMinimap`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1239
  - **Method**: `getElementById`

- **Function**: `closeRaceMapCreator`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1430
  - **Method**: `getElementById`

### Missing Element: `raceMinimapCanvas`

Referenced by 1 location(s):

- **Function**: `updateRaceMinimap`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1281
  - **Method**: `getElementById`

### Missing Element: `raceAssetPanel`

Referenced by 2 location(s):

- **Function**: `toggleRaceAssetsPanel`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1449
  - **Method**: `getElementById`

- **Function**: `setupRaceEditorDrag`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1494
  - **Method**: `getElementById`

### Missing Element: `raceMinimizeBtn`

Referenced by 1 location(s):

- **Function**: `toggleRaceAssetsPanel`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1450
  - **Method**: `getElementById`

### Missing Element: `raceAssetPanelContent`

Referenced by 1 location(s):

- **Function**: `toggleRaceAssetsPanel`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1451
  - **Method**: `getElementById`

### Missing Element: `raceEditorHeader`

Referenced by 1 location(s):

- **Function**: `setupRaceEditorDrag`
  - **File**: `src/client/js/raceCreatmap.js`
  - **Line**: 1495
  - **Method**: `getElementById`

### Missing Element: `jetMapNameInput`

Referenced by 1 location(s):

- **Function**: `showJetMapNameInput`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 164
  - **Method**: `getElementById`

### Missing Element: `jetCancelBtn`

Referenced by 1 location(s):

- **Function**: `showJetMapNameInput`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 167
  - **Method**: `getElementById`

### Missing Element: `jetCreateBtn`

Referenced by 2 location(s):

- **Function**: `showJetMapNameInput`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 169
  - **Method**: `getElementById`

- **Function**: `anonymous`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 183
  - **Method**: `getElementById`

### Missing Element: `jetMapCreator`

Referenced by 5 location(s):

- **Function**: `createJetMapEditorUI`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 204
  - **Method**: `getElementById`

- **Function**: `updateJetMinimap`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 861
  - **Method**: `getElementById`

- **Function**: `closeJetMapCreator`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 999
  - **Method**: `getElementById`

- **Function**: `handleJetKeyDown`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 1104
  - **Method**: `getElementById`

- **Function**: `panLoop`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 1126
  - **Method**: `getElementById`

### Missing Element: `jetMapCanvas`

Referenced by 4 location(s):

- **Function**: `initJetMapCanvas`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 408
  - **Method**: `getElementById`

- **Function**: `renderJetMap`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 492
  - **Method**: `getElementById`

- **Function**: `handleJetCanvasZoom`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 663
  - **Method**: `getElementById`

- **Function**: `handleJetCanvasMouseMove`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 702
  - **Method**: `getElementById`

### Missing Element: `jetObjectCount`

Referenced by 1 location(s):

- **Function**: `renderJetMap`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 573
  - **Method**: `getElementById`

### Missing Element: `jetAssetGrid`

Referenced by 1 location(s):

- **Function**: `loadJetAssets`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 752
  - **Method**: `getElementById`

### Missing Element: `jetMinimap`

Referenced by 2 location(s):

- **Function**: `createJetMinimap`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 818
  - **Method**: `getElementById`

- **Function**: `closeJetMapCreator`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 1003
  - **Method**: `getElementById`

### Missing Element: `jetMinimapCanvas`

Referenced by 1 location(s):

- **Function**: `updateJetMinimap`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 860
  - **Method**: `getElementById`

### Missing Element: `jetAssetPanel`

Referenced by 2 location(s):

- **Function**: `toggleJetAssetsPanel`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 1022
  - **Method**: `getElementById`

- **Function**: `setupJetEditorDrag`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 1067
  - **Method**: `getElementById`

### Missing Element: `jetMinimizeBtn`

Referenced by 1 location(s):

- **Function**: `toggleJetAssetsPanel`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 1023
  - **Method**: `getElementById`

### Missing Element: `jetAssetPanelContent`

Referenced by 1 location(s):

- **Function**: `toggleJetAssetsPanel`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 1024
  - **Method**: `getElementById`

### Missing Element: `jetEditorHeader`

Referenced by 1 location(s):

- **Function**: `setupJetEditorDrag`
  - **File**: `src/client/js/jetCreatmap.js`
  - **Line**: 1068
  - **Method**: `getElementById`

### Missing Element: `mapLoadingScreen`

Referenced by 1 location(s):

- **Function**: `showMapLoadingScreen`
  - **File**: `src/client/js/createdMapsIntegration.js`
  - **Line**: 160
  - **Method**: `getElementById`

### Missing Element: `colorsItemsGrid`

Referenced by 1 location(s):

- **Function**: `global`
  - **File**: `src/client/js/ui/LockerUI.js`
  - **Line**: 49
  - **Method**: `getElementById`

### Missing Element: `bodiesItemsGrid`

Referenced by 1 location(s):

- **Function**: `global`
  - **File**: `src/client/js/ui/LockerUI.js`
  - **Line**: 58
  - **Method**: `getElementById`

### Missing Element: `weaponsItemsGrid`

Referenced by 1 location(s):

- **Function**: `global`
  - **File**: `src/client/js/ui/LockerUI.js`
  - **Line**: 64
  - **Method**: `getElementById`

### Missing Element: `currentColor`

Referenced by 2 location(s):

- **Function**: `global`
  - **File**: `src/client/js/ui/LockerUI.js`
  - **Line**: 201
  - **Method**: `getElementById`

- **Function**: `global`
  - **File**: `src/client/js/ui/LockerUI.js`
  - **Line**: 317
  - **Method**: `getElementById`

### Missing Element: `currentBody`

Referenced by 2 location(s):

- **Function**: `global`
  - **File**: `src/client/js/ui/LockerUI.js`
  - **Line**: 205
  - **Method**: `getElementById`

- **Function**: `global`
  - **File**: `src/client/js/ui/LockerUI.js`
  - **Line**: 318
  - **Method**: `getElementById`

### Missing Element: `currentWeapon`

Referenced by 2 location(s):

- **Function**: `global`
  - **File**: `src/client/js/ui/LockerUI.js`
  - **Line**: 209
  - **Method**: `getElementById`

- **Function**: `global`
  - **File**: `src/client/js/ui/LockerUI.js`
  - **Line**: 319
  - **Method**: `getElementById`

### Missing Element: `lockerTankPreview`

Referenced by 1 location(s):

- **Function**: `global`
  - **File**: `src/client/js/ui/LockerUI.js`
  - **Line**: 298
  - **Method**: `getElementById`

### Missing Element: `gameModesScreen`

Referenced by 1 location(s):

- **Function**: `anonymous`
  - **File**: `src/client/js/ui/LobbyUI.js`
  - **Line**: 942
  - **Method**: `getElementById`

### Missing Element: `cooldownCursor`

Referenced by 5 location(s):

- **Function**: `global`
  - **File**: `src/client/js/game/input.js`
  - **Line**: 164
  - **Method**: `getElementById`

- **Function**: `global`
  - **File**: `src/client/js/game/input.js`
  - **Line**: 172
  - **Method**: `getElementById`

- **Function**: `global`
  - **File**: `src/client/js/game/input.js`
  - **Line**: 182
  - **Method**: `getElementById`

- **Function**: `global`
  - **File**: `src/client/js/game/input.js`
  - **Line**: 213
  - **Method**: `getElementById`

- **Function**: `global`
  - **File**: `src/client/js/game/input.js`
  - **Line**: 215
  - **Method**: `getElementById`

---

## 2. Broken Event Handlers 🔴

**38 event handler(s)** call functions that don't exist.

### 1. Missing Function: `showPartyInviteMenu`

- **Element ID**: `inviteBtn1`
- **Event Type**: `onclick`
- **HTML Line**: 69

### 2. Missing Function: `showPartyInviteMenu`

- **Element ID**: `inviteBtn2`
- **Event Type**: `onclick`
- **HTML Line**: 86

### 3. Missing Function: `selectVehicleType`

- **Element ID**: `jetBtn`
- **Event Type**: `onclick`
- **HTML Line**: 115

### 4. Missing Function: `selectVehicleType`

- **Element ID**: `tankBtn`
- **Event Type**: `onclick`
- **HTML Line**: 118

### 5. Missing Function: `selectVehicleType`

- **Element ID**: `raceBtn`
- **Event Type**: `onclick`
- **HTML Line**: 121

### 6. Missing Function: `switchShopCategory`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 496

### 7. Missing Function: `switchShopCategory`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 500

### 8. Missing Function: `switchShopCategory`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 503

### 9. Missing Function: `switchShopCategory`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 506

### 10. Missing Function: `scrollLockerItems`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 592

### 11. Missing Function: `scrollLockerItems`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 624

### 12. Missing Function: `selectLockerItem`

- **Element ID**: `lockerSelectBtn`
- **Event Type**: `onclick`
- **HTML Line**: 644

### 13. Missing Function: `switchChampionsTab`

- **Element ID**: `tabTopPlayers`
- **Event Type**: `onclick`
- **HTML Line**: 732

### 14. Missing Function: `switchChampionsTab`

- **Element ID**: `tabTopCreators`
- **Event Type**: `onclick`
- **HTML Line**: 736

### 15. Missing Function: `switchChampionsTab`

- **Element ID**: `tabChampions`
- **Event Type**: `onclick`
- **HTML Line**: 740

### 16. Missing Function: `switchChampionsTab`

- **Element ID**: `tabAward`
- **Event Type**: `onclick`
- **HTML Line**: 744

### 17. Missing Function: `switchFriendsTab`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 830

### 18. Missing Function: `switchFriendsTab`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 831

### 19. Missing Function: `inviteFriend`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 849

### 20. Missing Function: `messageFriend`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 850

### 21. Missing Function: `spectateFriend`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 863

### 22. Missing Function: `messageFriend`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 864

### 23. Missing Function: `inviteFriend`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 877

### 24. Missing Function: `messageFriend`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 878

### 25. Missing Function: `declineFriendRequest`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 898

### 26. Missing Function: `declineFriendRequest`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 912

### 27. Missing Function: `switchFriendsTab`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 1193

### 28. Missing Function: `switchFriendsTab`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 1196

### 29. Missing Function: `closeGameModeModal`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 1228

### 30. Missing Function: `scrollGameModeList`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 1230

### 31. Missing Function: `scrollGameModeList`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 1236

### 32. Missing Function: `toggleTeamModeDropdown`

- **Element ID**: `soloBtn`
- **Event Type**: `onclick`
- **HTML Line**: 1244

### 33. Missing Function: `selectTeamMode`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 1249

### 34. Missing Function: `selectTeamMode`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 1250

### 35. Missing Function: `selectTeamMode`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 1251

### 36. Missing Function: `openBattleRoyal`

- **Element ID**: *No ID*
- **Event Type**: `onclick`
- **HTML Line**: 1255

### 37. Missing Function: `respawnPlayer`

- **Element ID**: `respawnBtn`
- **Event Type**: `onclick`
- **HTML Line**: 1415

### 38. Missing Function: `filterFriends`

- **Element ID**: `friendSearchInput`
- **Event Type**: `oninput`
- **HTML Line**: 825

---

## 3. Unused Functions ℹ️

**393 function(s)** are defined but never called.

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

- `showTankMapNameInput` (line 746)
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

### File: `src/client/js/settings.js`

- `initSettingsUI` (line 3)

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

- `quickPlayFFAWithPlayerMap` (line 171)

### File: `src/client/js/raceCreatmap.js`

- `clearRaceMap` (line 1344)
- `saveRaceMap` (line 1387)
- `toggleRaceAssetsPanel` (line 1448)
- `switchRaceAssetCategory` (line 1476)

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

### File: `src/client/js/jetCreatmap.js`

- `clearJetMap` (line 922)
- `saveJetMap` (line 961)
- `toggleJetAssetsPanel` (line 1021)
- `switchJetAssetCategory` (line 1049)

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

### File: `src/client/js/game-integration.js`

- `getRandomSpawnPoint` (line 637)
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

### File: `src/client/js/createdMapsIntegration.js`

- `hideMapLoadingScreen` (line 219)
- `setupMapForGameStart` (line 242)

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

### File: `src/client/js/backend-server.js`

- `generateWalls` (line 653)

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

### File: `src/client/js/ui/Auth.js`

- `logout` (line 108)
- `toggleStatsBox` (line 244)

### File: `src/client/js/tests/code-duplication-elimination.test.js`

- `isCommonPattern` (line 311)

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

### File: `src/client/js/shop/shop-optimized.js`

- `scroll` (line 267)

### File: `src/client/js/game/network.js`

- `sendMovement` (line 70)

### File: `src/client/js/game/gameManager.js`

- `addDamage` (line 10)
- `addPowerUp` (line 102)
- `health` (line 124)
- `shield` (line 125)
- `ammo` (line 126)

### File: `src/client/js/examples/modular-game-example.js`

- `initializeModularGame` (line 13)
- `stopModularGame` (line 92)

### File: `src/client/js/core/ModuleManager.js`

- `getGameLoop` (line 101)

### File: `src/client/js/core/GameState.js`

- `updateLockerState` (line 52)

---

## 4. Non-Functional Interactive Elements ⚠️

**28 interactive element(s)** have no event handlers or JavaScript references.

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
   - **HTML Line**: 1130
   - **Reason**: No event handler or JavaScript reference found

10. **BUTTON**
   - **HTML Line**: 1167
   - **Reason**: No event handler or JavaScript reference found

11. **INPUT** (ID: `maxPlayersInput`)
   - **HTML Line**: 247
   - **Reason**: No event handler or JavaScript reference found

12. **INPUT** (ID: `matchTimeInput`)
   - **HTML Line**: 252
   - **Reason**: No event handler or JavaScript reference found

13. **INPUT** (ID: `killLimitInput`)
   - **HTML Line**: 257
   - **Reason**: No event handler or JavaScript reference found

14. **INPUT** (ID: `respawnTimeInput`)
   - **HTML Line**: 262
   - **Reason**: No event handler or JavaScript reference found

15. **INPUT** (ID: `friendlyFireToggle`)
   - **HTML Line**: 289
   - **Reason**: No event handler or JavaScript reference found

16. **INPUT** (ID: `autoBalanceToggle`)
   - **HTML Line**: 296
   - **Reason**: No event handler or JavaScript reference found

17. **INPUT** (ID: `autoFillToggle`)
   - **HTML Line**: 344
   - **Reason**: No event handler or JavaScript reference found

18. **INPUT** (ID: `minPlayersForAI`)
   - **HTML Line**: 351
   - **Reason**: No event handler or JavaScript reference found

19. **INPUT** (ID: `autoFillAICount`)
   - **HTML Line**: 355
   - **Reason**: No event handler or JavaScript reference found

20. **INPUT** (ID: `powerupsToggle`)
   - **HTML Line**: 374
   - **Reason**: No event handler or JavaScript reference found

21. **INPUT**
   - **HTML Line**: 380
   - **Reason**: No event handler or JavaScript reference found

22. **INPUT**
   - **HTML Line**: 381
   - **Reason**: No event handler or JavaScript reference found

23. **INPUT**
   - **HTML Line**: 382
   - **Reason**: No event handler or JavaScript reference found

24. **INPUT**
   - **HTML Line**: 383
   - **Reason**: No event handler or JavaScript reference found

25. **INPUT**
   - **HTML Line**: 384
   - **Reason**: No event handler or JavaScript reference found

26. **INPUT** (ID: `powerupSpawnRate`)
   - **HTML Line**: 388
   - **Reason**: No event handler or JavaScript reference found

27. **SELECT** (ID: `numTeamsSelect`)
   - **HTML Line**: 280
   - **Reason**: No event handler or JavaScript reference found

28. **SELECT** (ID: `autoFillDifficulty`)
   - **HTML Line**: 359
   - **Reason**: No event handler or JavaScript reference found

---

## 5. UI Pattern Issues ℹ️

**22 UI pattern(s)** are incomplete.

### Modal Patterns

- ⚠️ **Element**: `aiBotConfigModal`
  - **Missing**: open function, close function

- ⚠️ **Element**: `chatModal`
  - **Missing**: open function, close function

- ⚠️ **Element**: `friendsModal`
  - **Missing**: open function

- ⚠️ **Element**: `gameModeModal`
  - **Missing**: open function, close function

### Tab Patterns

- ℹ️ **Element**: `createdMapTab`
  - **Missing**: switch function

- ℹ️ **Element**: `analyzeTab`
  - **Missing**: switch function

- ℹ️ **Element**: `tanksTab`
  - **Missing**: switch function

- ℹ️ **Element**: `jetsTab`
  - **Missing**: switch function

- ℹ️ **Element**: `raceTab`
  - **Missing**: switch function

- ℹ️ **Element**: `musicTab`
  - **Missing**: switch function

- ℹ️ **Element**: `tabTopPlayers`
  - **Missing**: switch function

- ℹ️ **Element**: `tabTopCreators`
  - **Missing**: switch function

- ℹ️ **Element**: `tabChampions`
  - **Missing**: switch function

- ℹ️ **Element**: `tabAward`
  - **Missing**: switch function

- ℹ️ **Element**: `championsTabTopPlayers`
  - **Missing**: switch function

- ℹ️ **Element**: `championsTabTopCreators`
  - **Missing**: switch function

- ℹ️ **Element**: `championsTabChampions`
  - **Missing**: switch function

- ℹ️ **Element**: `championsTabAward`
  - **Missing**: switch function

- ℹ️ **Element**: `friendsTabOnline`
  - **Missing**: switch function

- ℹ️ **Element**: `friendsTabRequests`
  - **Missing**: switch function

- ℹ️ **Element**: `friendsTabContent`
  - **Missing**: switch function

- ℹ️ **Element**: `requestsTabContent`
  - **Missing**: switch function

---

## Recommendations

### 🔴 Critical Priority

1. **Fix broken event handlers** - These prevent user interactions from working
   - Add missing function definitions
   - Or remove the event handlers if they're no longer needed

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

5. **Complete UI patterns** - These may indicate incomplete features
   - Review each pattern to ensure all components are present
   - Add missing open/close functions for modals
   - Add missing switch functions for tabs
   - Add missing submit handlers for forms

### 🛠️ Automated Fixes

Some issues can be fixed automatically:
- Run with `--fix` flag to remove unused functions (with backup)
- Review the changes before committing

