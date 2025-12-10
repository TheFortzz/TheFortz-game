// Map Creator Core System
class MapCreatorCore {
    constructor() {
        this.currentMapName = null;
        this.currentVehicleType = null;
        this.currentMapId = null;
        this.isActive = false;
    }

    // Initialize the map creator system
    init() {
        console.log('🗺️ MapCreatorCore initialized');
        this.setupGlobalFunctions();
    }

    // Setup global functions for backward compatibility
    setupGlobalFunctions() {
        window.openBlankMapCreator = () => this.openBlankMapCreator();
        window.showVehicleTypeSelection = () => this.showVehicleTypeSelection();
        window.showMapNameInput = (vehicleType) => this.showMapNameInput(vehicleType);
        window.startMapEditor = (vehicleType) => this.startMapEditor(vehicleType);
    }

    // Open the map creator (called by CREATE NEW button)
    openBlankMapCreator() {
        console.log('🚀 Opening blank map creator...');
        console.log('🚗 Calling showVehicleTypeSelection...');
        this.showVehicleTypeSelection();
    }

    // Show vehicle type selection modal
    showVehicleTypeSelection() {
        console.log('🚗 Showing vehicle type selection...');
        console.log('🚗 Creating modal elements...');
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        `;

        // Create selection container
        const container = document.createElement('div');
        container.style.cssText = `
            background: #1a2a3a;
            border: 3px solid #00f7ff;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            max-width: 500px;
            width: 90%;
        `;

        container.innerHTML = `
            <h2 style="color: #00f7ff; margin-bottom: 20px;">🎮 Select Vehicle Type</h2>
            <p style="color: #ccc; margin-bottom: 30px;">Choose the type of vehicles for your map</p>
            <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 20px;">
                <button id="selectTank" style="
                    padding: 15px 25px;
                    background: #00f7ff;
                    color: black;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 16px;
                ">🚗 TANK</button>
                <button id="selectJet" style="
                    padding: 15px 25px;
                    background: #ff6b00;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 16px;
                ">✈️ JET</button>
                <button id="selectRace" style="
                    padding: 15px 25px;
                    background: #ff0066;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 16px;
                ">🏎️ RACE</button>
            </div>
            <button id="cancelVehicleBtn" style="
                padding: 10px 20px;
                background: #666;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Cancel</button>
        `;

        modal.appendChild(container);
        document.body.appendChild(modal);
        console.log('✅ Vehicle selection modal added to DOM');

        // Add event listeners with debugging
        const tankBtn = document.getElementById('selectTank');
        const jetBtn = document.getElementById('selectJet');
        const raceBtn = document.getElementById('selectRace');
        const cancelBtn = document.getElementById('cancelVehicleBtn');
        
        console.log('🔘 Found buttons:', {
            tank: !!tankBtn,
            jet: !!jetBtn,
            race: !!raceBtn,
            cancel: !!cancelBtn
        });

        if (tankBtn) {
            tankBtn.onclick = () => {
                console.log('🚗 Tank selected!');
                modal.remove();
                this.showMapNameInput('tank');
            };
        }

        document.getElementById('selectJet').onclick = () => {
            modal.remove();
            this.showMapNameInput('jet');
        };

        document.getElementById('selectRace').onclick = () => {
            modal.remove();
            this.showMapNameInput('race');
        };

        document.getElementById('cancelVehicleBtn').onclick = () => {
            modal.remove();
        };
    }

    // Show map name input modal
    showMapNameInput(vehicleType) {
        console.log('📝 Showing map name input for:', vehicleType);
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
        `;

        // Create input container
        const container = document.createElement('div');
        container.style.cssText = `
            background: #1a2a3a;
            border: 3px solid #00f7ff;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            max-width: 400px;
            width: 90%;
        `;

        const vehicleEmoji = vehicleType === 'tank' ? '🚗' : vehicleType === 'jet' ? '✈️' : '🏎️';
        const vehicleName = vehicleType.toUpperCase();

        container.innerHTML = `
            <h2 style="color: #00f7ff; margin-bottom: 10px;">🗺️ Name Your ${vehicleName} Map</h2>
            <p style="color: #ccc; margin-bottom: 20px;">${vehicleEmoji} Creating map for ${vehicleName} vehicles</p>
            <input 
                type="text" 
                id="mapNameInput" 
                placeholder="Enter map name..." 
                maxlength="30"
                style="
                    width: 100%;
                    padding: 12px;
                    font-size: 16px;
                    border: 2px solid #00f7ff;
                    border-radius: 8px;
                    background: #0a1a2a;
                    color: white;
                    margin-bottom: 20px;
                    outline: none;
                "
            />
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="backBtn" style="
                    padding: 10px 20px;
                    background: #666;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Back</button>
                <button id="createBtn" style="
                    padding: 10px 20px;
                    background: #00f7ff;
                    color: black;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                ">Create Map</button>
            </div>
        `;

        modal.appendChild(container);
        document.body.appendChild(modal);

        // Focus input and add event listeners
        const input = document.getElementById('mapNameInput');
        input.focus();

        document.getElementById('backBtn').onclick = () => {
            modal.remove();
            this.showVehicleTypeSelection();
        };

        document.getElementById('createBtn').onclick = () => {
            const mapName = input.value.trim();
            if (!mapName) {
                alert('Please enter a map name!');
                return;
            }

            // Store map data
            this.currentMapName = mapName;
            this.currentVehicleType = vehicleType;
            this.currentMapId = null;

            console.log('🚀 Starting map editor:', mapName, vehicleType);
            modal.remove();
            this.startMapEditor(vehicleType);
        };

        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                document.getElementById('createBtn').click();
            }
        };
    }

    // Start the map editor
    startMapEditor(vehicleType) {
        console.log('🎨 Starting map editor for:', vehicleType);
        
        // Route to correct editor
        if (vehicleType === 'tank') {
            this.startTankEditor();
        } else if (vehicleType === 'jet') {
            this.startJetEditor();
        } else if (vehicleType === 'race') {
            this.startRaceEditor();
        }
    }

    // Start tank editor
    startTankEditor() {
        console.log('🚗 Starting tank editor...');
        
        // Hide lobby
        const lobbyScreen = document.getElementById('lobbyScreen');
        if (lobbyScreen) {
            lobbyScreen.classList.add('hidden');
        }

        // Show map creator
        const blankCreator = document.getElementById('blankMapCreator');
        if (blankCreator) {
            // Move to body and force visible
            document.body.appendChild(blankCreator);
            blankCreator.style.cssText = `
                display: block !important;
                visibility: visible !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 99999 !important;
                background: #1a1a2e !important;
            `;

            // Initialize canvas
            this.initCanvas();
        } else {
            console.error('❌ blankMapCreator not found!');
        }
    }

    // Initialize canvas
    initCanvas() {
        const canvas = document.getElementById('mapCreatorCanvas');
        if (!canvas) {
            console.error('❌ Canvas not found!');
            return;
        }

        console.log('🎨 Initializing canvas...');
        
        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Force canvas visible
        canvas.style.cssText = `
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            height: 100% !important;
        `;

        // Draw test pattern
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Clear with background
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid
            ctx.strokeStyle = '#00f7ff';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 100) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 100) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            
            // Draw title
            ctx.fillStyle = '#00f7ff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('MAP CREATOR - TANK MODE', canvas.width/2, canvas.height/2);
            ctx.font = '24px Arial';
            ctx.fillText(`Map: ${this.currentMapName}`, canvas.width/2, canvas.height/2 + 60);
            
            console.log('✅ Canvas initialized successfully!');
            this.isActive = true;
        }
    }

    // Start jet editor (placeholder)
    startJetEditor() {
        alert('Jet editor coming soon!');
    }

    // Start race editor (placeholder)
    startRaceEditor() {
        alert('Race editor coming soon!');
    }
}

// Create and initialize the map creator
console.log('🚀 Loading MapCreatorCore...');
const mapCreator = new MapCreatorCore();
mapCreator.init();
console.log('✅ MapCreatorCore loaded and initialized');

// Export for global access
window.MapCreatorCore = MapCreatorCore;
window.mapCreator = mapCreator;

// Ensure functions are available immediately
console.log('✅ MapCreatorCore functions exported:', {
    openBlankMapCreator: typeof window.openBlankMapCreator,
    showVehicleTypeSelection: typeof window.showVehicleTypeSelection,
    showMapNameInput: typeof window.showMapNameInput,
    startMapEditor: typeof window.startMapEditor
});