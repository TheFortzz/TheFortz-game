// Locker System
let lockerAnimationId = null;

function startLockerRendering() {
    if (lockerAnimationId) return;

    const canvas = document.getElementById('lobbyBackground');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Create HTML overlay buttons
    createLockerInteractiveElements();

    function renderLocker() {
        if (window.gameState.isInLobby && window.gameState.showLocker) {
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

            // Draw close button at standardized position
            const closeButtonSize = 50;
            const closeButtonX = canvas.width - closeButtonSize - 30;
            const closeButtonY = 30;
            drawCloseButton(ctx, canvas);

            // Close instruction removed - ESC works globally now

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
            ctx.fillText('🎨 MY LOCKER', 0, 0);
            ctx.restore();

            ctx.font = '22px Arial';
            ctx.fillStyle = '#aaa';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 0;
            ctx.fillText('Manage Your Collection', canvas.width / 2, 150);

            const startY = 220;
            const lineHeight = 85;

            // SOUND SECTION
            ctx.font = 'bold 36px Arial';
            const soundGradient = ctx.createLinearGradient(80, startY - 20, 80, startY + 20);
            soundGradient.addColorStop(0, '#FFD700');
            soundGradient.addColorStop(1, '#FFA500');
            ctx.fillStyle = soundGradient;
            ctx.textAlign = 'left';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#FFD700';
            ctx.fillText('🔊 SOUND', 80, startY);
            ctx.shadowBlur = 0;

            ['master', 'effects', 'music'].forEach((type, i) => {
                const y = startY + 70 + i * lineHeight;

                // Label with icon
                const icons = { master: '🎚️', effects: '💥', music: '🎵' };
                ctx.font = 'bold 22px Arial';
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'left';
                ctx.fillText(`${icons[type]} ${type.charAt(0).toUpperCase() + type.slice(1)}`, 100, y);

                const sliderX = 350;
                const sliderW = 350;
                const sliderH = 14;
                const value = window.gameState.settings.sound[type];

                // Slider track
                ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
                ctx.fillRect(sliderX, y - 18, sliderW, sliderH);

                // Slider fill with gradient
                const fillGradient = ctx.createLinearGradient(sliderX, 0, sliderX + sliderW, 0);
                fillGradient.addColorStop(0, '#00f7ff');
                fillGradient.addColorStop(1, '#0080ff');
                ctx.fillStyle = fillGradient;
                ctx.fillRect(sliderX, y - 18, sliderW * (value / 100), sliderH);

                // Slider border
                ctx.strokeStyle = '#00f7ff';
                ctx.lineWidth = 2;
                ctx.strokeRect(sliderX, y - 18, sliderW, sliderH);

                // Slider handle
                const handleX = sliderX + sliderW * (value / 100);
                ctx.fillStyle = '#fff';
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#00f7ff';
                ctx.beginPath();
                ctx.arc(handleX, y - 11, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Value display
                ctx.font = 'bold 20px Arial';
                ctx.fillStyle = '#00f7ff';
                ctx.textAlign = 'right';
                ctx.fillText(value + '%', sliderX + sliderW + 60, y);

                if (!window.settingSliders) window.settingSliders = {};
                if (!window.settingSliders[type]) window.settingSliders[type] = {};
                window.settingSliders[type] = { x: sliderX, y: y - 18, width: sliderW, height: sliderH + 10, type, category: 'sound' };
            });

            // GRAPHICS SECTION
            const graphicsY = startY + 350;
            ctx.font = 'bold 36px Arial';
            const graphicsGradient = ctx.createLinearGradient(80, graphicsY - 20, 80, graphicsY + 20);
            graphicsGradient.addColorStop(0, '#FFD700');
            graphicsGradient.addColorStop(1, '#FFA500');
            ctx.fillStyle = graphicsGradient;
            ctx.textAlign = 'left';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#FFD700';
            ctx.fillText('🎨 GRAPHICS', 80, graphicsY);
            ctx.shadowBlur = 0;

            const qualities = ['low', 'medium', 'high'];
            const qualityLabels = { low: '⚡ Low', medium: '⚖️ Medium', high: '💎 High' };
            qualities.forEach((q, i) => {
                const x = 100 + i * 180;
                const y = graphicsY + 70;
                const isSelected = window.gameState.settings.graphics.quality === q;

                const boxPulse = isSelected ? 1 + Math.sin(time * 4) * 0.03 : 1;
                ctx.save();
                ctx.translate(x + 75, y + 30);
                ctx.scale(boxPulse, boxPulse);
                ctx.translate(-75, -30);

                // Box with gradient
                const boxGradient = ctx.createRadialGradient(75, 30, 0, 75, 30, 80);
                if (isSelected) {
                    boxGradient.addColorStop(0, 'rgba(0, 247, 255, 0.4)');
                    boxGradient.addColorStop(1, 'rgba(0, 150, 200, 0.2)');
                } else {
                    boxGradient.addColorStop(0, 'rgba(40, 50, 70, 0.8)');
                    boxGradient.addColorStop(1, 'rgba(20, 30, 50, 0.6)');
                }
                ctx.fillStyle = boxGradient;
                ctx.fillRect(0, 0, 150, 60);

                // Border
                ctx.strokeStyle = isSelected ? '#00f7ff' : '#555';
                ctx.lineWidth = isSelected ? 4 : 2;
                if (isSelected) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#00f7ff';
                }
                ctx.strokeRect(0, 0, 150, 60);
                ctx.shadowBlur = 0;

                // Label
                ctx.font = 'bold 18px Arial';
                ctx.fillStyle = isSelected ? '#00f7ff' : '#fff';
                ctx.textAlign = 'center';
                ctx.fillText(qualityLabels[q], 75, 38);

                ctx.restore();

                if (!window.settingSliders) window.settingSliders = {};
                if (!window.settingSliders[`quality_${q}`]) window.settingSliders[`quality_${q}`] = {};
                window.settingSliders[`quality_${q}`] = { x, y, width: 150, height: 60, quality: q, category: 'graphics' };
            });

            // Enhanced footer
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = '#ff5050';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#ff5050';
            ctx.fillText('[ESC to close]', canvas.width / 2, canvas.height - 60);
            ctx.shadowBlur = 0;

            ctx.font = '16px Arial';
            ctx.fillStyle = '#4CAF50';
            ctx.fillText('✓ Settings saved automatically', canvas.width / 2, canvas.height - 100);

            lockerAnimationId = requestAnimationFrame(renderLocker);
        } else {
            lockerAnimationId = null;
        }
    }

    renderLocker();
}

function createLockerInteractiveElements() {
    const container = document.getElementById('lockerButtons');
    if (!container) return;

    // Clear existing buttons
    container.innerHTML = '';
    container.classList.remove('hidden');

    const canvas = document.getElementById('lobbyBackground');
    if (!canvas) return;

    // Create invisible buttons for sliders (master, effects, music)
    const sliderTypes = ['master', 'effects', 'music'];
    const startY = 220;
    const lineHeight = 85;

    sliderTypes.forEach((type, i) => {
        const y = startY + 70 + i * lineHeight;
        const sliderX = 350;
        const sliderW = 350;
        const sliderH = 14;

        const btn = document.createElement('button');
        btn.style.position = 'absolute';
        btn.style.left = `${sliderX}px`;
        btn.style.top = `${y - 18}px`;
        btn.style.width = `${sliderW}px`;
        btn.style.height = `${sliderH + 10}px`;
        btn.style.background = 'transparent';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.pointerEvents = 'auto';
        btn.style.zIndex = '100';

        btn.onclick = (e) => {
            const rect = btn.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (clickX / sliderW) * 100));
            window.gameState.settings.sound[type] = Math.round(percentage);
            console.log(`${type} volume set to ${Math.round(percentage)}%`);
        };

        container.appendChild(btn);
    });

    // Create buttons for quality settings (low, medium, high)
    const graphicsY = startY + 350;
    const qualities = ['low', 'medium', 'high'];

    qualities.forEach((q, i) => {
        const x = 100 + i * 180;
        const y = graphicsY + 70;

        const btn = document.createElement('button');
        btn.style.position = 'absolute';
        btn.style.left = `${x}px`;
        btn.style.top = `${y}px`;
        btn.style.width = '150px';
        btn.style.height = '60px';
        btn.style.background = 'transparent';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.pointerEvents = 'auto';
        btn.style.zIndex = '100';

        btn.onclick = () => {
            window.gameState.settings.graphics.quality = q;
            console.log(`Graphics quality set to ${q}`);
        };

        container.appendChild(btn);
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

function stopLockerRendering() {
    if (lockerAnimationId) {
        cancelAnimationFrame(lockerAnimationId);
        lockerAnimationId = null;
    }
    if (typeof localStorage !== 'undefined' && window.gameState) {
        localStorage.setItem('gameSettings', JSON.stringify(window.gameState.settings));
    }
    if (window.settingSliders) {
        window.settingSliders = {};
    }

    // Hide HTML buttons
    const container = document.getElementById('lockerButtons');
    if (container) {
        container.classList.add('hidden');
    }
}

// Export functions to global scope
window.startLockerRendering = startLockerRendering;
window.stopLockerRendering = stopLockerRendering;
window.createLockerInteractiveElements = createLockerInteractiveElements;