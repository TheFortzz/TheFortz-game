
/**
 * Advanced Player Progression System
 * Complete progression with levels, prestige, mastery, and milestones
 */

const PlayerProgressionSystem = {
    players: {},
    
    // Level progression
    levelConfig: {
        baseXP: 100,
        exponentFactor: 1.5,
        maxLevel: 100,
        prestigeUnlockLevel: 50
    },
    
    // Prestige system
    prestigeConfig: {
        maxPrestige: 10,
        bonusPerPrestige: 0.1, // 10% bonus per prestige
        prestigeRewards: {
            1: { fortz: 5000, title: 'Veteran', icon: '⭐' },
            2: { fortz: 10000, title: 'Elite', icon: '🌟' },
            3: { fortz: 20000, title: 'Master', icon: '💫' },
            5: { fortz: 50000, title: 'Legend', icon: '👑' },
            10: { fortz: 100000, title: 'Immortal', icon: '🔥' }
        }
    },
    
    // Weapon mastery
    weaponMastery: {
        maxLevel: 50,
        weapons: {}
    },
    
    // Tank mastery
    tankMastery: {
        maxLevel: 30,
        tanks: {}
    },
    
    // Initialize player
    initPlayer(playerId, playerName) {
        if (!this.players[playerId]) {
            this.players[playerId] = {
                playerId,
                playerName,
                level: 1,
                xp: 0,
                totalXP: 0,
                prestige: 0,
                totalPlayTime: 0,
                stats: {
                    kills: 0,
                    deaths: 0,
                    assists: 0,
                    wins: 0,
                    losses: 0,
                    shotsFired: 0,
                    shotsHit: 0,
                    damageDealt: 0,
                    damageTaken: 0,
                    powerUpsCollected: 0,
                    distanceTraveled: 0
                },
                weaponMastery: {},
                tankMastery: {},
                milestones: [],
                titles: [],
                currentTitle: null,
                badges: []
            };
        }
        return this.players[playerId];
    },
    
    // Add XP
    addXP(playerId, amount, source = 'unknown') {
        const player = this.initPlayer(playerId);
        
        // Apply prestige bonus
        const prestigeBonus = player.prestige * this.prestigeConfig.bonusPerPrestige;
        const bonusXP = Math.floor(amount * prestigeBonus);
        const totalXP = amount + bonusXP;
        
        player.xp += totalXP;
        player.totalXP += totalXP;
        
        // Check for level up
        const levelsGained = [];
        while (player.level < this.levelConfig.maxLevel) {
            const xpNeeded = this.getXPForLevel(player.level);
            
            if (player.xp >= xpNeeded) {
                player.xp -= xpNeeded;
                player.level++;
                levelsGained.push(player.level);
                
                // Level up rewards
                this.grantLevelRewards(playerId, player.level);
                
                // Check milestones
                this.checkMilestones(playerId);
            } else {
                break;
            }
        }
        
        return {
            xpGained: totalXP,
            bonusXP,
            currentLevel: player.level,
            currentXP: player.xp,
            nextLevelXP: this.getXPForLevel(player.level),
            levelsGained
        };
    },
    
    // Calculate XP needed for level
    getXPForLevel(level) {
        return Math.floor(
            this.levelConfig.baseXP * Math.pow(level, this.levelConfig.exponentFactor)
        );
    },
    
    // Prestige
    prestige(playerId) {
        const player = this.players[playerId];
        
        if (!player) return { success: false, error: 'Player not found' };
        if (player.level < this.levelConfig.prestigeUnlockLevel) {
            return { success: false, error: 'Level 50 required' };
        }
        if (player.prestige >= this.prestigeConfig.maxPrestige) {
            return { success: false, error: 'Max prestige reached' };
        }
        
        // Reset level but keep prestige
        player.level = 1;
        player.xp = 0;
        player.prestige++;
        
        // Grant prestige rewards
        const rewards = this.prestigeConfig.prestigeRewards[player.prestige];
        if (rewards) {
            player.titles.push(rewards.title);
            player.badges.push({
                id: `prestige_${player.prestige}`,
                name: rewards.title,
                icon: rewards.icon,
                earnedAt: Date.now()
            });
        }
        
        return {
            success: true,
            newPrestige: player.prestige,
            rewards
        };
    },
    
    // Track weapon usage
    trackWeaponKill(playerId, weaponId) {
        const player = this.initPlayer(playerId);
        
        if (!player.weaponMastery[weaponId]) {
            player.weaponMastery[weaponId] = {
                kills: 0,
                level: 1,
                xp: 0
            };
        }
        
        const mastery = player.weaponMastery[weaponId];
        mastery.kills++;
        mastery.xp += 10;
        
        // Level up weapon mastery
        const xpNeeded = mastery.level * 50;
        if (mastery.xp >= xpNeeded && mastery.level < this.weaponMastery.maxLevel) {
            mastery.xp -= xpNeeded;
            mastery.level++;
            
            return {
                levelUp: true,
                weapon: weaponId,
                newLevel: mastery.level
            };
        }
        
        return { levelUp: false };
    },
    
    // Grant level rewards
    grantLevelRewards(playerId, level) {
        const player = this.players[playerId];
        const rewards = [];
        
        // Fortz rewards every 5 levels
        if (level % 5 === 0) {
            const fortz = level * 100;
            rewards.push({ type: 'fortz', amount: fortz });
        }
        
        // Special rewards
        if (level === 10) rewards.push({ type: 'skin', item: 'level_10_skin' });
        if (level === 25) rewards.push({ type: 'emote', item: 'victory_dance' });
        if (level === 50) rewards.push({ type: 'title', item: 'Veteran' });
        if (level === 100) rewards.push({ type: 'skin', item: 'legendary_max_level' });
        
        return rewards;
    },
    
    // Check and award milestones
    checkMilestones(playerId) {
        const player = this.players[playerId];
        const milestones = [];
        
        // Kill milestones
        if (player.stats.kills === 100 && !player.milestones.includes('kills_100')) {
            player.milestones.push('kills_100');
            milestones.push({ id: 'kills_100', name: 'Centurion', reward: { fortz: 1000 } });
        }
        if (player.stats.kills === 1000 && !player.milestones.includes('kills_1000')) {
            player.milestones.push('kills_1000');
            milestones.push({ id: 'kills_1000', name: 'Destroyer', reward: { fortz: 10000 } });
        }
        
        // Win milestones
        if (player.stats.wins === 50 && !player.milestones.includes('wins_50')) {
            player.milestones.push('wins_50');
            milestones.push({ id: 'wins_50', name: 'Champion', reward: { fortz: 2000 } });
        }
        
        // Distance traveled
        if (player.stats.distanceTraveled >= 100000 && !player.milestones.includes('distance_100k')) {
            player.milestones.push('distance_100k');
            milestones.push({ id: 'distance_100k', name: 'Nomad', reward: { fortz: 1500 } });
        }
        
        return milestones;
    },
    
    // Get player summary
    getPlayerSummary(playerId) {
        const player = this.players[playerId];
        if (!player) return null;
        
        const kdr = player.stats.deaths > 0 ? (player.stats.kills / player.stats.deaths).toFixed(2) : player.stats.kills;
        const accuracy = player.stats.shotsFired > 0 ? ((player.stats.shotsHit / player.stats.shotsFired) * 100).toFixed(1) : 0;
        const winRate = (player.stats.wins + player.stats.losses) > 0 
            ? ((player.stats.wins / (player.stats.wins + player.stats.losses)) * 100).toFixed(1) 
            : 0;
        
        return {
            level: player.level,
            prestige: player.prestige,
            xp: player.xp,
            nextLevelXP: this.getXPForLevel(player.level),
            stats: player.stats,
            kdr,
            accuracy: `${accuracy}%`,
            winRate: `${winRate}%`,
            titles: player.titles,
            currentTitle: player.currentTitle,
            badges: player.badges,
            weaponMastery: player.weaponMastery,
            milestones: player.milestones.length
        };
    },
    
    // Render progression UI
    renderProgressionUI(ctx, canvas, playerId) {
        const player = this.players[playerId];
        if (!player) return;
        
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Background panel
        const x = 20;
        const y = canvas.height - 120;
        const width = 300;
        const height = 100;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#00f7ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Level and prestige
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FFD700';
        const levelText = player.prestige > 0 ? `P${player.prestige} Lv${player.level}` : `Level ${player.level}`;
        ctx.fillText(levelText, x + 10, y + 25);
        
        // XP bar
        const barX = x + 10;
        const barY = y + 35;
        const barWidth = width - 20;
        const barHeight = 20;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const xpProgress = player.xp / this.getXPForLevel(player.level);
        ctx.fillStyle = '#00f7ff';
        ctx.fillRect(barX, barY, barWidth * xpProgress, barHeight);
        
        // XP text
        ctx.font = '12px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(`${player.xp} / ${this.getXPForLevel(player.level)} XP`, barX + barWidth / 2, barY + 14);
        
        // Stats
        ctx.textAlign = 'left';
        ctx.font = '11px Arial';
        const kdr = player.stats.deaths > 0 ? (player.stats.kills / player.stats.deaths).toFixed(2) : player.stats.kills;
        ctx.fillText(`K/D: ${kdr} | Kills: ${player.stats.kills}`, x + 10, y + 70);
        ctx.fillText(`Wins: ${player.stats.wins} | Total XP: ${player.totalXP.toLocaleString()}`, x + 10, y + 88);
        
        ctx.restore();
    }
};

// Initialize
window.PlayerProgressionSystem = PlayerProgressionSystem;
console.log('🎯 Advanced Player Progression System initialized');
