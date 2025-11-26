# 🚀 Quick Start Guide

## Running the Game

The server is now running! Follow these steps:

### 1. Server is Running ✅
The game server is already started on port 5000.

### 2. Open in Browser
Open your web browser and go to:
```
http://localhost:5000
```

### 3. Play the Game!
- Click the **PLAY** button to join a game
- Use **WASD** to move your tank
- Use your **mouse** to aim
- **Left-click** to shoot

## Game Controls

| Key | Action |
|-----|--------|
| W | Move Forward |
| A | Move Left |
| S | Move Backward |
| D | Move Right |
| Mouse | Aim |
| Left Click | Shoot |

## Stopping the Server

To stop the server, press `Ctrl+C` in the terminal.

## Restarting the Server

```bash
npm start
```

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, edit `src/server/server.js` and change:
```javascript
const PORT = process.env.PORT || 5000;
```
to a different port number.

### Can't Connect
Make sure:
1. The server is running (you should see "🎮 TheFortz server running...")
2. Your browser supports WebSockets
3. No firewall is blocking port 5000

## Next Steps

- Customize tank colors in the Locker
- Try different game modes
- Invite friends to play!

Enjoy playing TheFortz! 🎮
