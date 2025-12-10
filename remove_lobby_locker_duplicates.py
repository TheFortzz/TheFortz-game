#!/usr/bin/env python3
"""
Script to remove duplicate Lobby and Locker functions from game.js
These functions are now handled by LobbyUI and LockerUI modules
"""

# Read the file
with open('src/client/js/game.js', 'r') as f:
    content = f.read()

# Define the functions to remove and replace with delegations
# We'll do this by finding and replacing specific function blocks

# 1. Remove returnToLobby and replace with delegation
old_return_to_lobby_start = content.find('function returnToLobby() {')
if old_return_to_lobby_start != -1:
    # Find the end of this function (next function definition or end of block)
    # Look for the next "// Lobby background" comment or similar
    old_return_to_lobby_end = content.find('// Lobby background with live game preview', old_return_to_lobby_start)
    
    if old_return_to_lobby_end != -1:
        # Extract and replace
        new_return_to_lobby = """function returnToLobby() {
    if (lobbyUI) {
        lobbyUI.returnToLobby();
    }
}

"""
        content = content[:old_return_to_lobby_start] + new_return_to_lobby + content[old_return_to_lobby_end:]
        print("✅ Replaced returnToLobby with delegation to LobbyUI")

# 2. Remove lobby variables and functions block
lobby_vars_start = content.find('// Lobby background with live game preview')
if lobby_vars_start != -1:
    # Find where this block ends (look for next major section)
    lobby_vars_end = content.find('// Lobby shop rendering system', lobby_vars_start)
    
    if lobby_vars_end != -1:
        # Replace with delegation functions
        lobby_delegations = """// Lobby Functions - now handled by LobbyUI module
function getCurrentLobbyCanvas() {
    return lobbyUI ? lobbyUI.getCurrentLobbyCanvas() : null;
}

function initializeLobbyBackground() {
    if (lobbyUI) {
        lobbyUI.initializeLobbyBackground();
    }
}

function connectLobbyToServer() {
    if (lobbyUI) {
        lobbyUI.connectLobbyToServer();
    }
}

function closeAllPanels() {
    if (lobbyUI) {
        lobbyUI.closeAllPanels();
    }
}

function animateLobbyTanks() {
    if (lobbyUI) {
        lobbyUI.animateLobbyTanks();
    }
}

function updateLobbyBackgroundWithMap(mapData, vehicleType) {
    if (lobbyUI) {
        lobbyUI.updateLobbyBackgroundWithMap(mapData, vehicleType);
    }
}

function updateLobbyBackgroundNoMaps(vehicleType) {
    if (lobbyUI) {
        lobbyUI.updateLobbyBackgroundNoMaps(vehicleType);
    }
}

function updateLobbyVehiclePreview() {
    if (lobbyUI) {
        lobbyUI.updateLobbyVehiclePreview();
    }
}

function renderLobbyTank(ctx, centerX, centerY, tank) {
    if (lobbyUI) {
        lobbyUI.renderLobbyTank(ctx, centerX, centerY, tank);
    }
}

function renderLobbyJet(ctx, centerX, centerY, jet) {
    if (lobbyUI) {
        lobbyUI.renderLobbyJet(ctx, centerX, centerY, jet);
    }
}

function renderLobbyRace(ctx, centerX, centerY, race) {
    if (lobbyUI) {
        lobbyUI.renderLobbyRace(ctx, centerX, centerY, race);
    }
}

"""
        content = content[:lobby_vars_start] + lobby_delegations + content[lobby_vars_end:]
        print("✅ Replaced lobby functions with delegations to LobbyUI")

# 3. Remove locker functions
locker_start = content.find('// Load locker items')
if locker_start != -1:
    # Find where locker functions end (look for next major section)
    locker_end = content.find('// Render only tank weapon', locker_start)
    if locker_end == -1:
        locker_end = content.find('// Update locker item status', locker_start)
    
    if locker_end != -1:
        # Find the end of the last locker function
        locker_end = content.find('\n\n', locker_end + 100)
        
        if locker_end != -1:
            # Replace with delegation functions
            locker_delegations = """// Locker Functions - now handled by LockerUI module
function loadLockerItems(category) {
    if (lockerUI) {
        lockerUI.loadLockerItems(category);
    }
}

function equipLockerItem(item, category) {
    if (lockerUI) {
        lockerUI.equipLockerItem(item, category);
    }
}

function renderLockerTankPreview(canvas, item, category) {
    if (lockerUI) {
        lockerUI.renderLockerTankPreview(canvas, item, category);
    }
}

function updateLockerPreview() {
    if (lockerUI) {
        lockerUI.updateLockerPreview();
    }
}

function renderLockerTankWeaponOnly(canvas, color, weapon) {
    if (lockerUI) {
        lockerUI.renderLockerTankWeaponOnly(canvas, color, weapon);
    }
}

function updateLockerVehicleButtons(selectedVehicle) {
    if (lockerUI) {
        lockerUI.updateLockerVehicleButtons(selectedVehicle);
    }
}

function updateLockerCustomizationOptions(vehicle) {
    if (lockerUI) {
        lockerUI.updateLockerCustomizationOptions(vehicle);
    }
}

function updateLockerVehiclePreview(vehicle) {
    if (lockerUI) {
        lockerUI.updateLockerVehiclePreview(vehicle);
    }
}

function updateLockerStats(vehicle) {
    if (lockerUI) {
        lockerUI.updateLockerStats(vehicle);
    }
}

function animateLockerPreview(vehicle) {
    if (lockerUI) {
        lockerUI.animateLockerPreview(vehicle);
    }
}

function stopLockerPreviewAnimation() {
    if (lockerUI) {
        lockerUI.stopLockerPreviewAnimation();
    }
}

function renderLockerTank(ctx, centerX, centerY, tank) {
    if (lockerUI) {
        lockerUI.renderLockerTank(ctx, centerX, centerY, tank);
    }
}

function renderLockerJet(ctx, centerX, centerY, jet) {
    if (lockerUI) {
        lockerUI.renderLockerJet(ctx, centerX, centerY, jet);
    }
}

function renderLockerRace(ctx, centerX, centerY, race) {
    if (lockerUI) {
        lockerUI.renderLockerRace(ctx, centerX, centerY, race);
    }
}

"""
            content = content[:locker_start] + locker_delegations + content[locker_end:]
            print("✅ Replaced locker functions with delegations to LockerUI")

# Write the modified content
with open('src/client/js/game.js', 'w') as f:
    f.write(content)

print("\n✅ All UI function duplicates removed and replaced with delegations")
