/**
 * Seasonal Events System for TheFortz
 * Time-limited events with special rewards
 */

const SeasonalEventSystem = {
    // Event templates
    eventTemplates: {
        HALLOWEEN: {
            id: 'halloween',
            name: 'Spooky Season',
            description: 'Halloween special event',
            theme: {
                colors: ['#FF6600', '#000000', '#9900FF'],
                weather: 'fog',
                music: 'halloween_theme'
            },
            rewards: {
                participation: { fortz: 500, xp: 1000 },
                completion: { fortz: 2000, xp: 5000, item: 'halloween_skin' }
            },
            challenges: [
                { id: 'pumpkin_smash', name: 'Destroy 50 pumpkins', target: 50 },
                { id: 'ghost_hunt', name: 'Eliminate 20 ghost tanks', target: 20 },
                { id: 'candy_collect', name: 'Collect 100 candies', target: 100 }
            ]
        },

        WINTER: {
            id: 'winter',
            name: 'Winter Wonderland',
            description: 'Winter holiday event',
            theme: {
                colors: ['#FFFFFF', '#00BFFF', '#C0C0C0'],
                weather: 'snow',
                music: 'winter_theme'
            },
            rewards: {
                participation: { fortz: 500, xp: 1000 },
                completion: { fortz: 2000, xp: 5000, item: 'winter_skin' }
            },
            challenges: [
                { id: 'snowball_fight', name: 'Hit 30 players with snowballs', target: 30 },
                { id: 'ice_skating', name: 'Travel 10km on ice', target: 10000 },
                { id: 'gift_delivery', name: 'Deliver 25 gifts', target: 25 }
            ]
        },

        SUMMER: {
            id: 'summer',
            name: 'Summer Blast',
            description: 'Summer beach party',
            theme: {
                colors: ['#FFD700', '#00CED1', '#FF6347'],
                weather: 'clear',
                music: 'summer_theme'
            },
            rewards: {
                participation: { fortz: 500, xp: 1000 },
                completion: { fortz: 2000, xp: 5000, item: 'beach_skin' }
            },
            challenges: [
                { id: 'water_fight', name: 'Win 15 water balloon fights', target: 15 },
                { id: 'sandcastle', name: 'Build 10 sandcastles', target: 10 },
                { id: 'surfing', name: 'Surf 5km on waves', target: 5000 }
            ]
        },

        ANNIVERSARY: {
            id: 'anniversary',
            name: 'TheFortz Anniversary',
            description: 'Celebrate the game anniversary',
            theme: {
                colors: ['#FFD700', '#FF1493', '#00FF00'],
                weather: 'clear',
                music: 'celebration_theme'
            },
            rewards: {
                participation: { fortz: 1000, xp: 2000 },
                completion: { fortz: 5000, xp: 10000, item: 'anniversary_legendary' }
            },
            challenges: [
                { id: 'party_wins', name: 'Win 10 matches', target: 10 },
                { id: 'cake_collect', name: 'Collect 50 cake slices', target: 50 },
                { id: 'fireworks', name: 'Launch 100 fireworks', target: 100 }
            ]
        }
    },

    // Active events
    activeEvents: {},

    // Player progress
    playerProgress: {},

    // Start event
    startEvent(eventId, duration = 14 * 24 * 60 * 60 * 1000) { // 14 days default
        const template = this.eventTemplates[eventId.toUpperCase()];
        if (!template) {
            return { success: false, error: 'Invalid event' };
        }

        const event = {
            ...template,
            startTime: Date.now(),
            endTime: Date.now() + duration,
            active: true,
            participants: 0,
            completions: 0
        };

        this.activeEvents[eventId] = event;

        return {
            success: true,
            event: event
        };
    },

    // Join event
    joinEvent(playerId, eventId) {
        const event = this.activeEvents[eventId];
        if (!event) {
            return { success: false, error: 'Event not found' };
        }

        if (!event.active || Date.now() > event.endTime) {
            return { success: false, error: 'Event not active' };
        }

        // Initialize player progress
        if (!this.playerProgress[playerId]) {
            this.playerProgress[playerId] = {};
        }

        if (!this.playerProgress[playerId][eventId]) {
            this.playerProgress[playerId][eventId] = {
                joined: true,
                joinedAt: Date.now(),
                challenges: {},
                completed: false,
                rewardsClaimed: false
            };

            // Initialize challenge progress
            event.challenges.forEach(challenge => {
                this.playerProgress[playerId][eventId].challenges[challenge.id] = {
                    progress: 0,
                    completed: false
                };
            });

            event.participants++;
        }

        return {
            success: true,
            progress: this.playerProgress[playerId][eventId]
        };
    },

    // Update challenge progress
    updateProgress(playerId, eventId, challengeId, amount = 1) {
        const event = this.activeEvents[eventId];
        if (!event) return;

        const playerEvent = this.playerProgress[playerId]?.[eventId];
        if (!playerEvent) return;

        const challenge = playerEvent.challenges[challengeId];
        if (!challenge || challenge.completed) return;

        challenge.progress += amount;

        // Check if challenge completed
        const challengeData = event.challenges.find(c => c.id === challengeId);
        if (challengeData && challenge.progress >= challengeData.target) {
            challenge.completed = true;
            challenge.completedAt = Date.now();

            // Check if all challenges completed
            const allCompleted = Object.values(playerEvent.challenges).every(c => c.completed);
            if (allCompleted && !playerEvent.completed) {
                playerEvent.completed = true;
                playerEvent.completedAt = Date.now();
                event.completions++;

                return {
                    eventCompleted: true,
                    rewards: event.rewards.completion
                };
            }

            return {
                challengeCompleted: true,
                challengeId: challengeId
            };
        }

        return {
            progress: challenge.progress,
            target: challengeData.target
        };
    },

    // Get player event progress
    getProgress(playerId, eventId) {
        return this.playerProgress[playerId]?.[eventId] || null;
    },

    // Get all active events
    getActiveEvents() {
        const now = Date.now();

        return Object.values(this.activeEvents).filter(event =>
            event.active && event.endTime > now
        );
    },

    // Get event leaderboard
    getLeaderboard(eventId, limit = 100) {
        const leaderboard = [];

        Object.entries(this.playerProgress).forEach(([playerId, events]) => {
            if (events[eventId]) {
                const progress = events[eventId];
                const totalProgress = Object.values(progress.challenges)
                    .reduce((sum, c) => sum + c.progress, 0);

                leaderboard.push({
                    playerId: playerId,
                    totalProgress: totalProgress,
                    completed: progress.completed,
                    completedAt: progress.completedAt
                });
            }
        });

        // Sort by completion, then by total progress
        leaderboard.sort((a, b) => {
            if (a.completed !== b.completed) {
                return b.completed - a.completed;
            }
            if (a.completed && b.completed) {
                return a.completedAt - b.completedAt;
            }
            return b.totalProgress - a.totalProgress;
        });

        return leaderboard.slice(0, limit);
    },

    // End event
    endEvent(eventId) {
        const event = this.activeEvents[eventId];
        if (!event) return;

        event.active = false;
        event.endTime = Date.now();

        return {
            success: true,
            participants: event.participants,
            completions: event.completions
        };
    },

    // Get time remaining
    getTimeRemaining(eventId) {
        const event = this.activeEvents[eventId];
        if (!event) return 0;

        return Math.max(0, event.endTime - Date.now());
    }
};

// Export
if (typeof window !== 'undefined') {
    window.SeasonalEventSystem = SeasonalEventSystem;
}
