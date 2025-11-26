// Friends System - HTML/JS Based
window.friendsList = [
    { id: 1, username: 'WarriorX', level: 15, status: 'online', avatar: '🎮' },
    { id: 2, username: 'TankMaster', level: 22, status: 'online', avatar: '🎯' },
    { id: 3, username: 'ShadowKnight', level: 8, status: 'offline', avatar: '⚔️' },
    { id: 4, username: 'BattleAce', level: 30, status: 'in-game', avatar: '🏆' },
    { id: 5, username: 'NinjaStrike', level: 12, status: 'online', avatar: '🥷' }
];

function startFriendsRendering() {
    createFriendsInterface();
}

function createFriendsInterface() {
    const container = document.getElementById('friendsButtons');
    if (!container) return;

    container.innerHTML = '';
    container.classList.remove('hidden');

    const friendsPanel = document.createElement('div');
    friendsPanel.className = 'friends-panel';
    friendsPanel.innerHTML = `
        <div class="friends-header">
            <h2 class="friends-title">👥 FRIENDS</h2>
            <button class="friends-close-btn" onclick="window.closeCurrentFeature()">✕</button>
        </div>
        
        <div class="friends-search-bar">
            <input type="text" id="friendSearchInput" placeholder="🔍 Search friends or add new..." class="friends-search-input">
            <button class="friends-add-btn" onclick="addFriend()">+ Add</button>
        </div>

        <div class="friends-tabs">
            <button class="friends-tab active" onclick="switchFriendsTab('all')">All Friends</button>
            <button class="friends-tab" onclick="switchFriendsTab('online')">Online</button>
            <button class="friends-tab" onclick="switchFriendsTab('pending')">Pending</button>
        </div>

        <div class="friends-list" id="friendsListContainer">
            <!-- Friends will be dynamically added here -->
        </div>
    `;

    container.appendChild(friendsPanel);
    renderFriendsList();
}

function renderFriendsList(filter = 'all') {
    const listContainer = document.getElementById('friendsListContainer');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    let filteredFriends = window.friendsList;
    if (filter === 'online') {
        filteredFriends = window.friendsList.filter(f => f.status === 'online' || f.status === 'in-game');
    }

    if (filteredFriends.length === 0) {
        listContainer.innerHTML = '<div class="friends-empty">No friends to display</div>';
        return;
    }

    filteredFriends.forEach(friend => {
        const friendCard = document.createElement('div');
        friendCard.className = 'friend-card';

        const statusClass = friend.status === 'online' ? 'status-online' :
            friend.status === 'in-game' ? 'status-ingame' : 'status-offline';

        friendCard.innerHTML = `
            <div class="friend-avatar">${friend.avatar}</div>
            <div class="friend-info">
                <div class="friend-name">${friend.username}</div>
                <div class="friend-level">Level ${friend.level}</div>
            </div>
            <div class="friend-status ${statusClass}">${friend.status}</div>
            <div class="friend-actions">
                <button class="friend-action-btn invite-btn" onclick="inviteToParty('${friend.username}')" title="Invite to Party">🎮</button>
                <button class="friend-action-btn message-btn" onclick="messageFriend('${friend.username}')" title="Send Message">💬</button>
                <button class="friend-action-btn remove-btn" onclick="removeFriend(${friend.id})" title="Remove Friend">🗑️</button>
            </div>
        `;

        listContainer.appendChild(friendCard);
    });
}

function switchFriendsTab(tab) {
    const tabs = document.querySelectorAll('.friends-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    renderFriendsList(tab);
}

function addFriend() {
    const input = document.getElementById('friendSearchInput');
    const username = input.value.trim();

    if (!username) {
        alert('Please enter a username to add');
        return;
    }

    const exists = window.friendsList.find(f => f.username.toLowerCase() === username.toLowerCase());
    if (exists) {
        alert('This user is already your friend!');
        return;
    }

    const newFriend = {
        id: window.friendsList.length + 1,
        username: username,
        level: Math.floor(Math.random() * 30) + 1,
        status: 'offline',
        avatar: '👤'
    };

    window.friendsList.push(newFriend);
    input.value = '';
    renderFriendsList();

    console.log(`Friend request sent to ${username}`);
}

function inviteToParty(username) {
    const friend = window.friendsList.find(f => f.username === username);
    if (!friend) return;

    if (friend.status === 'offline') {
        alert(`${username} is offline and cannot be invited`);
        return;
    }

    if (window.partyMembers && window.partyMembers.length >= 2) {
        alert('Party is full! (Maximum 3 players including you)');
        return;
    }

    console.log(`Inviting ${username} to party`);
    alert(`Party invite sent to ${username}!`);
}

function messageFriend(username) {
    console.log(`Opening chat with ${username}`);
    alert(`Message feature coming soon! Chat with ${username}`);
}

function removeFriend(friendId) {
    const friend = window.friendsList.find(f => f.id === friendId);
    if (!friend) return;

    const confirmed = confirm(`Remove ${friend.username} from friends?`);
    if (confirmed) {
        window.friendsList = window.friendsList.filter(f => f.id !== friendId);
        renderFriendsList();
        console.log(`Removed friend: ${friend.username}`);
    }
}

function stopFriendsRendering() {
    const container = document.getElementById('friendsButtons');
    if (container) {
        container.classList.add('hidden');
    }
}

// Party System Functions
window.partyMembers = []; // Store party member data

// For testing: Add demo party members
window.addDemoPartyMember = function () {
    const demoMembers = [
        { username: 'Player1', level: 5, selectedTank: { color: 'camo', body: 'body_tracks', weapon: 'turret_01_mk2' } },
        { username: 'Player2', level: 8, selectedTank: { color: 'red', body: 'body_halftrack', weapon: 'turret_02_mk3' } }
    ];

    if (window.partyMembers.length < 2) {
        window.partyMembers.push(demoMembers[window.partyMembers.length]);
        updatePartyDisplay();
        console.log('Added demo party member:', demoMembers[window.partyMembers.length - 1]);
    }
};

window.showPartyInviteMenu = function () {
    // Open friends modal to invite someone
    if (typeof window.openFriendsModal === 'function') {
        window.openFriendsModal();
    } else {
        console.log('Opening friends system for party invites');
        // Show a message or open the friends system
        alert('Party Invite System:\n\n• Click Friends button to add friends\n• Once you have friends, invite them here!\n• Play together and share rewards');
    }
};

window.kickPartyMember = function (slotNumber) {
    console.log(`Kicking party member from slot ${slotNumber}`);

    if (window.partyMembers && window.partyMembers[slotNumber - 1]) {
        const member = window.partyMembers[slotNumber - 1];
        const confirmed = confirm(`Kick ${member.username} from the party?`);

        if (confirmed) {
            // TODO: Call backend API to kick member
            window.partyMembers.splice(slotNumber - 1, 1);
            updatePartyDisplay();
            console.log('Party member kicked');
        }
    }
};

window.leaveParty = function () {
    console.log('Leaving party');

    const confirmed = confirm('Leave the party?');
    if (confirmed) {
        // TODO: Call backend API to leave party
        window.partyMembers = [];
        updatePartyDisplay();

        // Hide leave party button
        const leaveBtn = document.getElementById('leavePartyBtn');
        if (leaveBtn) leaveBtn.classList.add('hidden');

        console.log('Left party');
    }
};

// Update party display in lobby
function updatePartyDisplay() {
    // Clear all party slots
    for (let i = 1; i <= 2; i++) {
        const inviteBtn = document.getElementById(`inviteBtn${i}`);
        const memberInfo = document.getElementById(`partyMember${i}Info`);
        const kickBtn = document.getElementById(`kickBtn${i}`);

        if (inviteBtn) inviteBtn.classList.add('hidden');
        if (memberInfo) memberInfo.classList.add('hidden');
        if (kickBtn) kickBtn.classList.add('hidden');
    }

    // Show party members if any
    if (window.partyMembers && window.partyMembers.length > 0) {
        window.partyMembers.forEach((member, index) => {
            const slotNumber = index + 1;
            if (slotNumber > 2) return; // Only 2 slots

            const inviteBtn = document.getElementById(`inviteBtn${slotNumber}`);
            const memberInfo = document.getElementById(`partyMember${slotNumber}Info`);
            const kickBtn = document.getElementById(`kickBtn${slotNumber}`);

            if (inviteBtn) inviteBtn.classList.add('hidden');
            if (memberInfo) {
                memberInfo.classList.remove('hidden');
                const nameSpan = memberInfo.querySelector('.party-member-name');
                const levelSpan = memberInfo.querySelector('.party-member-level');
                if (nameSpan) nameSpan.textContent = member.username;
                if (levelSpan) levelSpan.textContent = `LVL ${member.level}`;
            }
            if (kickBtn) kickBtn.classList.remove('hidden');
        });

        // Show leave party button
        const leaveBtn = document.getElementById('leavePartyBtn');
        if (leaveBtn) leaveBtn.classList.remove('hidden');
    }
}

// Export functions to global scope
window.startFriendsRendering = startFriendsRendering;
window.stopFriendsRendering = stopFriendsRendering;
window.updatePartyDisplay = updatePartyDisplay;
window.addFriend = addFriend;
window.inviteToParty = inviteToParty;
window.messageFriend = messageFriend;
window.removeFriend = removeFriend;
window.switchFriendsTab = switchFriendsTab;