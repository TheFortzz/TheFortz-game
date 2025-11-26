// Test script to create sample maps for testing the map system
// Run this in the browser console to create test data

function createTestMaps() {
    const testMaps = [
        {
            id: "test-map-1",
            name: "Desert Fortress",
            created: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
            objects: [
                {
                    name: "Guard Tower",
                    folder: "Buildings",
                    fileName: "guard_tower.png",
                    x: 100,
                    y: 100,
                    image: "/assets/Buildings/Guard_Tower/guard_tower.png"
                },
                {
                    name: "House 01",
                    folder: "Buildings", 
                    fileName: "house_01.png",
                    x: 200,
                    y: 150,
                    image: "/assets/Buildings/House_01/house_01.png"
                },
                {
                    name: "Rock Asteroid",
                    folder: "Asteroids",
                    fileName: "spr_asteroids_large1_rock_01.png",
                    x: 300,
                    y: 100,
                    image: "/assets/Asteroids/Asteroid Large 1/Rock/spr_asteroids_large1_rock_01.png"
                },
                {
                    name: "Gold Asteroid",
                    folder: "Asteroids",
                    fileName: "spr_asteroids_medium1_gold_01.png",
                    x: 150,
                    y: 250,
                    image: "/assets/Asteroids/Asteroid Medium 1/Gold/spr_asteroids_medium1_gold_01.png"
                }
            ],
            groundTiles: [
                {
                    key: "0,0",
                    type: "ground5",
                    image: "/assets/Grounds/_Group_ (4).png"
                },
                {
                    key: "1,0", 
                    type: "ground5",
                    image: "/assets/Grounds/_Group_ (4).png"
                }
            ],
            version: "1.0",
            isUserCreated: true,
            thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        },
        {
            id: "test-map-2", 
            name: "Village Square",
            created: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
            objects: [
                {
                    name: "Inn",
                    folder: "Buildings",
                    fileName: "inn.png", 
                    x: 150,
                    y: 100,
                    image: "/assets/Buildings/Inn/inn.png"
                },
                {
                    name: "Shop 01",
                    folder: "Buildings",
                    fileName: "shop_01.png",
                    x: 250,
                    y: 200,
                    image: "/assets/Buildings/Shop_01/shop_01.png"
                },
                {
                    name: "Tree",
                    folder: "Buildings",
                    fileName: "trees.png",
                    x: 50,
                    y: 50,
                    image: "/assets/Buildings/Tree/trees.png"
                },
                {
                    name: "Ice Asteroid",
                    folder: "Asteroids",
                    fileName: "spr_asteroids_small1_ice_01.png",
                    x: 300,
                    y: 50,
                    image: "/assets/Asteroids/Asteroid Small 1/Ice/spr_asteroids_small1_ice_01.png"
                }
            ],
            groundTiles: [
                {
                    key: "0,0",
                    type: "ground12",
                    image: "/assets/Grounds/_Group_ (11).png"
                }
            ],
            version: "1.0",
            isUserCreated: true,
            thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        },
        {
            id: "test-map-3",
            name: "Farm Lands", 
            created: new Date().toISOString(), // Today
            objects: [
                {
                    name: "Farm House 01",
                    folder: "Buildings",
                    fileName: "farm_house_01.png",
                    x: 120,
                    y: 80,
                    image: "/assets/Buildings/Farm_House_01/farm_house_01.png"
                },
                {
                    name: "Wind Mill",
                    folder: "Buildings", 
                    fileName: "windmill.png",
                    x: 300,
                    y: 120,
                    image: "/assets/Buildings/Wind_Mill/windmill.png"
                },
                {
                    name: "Large Rock Asteroid",
                    folder: "Asteroids",
                    fileName: "spr_asteroids_large2_rock_01.png",
                    x: 80,
                    y: 200,
                    image: "/assets/Asteroids/Asteroid Large 2/Rock/spr_asteroids_large2_rock_01.png"
                }
            ],
            groundTiles: [
                {
                    key: "0,0",
                    type: "ground8",
                    image: "/assets/Grounds/_Group_ (7).png"
                },
                {
                    key: "1,1",
                    type: "ground8", 
                    image: "/assets/Grounds/_Group_ (7).png"
                }
            ],
            version: "1.0",
            isUserCreated: true,
            thumbnail: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        }
    ];

    // Save test maps to localStorage
    localStorage.setItem('thefortz.customMaps', JSON.stringify(testMaps));
    
    // Create some play count data (Desert Fortress is most played)
    const playCounts = {
        "test-map-1": 15, // Desert Fortress - most played
        "test-map-2": 8,  // Village Square
        "test-map-3": 3   // Farm Lands - newest but least played
    };
    localStorage.setItem('thefortz.mapPlays', JSON.stringify(playCounts));
    
    console.log('✅ Test maps created successfully!');
    console.log('Maps:', testMaps.map(m => `${m.name} (${playCounts[m.id]} plays)`));
    console.log('Most played map should be: Desert Fortress');
    
    // Refresh the game mode list if it exists
    if (typeof window.populateGameModeList === 'function') {
        window.populateGameModeList();
    }
    
    return testMaps;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    console.log('🧪 Test map system ready. Run createTestMaps() to create sample data.');
}