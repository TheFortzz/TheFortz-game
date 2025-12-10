/**
 * Loot Box System for TheFortz
 * Crates with random rewards and rarity system
 */

const LootBoxSystem = {
    // Crate types
    crateTypes: {
        COMMON: {
            id: 'common_crate',
            name: 'Common Crate',
            icon: '📦',
            color: '#CCCCCC',
            cost: 100,
            guaranteedRarity: 'common',
            rarityWeights: {
                common: 70,
                uncommon: 25,
                rare: 5,
                epic: 0,
                legendary: 0
            }
        },
        RARE: {
            id: 'rare_crate',
            name: 'Rare Crate',
            icon: '🎁',
            color: '#4A90E2',
            cost: 500,
            guaranteedRarity: 'uncommon',
            rarityWeights: {
                common: 0,
                uncommon: 50,
                rare: 40,
                epic: 9,
                legendary: 1
            }
        },
        EPIC: {
            id: 'epic_crate',
            name: 'Epic Crate',
            icon: '🎪',
            color: '#9C27B0',
            cost: 1000,
            guaranteedRarity: 'rare',
            rarityWeights: {
                common: 0,
                uncommon: 0,
                rare: 60,
                epic: 35,
                legendary: 5
            }
        },
        LEGENDARY: {
            id: 'legendary_crate',
            name: 'Legendary Crate',
            icon: '🏆',
            color: '#FFD700',
            cost: 2500,
            guaranteedRarity: 'epic',
            rarityWeights: {
                common: 0,
                uncommon: 0,
                rare: 0,
                epic: 70,
                legendary: 30
            }
        },
        ULTIMATE: {
            id: 'ultimate_crate',
            name: 'Ultimate Crate',
            icon: '💎',
            color: '#FF1493',
            cost: 5000,
            guaranteedRarity: 'legendary',
            rarityWeights: {
                common: 0,
                uncommon: 0,
                rare: 0,
                epic: 0,
                legendary: 100
            }
        }
    },

    // Possible rewards
    rewardPool: {
        // Currency
        fortz_small: { type: 'currency', item: 'fortz', amount: 50, rarity: 'common' },
        fortz_medium: { type: 'currency', item: 'fortz', amount: 150, rarity: 'uncommon' },
        fortz_large: { type: 'currency', item: 'fortz', amount: 500, rarity: 'rare' },
        fortz_huge: { type: 'currency', item: 'fortz', amount: 1500, rarity: 'epic' },
        fortz_massive: { type: 'currency', item: 'fortz', amount: 5000, rarity: 'legendary' },

        // XP
        xp_small: { type: 'xp', amount: 100, rarity: 'common' },
        xp_medium: { type: 'xp', amount: 300, rarity: 'uncommon' },
        xp_large: { type: 'xp', amount: 1000, rarity: 'rare' },
        xp_huge: { type: 'xp', amount: 3000, rarity: 'epic' },
        xp_massive: { type: 'xp', amount: 10000, rarity: 'legendary' },

        // Tank skins
        tank_common_1: { type: 'tankSkin', item: 'classic_red', rarity: 'common' },
        tank_uncommon_1: { type: 'tankSkin', item: 'camo_forest', rarity: 'uncommon' },
        tank_rare_1: { type: 'tankSkin', item: 'chrome', rarity: 'rare' },
        tank_epic_1: { type: 'tankSkin', item: 'galaxy', rarity: 'epic' },
        tank_legendary_1: { type: 'tankSkin', item: 'rainbow', rarity: 'legendary' },

        // Weapon skins
        weapon_common_1: { type: 'weaponSkin', item: 'rusty', rarity: 'common' },
        weapon_rare_1: { type: 'weaponSkin', item: 'chrome_weapon', rarity: 'rare' },
        weapon_epic_1: { type: 'weaponSkin', item: 'gold_weapon', rarity: 'epic' },
        weapon_legendary_1: { type: 'weaponSkin', item: 'diamond', rarity: 'legendary' },

        // Emotes
        emote_common_1: { type: 'emote', item: 'wave', rarity: 'common' },
        emote_rare_1: { type: 'emote', item: 'dance', rarity: 'rare' },
        emote_epic_1: { type: 'emote', item: 'victory', rarity: 'epic' },

        // Skill points
        skill_points_1: { type: 'skillPoints', amount: 1, rarity: 'uncommon' },
        skill_points_3: { type: 'skillPoints', amount: 3, rarity: 'rare' },
        skill_points_5: { type: 'skillPoints', amount: 5, rarity: 'epic' },
        skill_points_10: { type: 'skillPoints', amount: 10, rarity: 'legendary' }
    },

    // Player inventory
    playerCrates: {},

    // Initialize player
    initPlayer(playerId) {
        if (!this.playerCrates[playerId]) {
            this.playerCrates[playerId] = {
                crates: {},
                openHistory: []
            };
        }
    },

    // Give crate to player
    giveCrate(playerId, crateType, amount = 1) {
        this.initPlayer(playerId);
        const player = this.playerCrates[playerId];

        if (!player.crates[crateType]) {
            player.crates[crateType] = 0;
        }

        player.crates[crateType] += amount;

        return {
            success: true,
            crateType: crateType,
            newAmount: player.crates[crateType]
        };
    },

    // Open crate
    openCrate(playerId, crateType) {
        this.initPlayer(playerId);
        const player = this.playerCrates[playerId];

        // Check if player has crate
        if (!player.crates[crateType] || player.crates[crateType] <= 0) {
            return {
                success: false,
                error: 'No crates of this type'
            };
        }

        const crate = this.crateTypes[crateType.toUpperCase()];
        if (!crate) {
            return {
                success: false,
                error: 'Invalid crate type'
            };
        }

        // Deduct crate
        player.crates[crateType]--;

        // Generate rewards (3-5 items)
        const rewardCount = 3 + Math.floor(Math.random() * 3);
        const rewards = [];

        for (let i = 0; i < rewardCount; i++) {
            const reward = this.generateReward(crate);
            rewards.push(reward);
        }

        // Save to history
        player.openHistory.unshift({
            crateType: crateType,
            rewards: rewards,
            timestamp: Date.now()
        });

        // Keep only last 50 openings
        if (player.openHistory.length > 50) {
            player.openHistory.pop();
        }

        return {
            success: true,
            rewards: rewards,
            crateType: crateType
        };
    },

    // Generate single reward
    generateReward(crate) {
        // Select rarity based on weights
        const rarity = this.selectRarity(crate.rarityWeights);

        // Get all rewards of this rarity
        const possibleRewards = Object.values(this.rewardPool).filter(r => r.rarity === rarity);

        if (possibleRewards.length === 0) {
            // Fallback to guaranteed rarity
            const fallbackRewards = Object.values(this.rewardPool).filter(
                r => r.rarity === crate.guaranteedRarity
            );
            return fallbackRewards[Math.floor(Math.random() * fallbackRewards.length)];
        }

        // Select random reward
        return possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
    },

    // Select rarity based on weights
    selectRarity(weights) {
        const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * total;

        for (const [rarity, weight] of Object.entries(weights)) {
            random -= weight;
            if (random <= 0) {
                return rarity;
            }
        }

        return 'common';
    },

    // Purchase crate
    purchaseCrate(playerId, crateType, playerFortz) {
        const crate = this.crateTypes[crateType.toUpperCase()];
        if (!crate) {
            return {
                success: false,
                error: 'Invalid crate type'
            };
        }

        if (playerFortz < crate.cost) {
            return {
                success: false,
                error: 'Insufficient Fortz'
            };
        }

        this.giveCrate(playerId, crateType, 1);

        return {
            success: true,
            cost: crate.cost,
            crateType: crateType
        };
    },

    // Get player crates
    getPlayerCrates(playerId) {
        this.initPlayer(playerId);
        return this.playerCrates[playerId].crates;
    },

    // Get opening history
    getOpenHistory(playerId, limit = 10) {
        this.initPlayer(playerId);
        return this.playerCrates[playerId].openHistory.slice(0, limit);
    },

    // Get crate info
    getCrateInfo(crateType) {
        return this.crateTypes[crateType.toUpperCase()];
    },

    // Get all crate types
    getAllCrateTypes() {
        return Object.values(this.crateTypes);
    }
};

// Export
if (typeof window !== 'undefined') {
    window.LootBoxSystem = LootBoxSystem;
}
