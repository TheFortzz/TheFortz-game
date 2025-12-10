// Settings System - HTML/JS Based

function initSettingsUI() {
    // Initialize sliders with current values
    if (window.gameState && window.gameState.settings) {
        const sound = window.gameState.settings.sound;

        updateSlider('masterVolumeSlider', 'masterVolumeValue', sound.master);
        updateSlider('effectsVolumeSlider', 'effectsVolumeValue', sound.effects);
        updateSlider('musicVolumeSlider', 'musicVolumeValue', sound.music);

        // Initialize graphics buttons
        setGraphicsQualityUI(window.gameState.settings.graphics.quality);
    }
}

function updateSlider(sliderId, valueId, value) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(valueId);

    if (slider) slider.value = value;
    if (display) display.textContent = value + '%';
}

function updateVolume(type, value) {
    const val = parseInt(value);
    if (window.gameState && window.gameState.settings) {
        window.gameState.settings.sound[type] = val;

        // Update display text
        const display = document.getElementById(`${type}VolumeValue`);
        if (display) display.textContent = val + '%';

        // Save settings
        saveSettings();
    }
}

function setGraphicsQuality(quality) {
    if (window.gameState && window.gameState.settings) {
        window.gameState.settings.graphics.quality = quality;
        setGraphicsQualityUI(quality);
        saveSettings();
        console.log(`Graphics quality set to ${quality}`);
    }
}

function setGraphicsQualityUI(quality) {
    // Update button states
    const qualities = ['low', 'medium', 'high', 'ultra'];
    qualities.forEach(q => {
        const btn = document.getElementById(`graphics${q.charAt(0).toUpperCase() + q.slice(1)}`);
        if (btn) {
            if (q === quality) {
                btn.classList.add('active');
                btn.style.background = 'rgba(0, 247, 255, 0.3)';
                btn.style.borderColor = '#00f7ff';
                btn.style.color = '#00f7ff';
            } else {
                btn.classList.remove('active');
                btn.style.background = 'rgba(255, 255, 255, 0.1)';
                btn.style.borderColor = '#666';
                btn.style.color = '#aaa';
            }
        }
    });
}

function saveSettings() {
    if (typeof localStorage !== 'undefined' && window.gameState) {
        localStorage.setItem('gameSettings', JSON.stringify(window.gameState.settings));
    }
}

// Export functions to global scope
window.initSettingsUI = initSettingsUI;
window.updateVolume = updateVolume;
window.setGraphicsQuality = setGraphicsQuality;
