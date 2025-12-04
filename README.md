# Shoot Game 🎯

A simple shooting game playable on the web with customizable skins and multiple themes.

## 🎮 Play Now

**[Play the game on GitHub Pages](https://geraldnguyen.github.io/shoot-game/)**

## How to Play

1. Visit the game URL above, or open `index.html` in a web browser
2. Select a theme or customize your own skins
3. Use touch/mouse to aim and shoot:
   - Press and hold on the game canvas
   - Drag your finger/mouse to aim (opposite direction of drag)
   - Release to shoot
   - The direction and force depend on your drag movement and speed

## Themes

The game includes 5 pre-configured themes:

- **🎯 Shooting Range** - Classic target practice with a gun
- **🦆 Duck Hunting** - Hunt ducks with a bow and arrow at a pond
- **🎈 Balloon Shooting** - Pop balloons in the sky
- **🎯 Dart Throwing** - Throw darts at a pub dartboard
- **⚽ Football Shootout** - Kick footballs into the goal at a stadium

## Custom Skins

You can independently customize:
- **Shooter** - The character/weapon that shoots
- **Target** - What you're aiming at
- **Projectile** - What gets fired
- **Background** - The game environment

## Features

- Touch and mouse support
- Physics-based projectile motion with gravity
- Moving targets with bounce physics
- 30-second timed gameplay
- Score tracking
- Visual hit effects
- Responsive design for mobile and desktop

## Development

This is a vanilla HTML/CSS/JavaScript game with no dependencies. Simply serve the files with any web server or open `index.html` directly in a browser.

```bash
# Using Python's built-in server
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

## GitHub Pages Setup

This game is configured to automatically deploy to GitHub Pages. To enable it:

### Step 1: Enable GitHub Pages in Repository Settings
1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar under "Code and automation")
3. Under **Build and deployment**:
   - **Source**: Select "GitHub Actions"
4. Click **Save**

### Step 2: Trigger the Deployment
The deployment will automatically run when:
- You push to the `main` branch
- You manually trigger the workflow from the Actions tab

### Step 3: Access Your Game
Once deployed, your game will be available at:
```
https://geraldnguyen.github.io/shoot-game/
```

## License

MIT License
