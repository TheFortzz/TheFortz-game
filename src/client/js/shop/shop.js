// Shop System
let shopAnimationId = null;

// Map shop items to actual game items
const SHOP_ITEMS = [
    // Tank Colors
    { id: 'blue', name: 'Blue Tank', price: 0, type: 'color', icon: '🔵', color: '#4A9EFF', description: 'Default tank color' },
    { id: 'camo', name: 'Camo Tank', price: 500, type: 'color', icon: '🟢', color: '#90EE90', description: 'Forest camouflage' },
    { id: 'desert', name: 'Desert Tank', price: 1000, type: 'color', icon: '🟡', color: '#FFD700', description: 'Desert camouflage' },
    { id: 'purple', name: 'Purple Tank', price: 2000, type: 'color', icon: '🟣', color: '#9400D3', description: 'Royal purple' },
    { id: 'red', name: 'Red Tank', price: 5000, type: 'color', icon: '🔴', color: '#DC143C', description: 'Legendary red' },
    
    // Tank Bodies
    { id: 'body_halftrack', name: 'Halftrack Body', price: 0, type: 'body', icon: '🚗', color: '#00f7ff', description: 'Default tank body' },
    { id: 'body_tracks', name: 'Tracked Body', price: 1500, type: 'body', icon: '🚙', color: '#FFA500', description: 'Heavy tracked chassis' },
    
    // Weapons
    { id: 'turret_01_mk1', name: 'MK1 Turret', price: 0, type: 'weapon', icon: '🔫', color: '#00f7ff', description: 'Basic turret' },
    { id: 'turret_01_mk2', name: 'MK2 Turret', price: 800, type: 'weapon', icon: '💥', color: '#FFA500', description: 'Improved turret' },
    { id: 'turret_01_mk3', name: 'MK3 Turret', price: 1500, type: 'weapon', icon: '🎯', color: '#FF4500', description: 'Advanced turret' },
    { id: 'turret_01_mk4', name: 'MK4 Turret', price: 3000, type: 'weapon', icon: '⚡', color: '#FF00FF', description: 'Elite turret' }
];

function startShopRendering() {
    if (shopAnimationId) return;

    const canvas = document.getElementById('lobbyBackground');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Create HTML overlay buttons
    createShopInteractiveElements();

    function renderShop() {
        if (window.gameState.isInLobby && window.gameState.showShop) {
            const time = Date.now() * 0.001;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Enhanced gradient background
            const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            bgGradient.addColorStop(0, 'rgba(10, 15, 35, 0.98)');
            bgGradient.addColorStop(1, 'rgba(5, 10, 25, 0.98)');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Animated particles
            for (let i = 0; i < 30; i++) {
                const x = (canvas.width * (i * 0.123 + time * 0.02)) % canvas.width;
                const y = (canvas.height * (i * 0.456 + time * 0.015)) % canvas.height;
                const size = 1 + Math.sin(time * 3 + i) * 0.5;
                ctx.fillStyle = `rgba(0, 247, 255, ${0.3 + Math.sin(time * 2 + i) * 0.2})`;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw close button
            drawCloseButton(ctx, canvas);

            // Animated title
            ctx.save();
            ctx.translate(canvas.width / 2, 100);
            const titlePulse = 1 + Math.sin(time * 2) * 0.02;
            ctx.scale(titlePulse, titlePulse);
            ctx.font = 'bold 56px Arial';
            ctx.fillStyle = '#00f7ff';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00f7ff';
            ctx.fillText('🛒 SHOP', 0, 0);
            ctx.restore();

            ctx.font = '22px Arial';
            ctx.fillStyle = '#aaa';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 0;
            ctx.fillText('Purchase Items with Fortz', canvas.width / 2, 150);

            // Draw shop items (visual only)
            const startY = 220;
            const itemWidth = 200;
            const itemHeight = 250;
            const gap = 30;
            const itemsPerRow = 4;

            SHOP_ITEMS.forEach((item, i) => {
                const row = Math.floor(i / itemsPerRow);
                const col = i % itemsPerRow;
                const x = 100 + col * (itemWidth + gap);
                const y = startY + row * (itemHeight + gap);

                // Check if item is owned and equipped
                const isOwned = isItemOwned(item);
                const isEquipped = isItemEquipped(item);

                // Item box
                const boxGradient = ctx.createRadialGradient(x + itemWidth/2, y + itemHeight/2, 0, x + itemWidth/2, y + itemHeight/2, itemWidth);
                boxGradient.addColorStop(0, `${item.color}40`);
                boxGradient.addColorStop(1, `${item.color}20`);
                ctx.fillStyle = boxGradient;
                ctx.fillRect(x, y, itemWidth, itemHeight);

                // Border (gold if equipped, bright if owned)
                ctx.strokeStyle = isEquipped ? '#FFD700' : (isOwned ? item.color : `${item.color}80`);
                ctx.lineWidth = isEquipped ? 4 : 3;
                ctx.strokeRect(x, y, itemWidth, itemHeight);

                // Equipped badge
                if (isEquipped) {
                    ctx.fillStyle = '#FFD700';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('✓ EQUIPPED', x + itemWidth/2, y + 20);
                }

                // Icon
                ctx.font = '60px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(item.icon, x + itemWidth/2, y + 80);

                // Name
                ctx.font = 'bold 18px Arial';
                ctx.fillStyle = '#fff';
                ctx.fillText(item.name, x + itemWidth/2, y + 130);

                // Description
                ctx.font = '12px Arial';
                ctx.fillStyle = '#aaa';
                ctx.fillText(item.description, x + itemWidth/2, y + 150);

                // Price
                ctx.font = 'bold 20px Arial';
                ctx.fillStyle = '#FFD700';
                if (!isOwned && item.price > 0) {
                    ctx.fillText(`${item.price} Fortz`, x + itemWidth/2, y + 180);
                } else if (item.price === 0) {
                    ctx.fillStyle = '#4CAF50';
                    ctx.fillText('FREE', x + itemWidth/2, y + 180);
                } else {
                    ctx.fillStyle = '#4CAF50';
                    ctx.fillText('OWNED', x + itemWidth/2, y + 180);
                }

                // Buy/Equip button (visual only - actual button is HTML overlay)
                const btnY = y + 200;
                const btnHeight = 35;
                let buttonText = 'BUY';
                let buttonColor = '#4CAF50';
                
                if (isEquipped) {
                    buttonText = 'EQUIPPED';
                    buttonColor = '#FFD700';
                } else if (isOwned) {
                    buttonText = 'EQUIP';
                    buttonColor = '#2196F3';
                } else if (item.price === 0) {
                    buttonText = 'EQUIP';
                    buttonColor = '#4CAF50';
                }
                
                ctx.fillStyle = buttonColor;
                ctx.fillRect(x + 25, btnY, itemWidth - 50, btnHeight);
                ctx.strokeStyle = buttonColor === '#4CAF50' ? '#45a049' : (buttonColor === '#FFD700' ? '#DAA520' : '#1976D2');
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 25, btnY, itemWidth - 50, btnHeight);
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = buttonColor === '#FFD700' ? '#000' : '#fff';
                ctx.fillText(buttonText, x + itemWidth/2, btnY + 22);
            });

            // Footer
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = '#ff5050';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#ff5050';
            ctx.fillText('[ESC to close]', canvas.width / 2, canvas.height - 60);
            ctx.shadowBlur = 0;

            shopAnimationId = requestAnimationFrame(renderShop);
        } else {
            shopAnimationId = null;
        }
    }

    renderShop();
}

function isItemOwned(item) {
    const ownedItems = window.gameState.ownedItems || { colors: [], bodies: [], weapons: [] };
    
    switch(item.type) {
        case 'color':
            return ownedItems.colors && ownedItems.colors.includes(item.id);
        case 'body':
            return ownedItems.bodies && ownedItems.bodies.includes(item.id);
        case 'weapon':
            return ownedItems.weapons && ownedItems.weapons.includes(item.id);
        default:
            return false;
    }
}

function isItemEquipped(item) {
    const selectedTank = window.gameState.selectedTank || {};
    
    switch(item.type) {
        case 'color':
            return selectedTank.color === item.id;
        case 'body':
            return selectedTank.body === item.id;
        case 'weapon':
            return selectedTank.weapon === item.id;
        default:
            return false;
    }
}

async function purchaseOrEquipItem(item) {
    const isOwned = isItemOwned(item);
    const isEquipped = isItemEquipped(item);

    if (isEquipped) {
        showNotification('Already equipped!', '#FFD700', 32);
        return;
    }

    if (!isOwned && item.price > 0) {
        // Purchase item
        const currentFortz = window.gameState.fortzCurrency || 0;
        
        if (currentFortz < item.price) {
            showNotification(`Not enough Fortz! Need ${item.price}, have ${currentFortz}`, '#ff5050', 32);
            return;
        }

        // Deduct currency
        window.gameState.fortzCurrency -= item.price;
        
        // Add to owned items
        if (!window.gameState.ownedItems) {
            window.gameState.ownedItems = { colors: ['blue'], bodies: ['body_halftrack'], weapons: ['turret_01_mk1'] };
        }
        
        switch(item.type) {
            case 'color':
                if (!window.gameState.ownedItems.colors.includes(item.id)) {
                    window.gameState.ownedItems.colors.push(item.id);
                }
                break;
            case 'body':
                if (!window.gameState.ownedItems.bodies.includes(item.id)) {
                    window.gameState.ownedItems.bodies.push(item.id);
                }
                break;
            case 'weapon':
                if (!window.gameState.ownedItems.weapons.includes(item.id)) {
                    window.gameState.ownedItems.weapons.push(item.id);
                }
                break;
        }

        showNotification(`Purchased ${item.name}!`, '#4CAF50', 32);
    }

    // Equip item
    if (!window.gameState.selectedTank) {
        window.gameState.selectedTank = { color: 'blue', body: 'body_halftrack', weapon: 'turret_01_mk1' };
    }

    switch(item.type) {
        case 'color':
            window.gameState.selectedTank.color = item.id;
            break;
        case 'body':
            window.gameState.selectedTank.body = item.id;
            break;
        case 'weapon':
            window.gameState.selectedTank.weapon = item.id;
            break;
    }

    showNotification(`Equipped ${item.name}!`, '#2196F3', 32);
    
    // Update Fortz display
    updateFortzDisplay();
    
    // Save to server
    await saveUserProgress();
    
    // Recreate buttons to update visual state
    createShopInteractiveElements();
    
    // Update lobby tank preview
    if (typeof updateLobbyTankPreview === 'function') {
        updateLobbyTankPreview();
    }
}

async function saveUserProgress() {
    // Prepare save data
    const saveData = {
        fortzCurrency: window.gameState.fortzCurrency,
        ownedItems: window.gameState.ownedItems,
        selectedTank: window.gameState.selectedTank
    };

    // Save to CrazyGames cloud if user is a CrazyGames user
    if (window.currentUser && window.currentUser.isCrazyGamesUser && window.CrazyGamesIntegration) {
        try {
            await window.CrazyGamesIntegration.saveGameData(saveData);
            console.log('✓ Progress saved to CrazyGames cloud');
        } catch (error) {
            console.error('Error saving to CrazyGames cloud:', error);
        }
    }

    // Save to backend server if user has a local account
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch('/api/user/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(saveData)
        });

        if (!response.ok) {
            console.error('Failed to save progress to server');
        }
    } catch (error) {
        console.error('Error saving progress to server:', error);
    }
}

function createShopInteractiveElements() {
    const canvas = document.getElementById('lobbyBackground');
    const shopContainer = document.getElementById('shopButtons');
    if (!shopContainer) return;

    // Clear existing buttons
    shopContainer.innerHTML = '';
    shopContainer.classList.remove('hidden');

    const startY = 220;
    const itemWidth = 200;
    const itemHeight = 250;
    const gap = 30;
    const itemsPerRow = 4;

    SHOP_ITEMS.forEach((item, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        const x = 100 + col * (itemWidth + gap);
        const y = startY + row * (itemHeight + gap);
        const btnY = y + 200;
        const btnHeight = 35;

        const btn = document.createElement('button');
        btn.style.position = 'absolute';
        btn.style.left = `${x + 25}px`;
        btn.style.top = `${btnY}px`;
        btn.style.width = `${itemWidth - 50}px`;
        btn.style.height = `${btnHeight}px`;
        btn.style.background = 'transparent';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.pointerEvents = 'auto';
        btn.style.zIndex = '100';

        const isEquipped = isItemEquipped(item);
        if (!isEquipped) {
            btn.onclick = () => purchaseOrEquipItem(item);
        } else {
            btn.style.cursor = 'default';
        }

        shopContainer.appendChild(btn);
    });

    // Add close button
    const closeButtonSize = 50;
    const closeButtonX = canvas.width - closeButtonSize - 30;
    const closeButtonY = 30;

    const closeBtn = document.createElement('button');
    closeBtn.style.position = 'absolute';
    closeBtn.style.left = `${closeButtonX}px`;
    closeBtn.style.top = `${closeButtonY}px`;
    closeBtn.style.width = `${closeButtonSize}px`;
    closeBtn.style.height = `${closeButtonSize}px`;
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.pointerEvents = 'auto';
    closeBtn.style.zIndex = '100';

    closeBtn.onclick = () => {
        if (typeof window.closeCurrentFeature === 'function') {
            window.closeCurrentFeature();
        }
    };

    shopContainer.appendChild(closeBtn);
}

function stopShopRendering() {
    if (shopAnimationId) {
        cancelAnimationFrame(shopAnimationId);
        shopAnimationId = null;
    }

    // Hide HTML buttons
    const container = document.getElementById('shopButtons');
    if (container) {
        container.classList.add('hidden');
    }
}

// Export functions to global scope
window.startShopRendering = startShopRendering;
window.stopShopRendering = stopShopRendering;
window.createShopInteractiveElements = createShopInteractiveElements;
window.saveUserProgress = saveUserProgress;
