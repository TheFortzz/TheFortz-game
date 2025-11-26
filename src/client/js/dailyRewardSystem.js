/**
 * Daily Rewards System for TheFortz
 * Daily login rewards and streak bonuses
 */

const DailyRewardSystem = {
    // Reward calendar (7 days)
    rewardCalendar: [
        {
            day: 1,
            rewards: { fortz: 100, xp: 200 },
            icon: '💰'
        },
        {
            day: 2,
            rewards: { fortz: 150, xp: 300 },
            icon: '💎'
        },
        {
            day: 3,
            rewards: { fortz: 200, xp: 400, item: 'common_crate' },
            icon: '📦'
        },
        {
            day: 4,
            rewards: { fortz: 250, xp: 500 },
            icon: '🎁'
        },
        {
            day: 5,
            rewards: { fortz: 300, xp: 600, item: 'rare_crate' },
            icon: '🎪'
        },
        {
            day: 6,
            rewards: { fortz: 400, xp: 800 },
            icon: '💫'
        },
        {
            day: 7,
            rewards: { fortz: 1000, xp: 2000, item: 'epic_crate' },
            icon: '🏆'
        }
    },

    // Streak bonuses
    streakBonuses: {
        7: { fortz: 500, xp: 1000, name: '7-Day Streak' },
        14: { fortz: 1500, xp: 3000, name: '14-Day Streak' },
        30: { fortz: 5000, xp: 10000, name: '30-Day Streak', item: 'legendary_crate' },
        100: { fortz: 20000, xp: 50000, name: '100-Day Streak', item: 'ultimate_crate' }
    },

    // Player data
    playerData: {},

    // Initialize player
    initPlayer(playerId) {
        if (!this.playerData[playerId]) {
            this.playerData[playerId] = {
                lastClaimDate: null,
                currentStreak: 0,
                longestStreak: 0,
                totalClaims: 0,
                claimHistory: []
            };
        }
    },

        // Check if reward is available
        canClaimReward(playerId) {
    this.initPlayer(playerId);
    const player = this.playerData[playerId];

    if (!player.lastClaimDate) return true;

    const today = this.getToday();
    const lastClaim = new Date(player.lastClaimDate).toDateString();

    return today !== lastClaim;
},

// Get current day in cycle
getCurrentDay(playerId) {
    this.initPlayer(playerId);
    const player = this.playerData[playerId];

    if (player.currentStreak === 0) return 1;

    return ((player.currentStreak - 1) % 7) + 1;
},

// Claim daily reward
claimReward(playerId) {
    this.initPlayer(playerId);
    const player = this.playerData[playerId];

    if (!this.canClaimReward(playerId)) {
        return {
            success: false,
            error: 'Already claimed today'
        };
    }

    const today = this.getToday();
    const yesterday = this.getYesterday();
    const lastClaim = player.lastClaimDate ? new Date(player.lastClaimDate).toDateString() : null;

    // Update streak
    if (lastClaim === yesterday) {
        // Consecutive day
        player.currentStreak++;
    } else if (lastClaim === today) {
        // Already claimed today
        return {
            success: false,
            error: 'Already claimed today'
        };
    } else {
        // Streak broken
        player.currentStreak = 1;
    }

    // Update longest streak
    player.longestStreak = Math.max(player.longestStreak, player.currentStreak);

    // Get current day reward
    const currentDay = this.getCurrentDay(playerId);
    const dayReward = this.rewardCalendar[currentDay - 1];

    // Check for streak bonus
    const streakBonus = this.streakBonuses[player.currentStreak];

    // Combine rewards
    const totalRewards = { ...dayReward.rewards };
    if (streakBonus) {
        totalRewards.fortz = (totalRewards.fortz || 0) + streakBonus.fortz;
        totalRewards.xp = (totalRewards.xp || 0) + streakBonus.xp;
        if (streakBonus.item) {
            totalRewards.bonusItem = streakBonus.item;
        }
    }

    // Update player data
    player.lastClaimDate = Date.now();
    player.totalClaims++;
    player.claimHistory.push({
        date: Date.now(),
        day: currentDay,
        streak: player.currentStreak,
        rewards: totalRewards
    });

    // Keep only last 30 claims
    if (player.claimHistory.length > 30) {
        player.claimHistory.shift();
    }

    return {
        success: true,
        day: currentDay,
        streak: player.currentStreak,
        rewards: totalRewards,
        streakBonus: streakBonus
    };
},

// Get reward preview
getRewardPreview(playerId) {
    this.initPlayer(playerId);
    const currentDay = this.getCurrentDay(playerId);
    const player = this.playerData[playerId];

    const preview = [];

    // Show all 7 days
    for (let i = 0; i < 7; i++) {
        const day = this.rewardCalendar[i];
        preview.push({
            ...day,
            claimed: i < currentDay - 1,
            current: i === currentDay - 1,
            locked: i > currentDay - 1
        });
    }

    return {
        calendar: preview,
        currentStreak: player.currentStreak,
        longestStreak: player.longestStreak,
        canClaim: this.canClaimReward(playerId),
        nextStreakBonus: this.getNextStreakBonus(player.currentStreak)
    };
},

// Get next streak bonus
getNextStreakBonus(currentStreak) {
    const bonusStreaks = Object.keys(this.streakBonuses).map(Number).sort((a, b) => a - b);

    for (const streak of bonusStreaks) {
        if (streak > currentStreak) {
            return {
                streak: streak,
                daysUntil: streak - currentStreak,
                bonus: this.streakBonuses[streak]
            };
        }
    }

    return null;
},

// Get player stats
getPlayerStats(playerId) {
    this.initPlayer(playerId);
    const player = this.playerData[playerId];

    return {
        currentStreak: player.currentStreak,
        longestStreak: player.longestStreak,
        totalClaims: player.totalClaims,
        lastClaimDate: player.lastClaimDate,
        canClaimToday: this.canClaimReward(playerId)
    };
},

// Utility functions
getToday() {
    return new Date().toDateString();
},

getYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toDateString();
},

// Save to localStorage
save(playerId) {
    this.initPlayer(playerId);
    localStorage.setItem(`dailyRewards_${playerId}`, JSON.stringify(this.playerData[playerId]));
},

// Load from localStorage
load(playerId) {
    const data = localStorage.getItem(`dailyRewards_${playerId}`);
    if (data) {
        this.playerData[playerId] = JSON.parse(data);
    }
}
};

// Export
if (typeof window !== 'undefined') {
    window.DailyRewardSystem = DailyRewardSystem;
}
