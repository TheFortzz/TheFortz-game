

// Pass (Battle Pass) System
let passAnimationId = null;
const PASS_TIERS = [
    { tier: 1, reward: 'Blue Tank Body', icon: '🚗', xp: 0, claimed: true },
    { tier: 2, reward: '500 Fortz', icon: '💰', xp: 1000, claimed: false },
    { tier: 3, reward: 'Camo Tank Skin', icon: '🎨', xp: 2500, claimed: false },
    { tier: 4, reward: 'Turret MK2', icon: '🔫', xp: 5000, claimed: false },
    { tier: 5, reward: '1000 Fortz', icon: '💰', xp: 7500, claimed: false },
    { tier: 6, reward: 'Desert Tank Skin', icon: '🏜️', xp: 10000, claimed: false },
    { tier: 7, reward: 'Turret MK3', icon: '🔫', xp: 15000, claimed: false },
    { tier: 8, reward: 'Purple Tank Skin', icon: '💜', xp: 20000, claimed: false },
    { tier: 9, reward: '2500 Fortz', icon: '💰', xp: 25000, claimed: false },
    { tier: 10, reward: 'Red Legendary Skin', icon: '👑', xp: 30000, claimed: false }
];

function startPassRendering() {
    if (passAnimationId) return;

    const canvas = document.getElementById('lobbyBackground');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Create HTML overlay buttons
    createPassInteractiveElements();

    // Get player XP (use score as XP for now)
    const playerXP = window.gameState.players[window.gameState.playerId]?.score || 0;

    function renderPass() {
        if (window.gameState.isInLobby && window.gameState.showPass) {
            const time = Date.now() * 0.001;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Dark background
            ctx.fillStyle = 'rgba(10, 15, 35, 0.95)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw close button (using global function from game.js)
            if (typeof window.drawCloseButton === 'function') {
                window.drawCloseButton(ctx, canvas);
            }

            // Title
            ctx.font = 'bold 48px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'center';
            ctx.fillText('🎖️ BATTLE PASS', canvas.width / 2, 100);

            // Season info
            ctx.font = '20px Arial';
            ctx.fillStyle = '#aaa';
            ctx.fillText('Season 1 - Tank Warfare', canvas.width / 2, 150);

            // Player XP progress
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#00f7ff';
            ctx.fillText(`Your XP: ${playerXP.toLocaleString()}`, canvas.width / 2, 190);

            // Tier boxes
            const startY = 250;
            const boxWidth = 180;
            const boxHeight = 200;
            const gap = 20;
            const tiersPerRow = 5;

            PASS_TIERS.forEach((tier, i) => {
                const row = Math.floor(i / tiersPerRow);
                const col = i % tiersPerRow;
                const x = (canvas.width - (boxWidth * tiersPerRow + gap * (tiersPerRow - 1))) / 2 + col * (boxWidth + gap);
                const y = startY + row * (boxHeight + gap);

                const isUnlocked = playerXP >= tier.xp;
                const isClaimed = tier.claimed;

                // Tier box background
                if (isClaimed) {
                    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
                } else if (isUnlocked) {
                    ctx.fillStyle = 'rgba(0, 247, 255, 0.3)';
                } else {
                    ctx.fillStyle = 'rgba(30, 40, 60, 0.8)';
                }
                ctx.fillRect(x, y, boxWidth, boxHeight);

                // Border
                if (isClaimed) {
                    ctx.strokeStyle = '#555';
                } else if (isUnlocked) {
                    ctx.strokeStyle = '#00f7ff';
                } else {
                    ctx.strokeStyle = '#666';
                }
                ctx.lineWidth = isUnlocked && !isClaimed ? 3 : 2;
                ctx.strokeRect(x, y, boxWidth, boxHeight);

                // Tier number
                ctx.font = 'bold 20px Arial';
                ctx.fillStyle = '#FFD700';
                ctx.textAlign = 'center';
                ctx.fillText(`TIER ${tier.tier}`, x + boxWidth / 2, y + 30);

                // Reward icon
                ctx.font = '40px Arial';
                ctx.fillStyle = '#fff';
                ctx.fillText(tier.icon, x + boxWidth / 2, y + 80);

                // Reward name
                ctx.font = '14px Arial';
                ctx.fillStyle = '#fff';
                ctx.fillText(tier.reward, x + boxWidth / 2, y + 120);

                // XP requirement
                ctx.font = '12px Arial';
                ctx.fillStyle = '#888';
                ctx.fillText(`${tier.xp.toLocaleString()} XP`, x + boxWidth / 2, y + 145);

                // Status
                if (isClaimed) {
                    ctx.font = 'bold 14px Arial';
                    ctx.fillStyle = '#4CAF50';
                    ctx.fillText('✓ CLAIMED', x + boxWidth / 2, y + 175);
                } else if (isUnlocked) {
                    ctx.font = 'bold 14px Arial';
                    ctx.fillStyle = '#00f7ff';
                    ctx.fillText('CLAIM NOW!', x + boxWidth / 2, y + 175);
                } else {
                    ctx.font = '12px Arial';
                    ctx.fillStyle = '#666';
                    const remaining = tier.xp - playerXP;
                    ctx.fillText(`${remaining.toLocaleString()} XP needed`, x + boxWidth / 2, y + 175);
                }

                // Click area for claiming
                if (isUnlocked && !isClaimed) {
                    if (!window.passClickAreas) window.passClickAreas = {};
                    window.passClickAreas[`tier_${tier.tier}`] = {
                        x, y, width: boxWidth, height: boxHeight, tier: tier.tier
                    };
                }
            });

            // Instructions
            ctx.font = 'bold 18px Arial';
            ctx.fillStyle = '#ff5050';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#ff5050';
            ctx.fillText('[ESC to close]', canvas.width / 2, canvas.height - 60);
            ctx.shadowBlur = 0;

            ctx.font = '14px Arial';
            ctx.fillStyle = '#aaa';
            ctx.fillText('Earn XP by destroying shapes and players • Click unlocked tiers to claim rewards', canvas.width / 2, canvas.height - 100);

            passAnimationId = requestAnimationFrame(renderPass);
        } else {
            passAnimationId = null;
        }
    }

    renderPass();
}

function createPassInteractiveElements() {
    const container = document.getElementById('passButtons');
    if (!container) return;

    // Clear existing buttons
    container.innerHTML = '';
    container.classList.remove('hidden');

    const canvas = document.getElementById('lobbyBackground');
    if (!canvas) return;

    // Get player XP
    const playerXP = window.gameState.players[window.gameState.playerId]?.score || 0;

    // Create buttons for each tier
    const startY = 250;
    const boxWidth = 180;
    const boxHeight = 200;
    const gap = 20;
    const tiersPerRow = 5;

    PASS_TIERS.forEach((tier, i) => {
        const row = Math.floor(i / tiersPerRow);
        const col = i % tiersPerRow;
        const x = (canvas.width - (boxWidth * tiersPerRow + gap * (tiersPerRow - 1))) / 2 + col * (boxWidth + gap);
        const y = startY + row * (boxHeight + gap);

        const isUnlocked = playerXP >= tier.xp;
        const isClaimed = tier.claimed;

        if (isUnlocked && !isClaimed) {
            const btn = document.createElement('button');
            btn.style.position = 'absolute';
            btn.style.left = `${x}px`;
            btn.style.top = `${y}px`;
            btn.style.width = `${boxWidth}px`;
            btn.style.height = `${boxHeight}px`;
            btn.style.background = 'transparent';
            btn.style.border = 'none';
            btn.style.cursor = 'pointer';
            btn.style.pointerEvents = 'auto';
            btn.style.zIndex = '100';

            btn.onclick = () => {
                tier.claimed = true;
                console.log(`Claimed tier ${tier.tier}: ${tier.reward}`);
                // Recreate buttons to update state
                createPassInteractiveElements();
            };

            container.appendChild(btn);
        }
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

    container.appendChild(closeBtn);
}

function stopPassRendering() {
    if (passAnimationId) {
        cancelAnimationFrame(passAnimationId);
        passAnimationId = null;
    }
    window.passClickAreas = {};

    // Hide HTML buttons
    const container = document.getElementById('passButtons');
    if (container) {
        container.classList.add('hidden');
    }
}

// Export functions to global scope
window.startPassRendering = startPassRendering;
window.stopPassRendering = stopPassRendering;
window.PASS_TIERS = PASS_TIERS;
window.createPassInteractiveElements = createPassInteractiveElements;

