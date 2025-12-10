#!/usr/bin/env python3
"""
Script to remove duplicate UI functions from game.js
These functions are now handled by LobbyUI, ShopUI, and LockerUI modules
"""

# Read the file
with open('src/client/js/game.js', 'r') as f:
    lines = f.readlines()

# Define the line ranges to remove (0-indexed)
# Shop functions block: lines 2884-4635 (inclusive, 1-indexed) = 2883-4634 (0-indexed)
# We'll replace this entire block with simple delegation functions

# Find the start and end markers
shop_start = None
shop_end = None
for i, line in enumerate(lines):
    if '// Enhanced Shop Functions with Modern Square Design' in line:
        shop_start = i
    if shop_start is not None and line.strip().startswith('function returnToLobby()'):
        shop_end = i
        break

print(f"Shop functions block: lines {shop_start+1} to {shop_end}")

# Create delegation functions to replace the shop block
delegation_functions = """
// Shop Functions - now handled by ShopUI module
function drawShop() {
    if (shopUI && ctx && canvas) {
        shopUI.drawShop(ctx, canvas);
    }
}

function handleShopClick(e) {
    if (shopUI && canvas) {
        shopUI.handleShopClick(e, canvas);
    }
}

function startLobbyShopRendering() {
    if (shopUI) {
        shopUI.startLobbyShopRendering();
    }
}

function stopLobbyShopRendering() {
    if (shopUI) {
        shopUI.stopLobbyShopRendering();
    }
}

function setupLobbyShopHandler() {
    if (shopUI) {
        shopUI.setupLobbyShopHandler();
    }
}

function getShopColorHex(color) {
    return shopUI ? shopUI.getShopColorHex(color) : '#ffffff';
}

function isShopComboOwned(color, weapon) {
    return shopUI ? shopUI.isShopComboOwned(color, weapon) : false;
}

function isShopComboEquipped(color, weapon) {
    return shopUI ? shopUI.isShopComboEquipped(color, weapon) : false;
}

function preloadShopTankImages() {
    return shopUI ? shopUI.preloadShopTankImages() : Promise.resolve();
}

function stopShopTankAnimations() {
    if (shopUI) {
        shopUI.stopShopTankAnimations();
    }
}

async function purchaseOrEquipShopCombo(color, weapon, price) {
    return shopUI ? await shopUI.purchaseOrEquipShopCombo(color, weapon, price) : false;
}

"""

# Replace the shop block with delegation functions
if shop_start is not None and shop_end is not None:
    new_lines = lines[:shop_start] + [delegation_functions] + lines[shop_end:]
    
    # Write the modified content
    with open('src/client/js/game.js', 'w') as f:
        f.writelines(new_lines)
    
    print(f"✅ Removed {shop_end - shop_start} lines of duplicate shop functions")
    print(f"✅ Added delegation functions to ShopUI module")
else:
    print("❌ Could not find shop functions block")
