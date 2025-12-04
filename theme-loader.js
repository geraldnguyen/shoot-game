// Theme Loader Module
// Handles loading themes and components from external JSON files

const ThemeLoader = {
    // Cache for loaded data
    cache: {
        behaviors: null,
        backgrounds: null,
        builtInThemes: null,
        customThemes: []
    },

    // Base paths for theme files
    paths: {
        builtIn: 'themes/built-in',
        custom: 'themes/custom'
    },

    // Initialize the theme loader
    async init() {
        try {
            await Promise.all([
                this.loadBehaviors(),
                this.loadBackgrounds(),
                this.loadBuiltInThemes()
            ]);
            await this.discoverCustomThemes();
            console.log('[ThemeLoader] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[ThemeLoader] Initialization failed:', error);
            return false;
        }
    },

    // Load behavior configurations
    async loadBehaviors() {
        try {
            const response = await fetch(`${this.paths.builtIn}/behaviors.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.cache.behaviors = await response.json();
            console.log('[ThemeLoader] Loaded behaviors:', Object.keys(this.cache.behaviors));
            return this.cache.behaviors;
        } catch (error) {
            console.warn('[ThemeLoader] Failed to load behaviors, using defaults:', error);
            this.cache.behaviors = this.getDefaultBehaviors();
            return this.cache.behaviors;
        }
    },

    // Load background configurations
    async loadBackgrounds() {
        try {
            const response = await fetch(`${this.paths.builtIn}/backgrounds.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.cache.backgrounds = await response.json();
            console.log('[ThemeLoader] Loaded backgrounds:', Object.keys(this.cache.backgrounds));
            return this.cache.backgrounds;
        } catch (error) {
            console.warn('[ThemeLoader] Failed to load backgrounds, using defaults:', error);
            this.cache.backgrounds = this.getDefaultBackgrounds();
            return this.cache.backgrounds;
        }
    },

    // Load built-in themes
    async loadBuiltInThemes() {
        try {
            const response = await fetch(`${this.paths.builtIn}/themes.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.cache.builtInThemes = await response.json();
            console.log('[ThemeLoader] Loaded built-in themes:', Object.keys(this.cache.builtInThemes));
            return this.cache.builtInThemes;
        } catch (error) {
            console.warn('[ThemeLoader] Failed to load built-in themes, using defaults:', error);
            this.cache.builtInThemes = this.getDefaultThemes();
            return this.cache.builtInThemes;
        }
    },

    // Discover and load custom themes from the custom folder
    async discoverCustomThemes() {
        // Try to load from a manifest file first
        try {
            const response = await fetch(`${this.paths.custom}/manifest.json`);
            if (response.ok) {
                const manifest = await response.json();
                const customThemes = [];
                for (const themeFile of manifest.themes || []) {
                    const theme = await this.loadCustomTheme(themeFile);
                    if (theme) customThemes.push(theme);
                }
                this.cache.customThemes = customThemes;
                return customThemes;
            }
        } catch (error) {
            // Manifest not found, try loading known custom themes
            console.log('[ThemeLoader] No manifest found, trying known custom themes');
        }

        // Fallback: try to load known custom theme files
        const knownCustomThemes = ['space-invaders.json', 'zombie-apocalypse.json'];
        const customThemes = [];
        
        for (const themeFile of knownCustomThemes) {
            const theme = await this.loadCustomTheme(themeFile);
            if (theme) customThemes.push(theme);
        }
        
        this.cache.customThemes = customThemes;
        console.log('[ThemeLoader] Loaded custom themes:', customThemes.map(t => t.name));
        return customThemes;
    },

    // Load a single custom theme
    async loadCustomTheme(filename) {
        try {
            const response = await fetch(`${this.paths.custom}/${filename}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const theme = await response.json();
            
            // Add theme ID from filename
            theme.id = filename.replace('.json', '');
            theme.isCustom = true;
            
            // Handle custom background if defined
            if (theme.customBackground) {
                // Use the theme's background key for registration
                this.registerCustomBackground(theme.background, theme.customBackground);
            }
            
            return theme;
        } catch (error) {
            console.warn(`[ThemeLoader] Failed to load custom theme ${filename}:`, error);
            return null;
        }
    },

    // Register a custom background CSS class
    registerCustomBackground(backgroundKey, bgConfig) {
        const styleId = `custom-bg-${bgConfig.cssClass}`;
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `.${bgConfig.cssClass} { ${bgConfig.css} }`;
        document.head.appendChild(style);
        
        // Add to backgrounds cache using the theme's background key
        this.cache.backgrounds[backgroundKey] = bgConfig;
    },

    // Get a theme by ID
    getTheme(themeId) {
        // Check built-in themes first
        if (this.cache.builtInThemes && this.cache.builtInThemes[themeId]) {
            return { ...this.cache.builtInThemes[themeId], id: themeId };
        }
        
        // Check custom themes
        const customTheme = this.cache.customThemes.find(t => t.id === themeId);
        if (customTheme) return customTheme;
        
        return null;
    },

    // Get all available themes
    getAllThemes() {
        const themes = [];
        
        // Add built-in themes
        if (this.cache.builtInThemes) {
            for (const [id, theme] of Object.entries(this.cache.builtInThemes)) {
                themes.push({ ...theme, id, isCustom: false });
            }
        }
        
        // Add custom themes
        themes.push(...this.cache.customThemes);
        
        return themes;
    },

    // Get behavior configuration
    getBehavior(behaviorName) {
        if (this.cache.behaviors && this.cache.behaviors[behaviorName]) {
            return this.cache.behaviors[behaviorName];
        }
        return this.getDefaultBehaviors()[behaviorName] || this.getDefaultBehaviors().moving;
    },

    // Get all behaviors
    getAllBehaviors() {
        return this.cache.behaviors || this.getDefaultBehaviors();
    },

    // Get background configuration
    getBackground(backgroundName) {
        if (this.cache.backgrounds && this.cache.backgrounds[backgroundName]) {
            return this.cache.backgrounds[backgroundName];
        }
        return null;
    },

    // Default behaviors (fallback if JSON loading fails)
    getDefaultBehaviors() {
        return {
            moving: {
                moves: true,
                speedRange: { min: 1, max: 3 },
                respawns: true,
                scoring: { type: 'uniform', basePoints: 10 }
            },
            dartboard: {
                moves: false,
                speedRange: { min: 0, max: 0 },
                respawns: false,
                scoring: {
                    type: 'zones',
                    zones: [
                        { radiusPercent: 0.15, points: 50, name: 'bullseye' },
                        { radiusPercent: 0.35, points: 30, name: 'inner' },
                        { radiusPercent: 0.65, points: 20, name: 'middle' },
                        { radiusPercent: 1.0, points: 10, name: 'outer' }
                    ]
                }
            },
            guarded: {
                moves: false,
                speedRange: { min: 0, max: 0 },
                respawns: false,
                hasBlocker: true,
                blockerConfig: {
                    emoji: '🧤',
                    size: 50,
                    speed: 3,
                    movementRange: 0.4
                },
                scoring: { type: 'uniform', basePoints: 20 }
            },
            floating: {
                moves: true,
                speedRange: { min: 0.5, max: 1.5 },
                floatUp: true,
                respawns: true,
                scoring: { type: 'uniform', basePoints: 10 }
            },
            stationary: {
                moves: false,
                speedRange: { min: 0, max: 0 },
                respawns: true,
                scoring: { type: 'uniform', basePoints: 10 }
            }
        };
    },

    // Default backgrounds (fallback if JSON loading fails)
    getDefaultBackgrounds() {
        return {
            range: { name: 'Shooting Range', cssClass: 'bg-range' },
            pond: { name: 'Pond', cssClass: 'bg-pond' },
            sky: { name: 'Sky', cssClass: 'bg-sky' },
            pub: { name: 'Pub', cssClass: 'bg-pub' },
            stadium: { name: 'Stadium', cssClass: 'bg-stadium' }
        };
    },

    // Default themes (fallback if JSON loading fails)
    getDefaultThemes() {
        return {
            'shooting-range': {
                name: 'Shooting Range',
                shooter: '🔫',
                target: '🎯',
                projectile: '⚫',
                background: 'range',
                hitSound: 'hit',
                missSound: 'miss',
                targetConfig: {
                    behavior: 'stationary',
                    count: 3,
                    minCount: 3,
                    sizeRange: { min: 40, max: 60 }
                }
            },
            'duck-hunting': {
                name: 'Duck Hunting',
                shooter: '🏹',
                target: '🦆',
                projectile: '➡️',
                background: 'pond',
                hitSound: 'quack',
                missSound: 'splash',
                targetConfig: {
                    behavior: 'moving',
                    count: 5,
                    minCount: 3,
                    sizeRange: { min: 35, max: 50 }
                }
            },
            'balloon-shooting': {
                name: 'Balloon Shooting',
                shooter: '👆',
                target: '🎈',
                projectile: '📍',
                background: 'sky',
                hitSound: 'pop',
                missSound: 'whoosh',
                targetConfig: {
                    behavior: 'floating',
                    count: 6,
                    minCount: 4,
                    sizeRange: { min: 30, max: 45 }
                }
            },
            'dart-throwing': {
                name: 'Dart Throwing',
                shooter: '✋',
                target: '🎯',
                projectile: '🎯',
                background: 'pub',
                hitSound: 'thud',
                missSound: 'clatter',
                targetConfig: {
                    behavior: 'dartboard',
                    count: 1,
                    minCount: 1,
                    sizeRange: { min: 120, max: 120 },
                    fixedPosition: { x: 0.5, y: 0.35 }
                }
            },
            'football-shootout': {
                name: 'Football Shootout',
                shooter: '🦶',
                target: '🥅',
                projectile: '⚽',
                background: 'stadium',
                hitSound: 'goal',
                missSound: 'crowd',
                targetConfig: {
                    behavior: 'guarded',
                    count: 1,
                    minCount: 1,
                    sizeRange: { min: 180, max: 180 },
                    fixedPosition: { x: 0.5, y: 0.25 }
                }
            }
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeLoader;
}
