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

The game includes 5 pre-configured built-in themes:

- **🎯 Shooting Range** - Classic target practice with a gun
- **🦆 Duck Hunting** - Hunt ducks with a bow and arrow at a pond
- **🎈 Balloon Shooting** - Pop balloons in the sky
- **🎯 Dart Throwing** - Throw darts at a pub dartboard
- **⚽ Football Shootout** - Kick footballs into the goal at a stadium

### Custom Themes

The game also supports external custom themes loaded from JSON files:

- **👾 Space Invaders** - Shoot aliens in space with a rocket
- **🧟 Zombie Apocalypse** - Survive the zombie horde in a graveyard

## Externalized Theme System

Themes and game components are now loaded from external JSON files, making it easy to create and share custom themes without modifying the game code.

### Folder Structure

```
themes/
├── built-in/           # Built-in themes and components
│   ├── themes.json     # Built-in theme definitions
│   ├── behaviors.json  # Target behavior configurations
│   └── backgrounds.json # Background definitions
└── custom/             # Custom/packaged themes (separate from game code)
    ├── manifest.json   # List of custom themes to load
    ├── space-invaders.json
    └── zombie-apocalypse.json
```

### Creating a Custom Theme

Create a JSON file in `themes/custom/` with the following structure:

```json
{
    "name": "My Custom Theme",
    "shooter": "🚀",
    "target": "👾",
    "projectile": "⚡",
    "background": "space",
    "targetConfig": {
        "behavior": "moving",
        "count": 6,
        "minCount": 4,
        "sizeRange": { "min": 35, "max": 50 }
    },
    "customBackground": {
        "name": "Space",
        "cssClass": "bg-space",
        "css": "background: linear-gradient(to bottom, #0d0d2b 0%, #1a1a4a 50%, #0d0d2b 100%);"
    }
}
```

Then add the filename to `themes/custom/manifest.json`:

```json
{
    "themes": ["my-custom-theme.json"]
}
```

### Theme Properties

| Property | Description |
|----------|-------------|
| `name` | Display name for the theme |
| `shooter` | Emoji or character for the shooter |
| `target` | Emoji or character for targets |
| `projectile` | Emoji or character for projectiles |
| `background` | Built-in background name or custom background |
| `targetConfig` | Target behavior and spawn configuration |
| `customBackground` | (Optional) Define a custom background with CSS |

### Target Behaviors

Available behaviors in `themes/built-in/behaviors.json`:

- `moving` - Targets move and bounce off walls
- `stationary` - Targets stay in place
- `floating` - Targets float upward (like balloons)
- `dartboard` - Single target with zone-based scoring
- `guarded` - Target protected by a moving blocker

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
- **Externalized theme system** - Load themes from JSON files
- **Custom themes** - Create and share your own themes

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
