// Shooting Game - Main JavaScript

// ========================================
// Game State Logger and Replay System
// ========================================

// Game Logger class for detailed state logging and replay
const GameLogger = {
    // Current session log
    currentSession: null,
    
    // Last completed session for replay
    lastSession: null,
    
    // Logging enabled flag
    enabled: true,
    
    // Counter for move events (for periodic logging)
    moveEventCount: 0,
    
    // Initialize a new session
    startSession(gameSettings) {
        this.moveEventCount = 0;
        this.currentSession = {
            sessionId: Date.now(),
            startTime: new Date().toISOString(),
            endTime: null,
            gameSettings: {
                canvasWidth: gameSettings.canvasWidth,
                canvasHeight: gameSettings.canvasHeight,
                inputType: gameSettings.inputType,
                theme: {
                    name: gameSettings.theme.name,
                    shooter: gameSettings.theme.shooter,
                    target: gameSettings.theme.target,
                    projectile: gameSettings.theme.projectile,
                    background: gameSettings.theme.background,
                    targetConfig: gameSettings.theme.targetConfig
                },
                gameDuration: gameSettings.gameDuration
            },
            initialState: {
                shooter: null,
                targets: [],
                blockers: []
            },
            events: [],
            finalScore: 0
        };
        
        console.log('%c[GameLogger] New session started', 'color: #4CAF50; font-weight: bold');
        console.log('[GameLogger] Session ID:', this.currentSession.sessionId);
        console.log('[GameLogger] Game Settings:', this.currentSession.gameSettings);
        
        return this.currentSession;
    },
    
    // Log initial game state
    logInitialState(shooter, targets, blockers) {
        if (!this.currentSession || !this.enabled) return;
        
        this.currentSession.initialState = {
            shooter: {
                emoji: shooter.emoji,
                x: shooter.x,
                y: shooter.y
            },
            targets: targets.map(t => ({
                x: t.x,
                y: t.y,
                size: t.size,
                emoji: t.emoji,
                vx: t.vx,
                vy: t.vy,
                behavior: t.behavior,
                scoring: t.scoring
            })),
            blockers: blockers.map(b => ({
                x: b.x,
                y: b.y,
                size: b.size,
                emoji: b.emoji,
                speed: b.speed,
                direction: b.direction
            }))
        };
        
        console.log('%c[GameLogger] Initial State Logged', 'color: #2196F3; font-weight: bold');
        console.log('[GameLogger] Shooter:', this.currentSession.initialState.shooter);
        console.log('[GameLogger] Targets (' + targets.length + '):', this.currentSession.initialState.targets);
        console.log('[GameLogger] Blockers (' + blockers.length + '):', this.currentSession.initialState.blockers);
    },
    
    // Log touch/click start event
    logInputStart(inputData) {
        if (!this.currentSession || !this.enabled) return;
        
        const event = {
            type: 'INPUT_START',
            timestamp: Date.now() - this.currentSession.sessionId,
            data: {
                inputType: inputData.inputType,
                startX: inputData.startX,
                startY: inputData.startY,
                startTime: inputData.startTime
            }
        };
        
        this.currentSession.events.push(event);
        
        console.log('%c[GameLogger] Input Start', 'color: #FF9800');
        console.log('[GameLogger] Type:', inputData.inputType);
        console.log('[GameLogger] Start Position: (' + inputData.startX.toFixed(2) + ', ' + inputData.startY.toFixed(2) + ')');
    },
    
    // Log touch/click movement event
    logInputMove(inputData) {
        if (!this.currentSession || !this.enabled) return;
        
        this.moveEventCount++;
        
        const event = {
            type: 'INPUT_MOVE',
            timestamp: Date.now() - this.currentSession.sessionId,
            data: {
                currentX: inputData.currentX,
                currentY: inputData.currentY,
                dx: inputData.dx,
                dy: inputData.dy
            }
        };
        
        this.currentSession.events.push(event);
        
        // Only log periodically to avoid spam (every 10 move events)
        if (this.moveEventCount % 10 === 1) {
            console.log('%c[GameLogger] Input Move', 'color: #FF9800');
            console.log('[GameLogger] Current: (' + inputData.currentX.toFixed(2) + ', ' + inputData.currentY.toFixed(2) + ')');
            console.log('[GameLogger] Delta: (' + inputData.dx.toFixed(2) + ', ' + inputData.dy.toFixed(2) + ')');
        }
    },
    
    // Log touch/click release event
    logInputEnd(inputData) {
        if (!this.currentSession || !this.enabled) return;
        
        const event = {
            type: 'INPUT_END',
            timestamp: Date.now() - this.currentSession.sessionId,
            data: {
                startX: inputData.startX,
                startY: inputData.startY,
                releaseX: inputData.releaseX,
                releaseY: inputData.releaseY,
                dx: inputData.dx,
                dy: inputData.dy,
                distance: inputData.distance,
                elapsed: inputData.elapsed,
                speed: inputData.speed,
                angle: inputData.angle,
                force: inputData.force,
                shotFired: inputData.shotFired
            }
        };
        
        this.currentSession.events.push(event);
        
        console.log('%c[GameLogger] Input End', 'color: #FF9800; font-weight: bold');
        console.log('[GameLogger] Start: (' + inputData.startX.toFixed(2) + ', ' + inputData.startY.toFixed(2) + ')');
        console.log('[GameLogger] Release: (' + inputData.releaseX.toFixed(2) + ', ' + inputData.releaseY.toFixed(2) + ')');
        console.log('[GameLogger] Movement: dx=' + inputData.dx.toFixed(2) + ', dy=' + inputData.dy.toFixed(2) + ', distance=' + inputData.distance.toFixed(2));
        console.log('[GameLogger] Speed:', inputData.speed.toFixed(2), 'pixels/sec');
        console.log('[GameLogger] Angle:', (inputData.angle * 180 / Math.PI).toFixed(2), 'degrees');
        console.log('[GameLogger] Force:', inputData.force.toFixed(2));
        console.log('[GameLogger] Shot Fired:', inputData.shotFired);
    },
    
    // Log projectile creation
    logProjectileStart(projectile, index) {
        if (!this.currentSession || !this.enabled) return;
        
        const event = {
            type: 'PROJECTILE_START',
            timestamp: Date.now() - this.currentSession.sessionId,
            data: {
                projectileId: index,
                startX: projectile.x,
                startY: projectile.y,
                vx: projectile.vx,
                vy: projectile.vy,
                emoji: projectile.emoji
            }
        };
        
        this.currentSession.events.push(event);
        
        console.log('%c[GameLogger] Projectile Start', 'color: #E91E63; font-weight: bold');
        console.log('[GameLogger] ID:', index);
        console.log('[GameLogger] Start Position: (' + projectile.x.toFixed(2) + ', ' + projectile.y.toFixed(2) + ')');
        console.log('[GameLogger] Velocity: vx=' + projectile.vx.toFixed(2) + ', vy=' + projectile.vy.toFixed(2));
    },
    
    // Log projectile hit
    logProjectileHit(projectile, target, points, distance) {
        if (!this.currentSession || !this.enabled) return;
        
        const event = {
            type: 'PROJECTILE_HIT',
            timestamp: Date.now() - this.currentSession.sessionId,
            data: {
                projectilePosition: { x: projectile.x, y: projectile.y },
                targetPosition: { x: target.x, y: target.y },
                targetEmoji: target.emoji,
                distance: distance,
                points: points,
                currentScore: gameState.score + points
            }
        };
        
        this.currentSession.events.push(event);
        
        console.log('%c[GameLogger] HIT!', 'color: #4CAF50; font-weight: bold; font-size: 14px');
        console.log('[GameLogger] Projectile Final Position: (' + projectile.x.toFixed(2) + ', ' + projectile.y.toFixed(2) + ')');
        console.log('[GameLogger] Target Position: (' + target.x.toFixed(2) + ', ' + target.y.toFixed(2) + ')');
        console.log('[GameLogger] Distance:', distance.toFixed(2));
        console.log('[GameLogger] Points:', points);
        console.log('[GameLogger] New Score:', gameState.score + points);
    },
    
    // Log projectile miss (went out of bounds)
    logProjectileMiss(projectile, reason) {
        if (!this.currentSession || !this.enabled) return;
        
        const event = {
            type: 'PROJECTILE_MISS',
            timestamp: Date.now() - this.currentSession.sessionId,
            data: {
                finalPosition: { x: projectile.x, y: projectile.y },
                reason: reason
            }
        };
        
        this.currentSession.events.push(event);
        
        console.log('%c[GameLogger] MISS', 'color: #f44336; font-weight: bold');
        console.log('[GameLogger] Final Position: (' + projectile.x.toFixed(2) + ', ' + projectile.y.toFixed(2) + ')');
        console.log('[GameLogger] Reason:', reason);
    },
    
    // Log projectile blocked
    logProjectileBlocked(projectile, blocker) {
        if (!this.currentSession || !this.enabled) return;
        
        const event = {
            type: 'PROJECTILE_BLOCKED',
            timestamp: Date.now() - this.currentSession.sessionId,
            data: {
                projectilePosition: { x: projectile.x, y: projectile.y },
                blockerPosition: { x: blocker.x, y: blocker.y },
                blockerEmoji: blocker.emoji
            }
        };
        
        this.currentSession.events.push(event);
        
        console.log('%c[GameLogger] BLOCKED!', 'color: #ff5722; font-weight: bold');
        console.log('[GameLogger] Projectile Position: (' + projectile.x.toFixed(2) + ', ' + projectile.y.toFixed(2) + ')');
        console.log('[GameLogger] Blocker Position: (' + blocker.x.toFixed(2) + ', ' + blocker.y.toFixed(2) + ')');
    },
    
    // Log target spawn
    logTargetSpawn(target, index) {
        if (!this.currentSession || !this.enabled) return;
        
        const event = {
            type: 'TARGET_SPAWN',
            timestamp: Date.now() - this.currentSession.sessionId,
            data: {
                targetId: index,
                x: target.x,
                y: target.y,
                size: target.size,
                emoji: target.emoji,
                vx: target.vx,
                vy: target.vy,
                behavior: target.behavior
            }
        };
        
        this.currentSession.events.push(event);
        
        console.log('%c[GameLogger] Target Spawned', 'color: #9C27B0');
        console.log('[GameLogger] Position: (' + target.x.toFixed(2) + ', ' + target.y.toFixed(2) + ')');
        console.log('[GameLogger] Size:', target.size);
        console.log('[GameLogger] Velocity: vx=' + target.vx.toFixed(2) + ', vy=' + target.vy.toFixed(2));
    },
    
    // Log game frame (for replay - sampled every N frames)
    logGameFrame(frameData) {
        if (!this.currentSession || !this.enabled) return;
        
        const event = {
            type: 'GAME_FRAME',
            timestamp: Date.now() - this.currentSession.sessionId,
            data: {
                targets: frameData.targets.map(t => ({
                    x: t.x,
                    y: t.y,
                    active: t.active
                })),
                projectiles: frameData.projectiles.map(p => ({
                    x: p.x,
                    y: p.y,
                    vx: p.vx,
                    vy: p.vy,
                    active: p.active
                })),
                blockers: frameData.blockers.map(b => ({
                    x: b.x,
                    y: b.y,
                    active: b.active
                })),
                score: frameData.score,
                timeLeft: frameData.timeLeft
            }
        };
        
        this.currentSession.events.push(event);
    },
    
    // End the session
    endSession(finalScore) {
        if (!this.currentSession) return;
        
        this.currentSession.endTime = new Date().toISOString();
        this.currentSession.finalScore = finalScore;
        
        // Store as last session for replay
        // Use structuredClone if available (modern browsers), otherwise fall back to JSON
        // This is safe because session data contains only serializable primitives and objects
        if (typeof structuredClone === 'function') {
            this.lastSession = structuredClone(this.currentSession);
        } else {
            this.lastSession = JSON.parse(JSON.stringify(this.currentSession));
        }
        
        console.log('%c[GameLogger] Session Ended', 'color: #f44336; font-weight: bold');
        console.log('[GameLogger] Final Score:', finalScore);
        console.log('[GameLogger] Total Events:', this.currentSession.events.length);
        console.log('[GameLogger] Session Duration:', 
            (new Date(this.currentSession.endTime) - new Date(this.currentSession.startTime)) / 1000, 'seconds');
        console.log('[GameLogger] Full Session Log:', this.currentSession);
        
        // Store in localStorage for persistence
        try {
            localStorage.setItem('shootGame_lastSession', JSON.stringify(this.lastSession));
        } catch (e) {
            console.warn('[GameLogger] Could not save to localStorage:', e);
        }
        
        return this.lastSession;
    },
    
    // Get last session for replay
    getLastSession() {
        if (this.lastSession) return this.lastSession;
        
        // Try to load from localStorage
        try {
            const stored = localStorage.getItem('shootGame_lastSession');
            if (stored) {
                this.lastSession = JSON.parse(stored);
                return this.lastSession;
            }
        } catch (e) {
            console.warn('[GameLogger] Could not load from localStorage:', e);
        }
        
        return null;
    },
    
    // Check if replay is available
    hasReplayData() {
        return this.getLastSession() !== null;
    },
    
    // Log summary to console
    logSummary() {
        const session = this.getLastSession();
        if (!session) {
            console.log('[GameLogger] No session data available');
            return;
        }
        
        console.log('%c========================================', 'color: #2196F3');
        console.log('%c[GameLogger] SESSION SUMMARY', 'color: #2196F3; font-weight: bold; font-size: 16px');
        console.log('%c========================================', 'color: #2196F3');
        
        console.log('\n%c--- Game Settings ---', 'font-weight: bold');
        console.log('Canvas:', session.gameSettings.canvasWidth + 'x' + session.gameSettings.canvasHeight);
        console.log('Input Type:', session.gameSettings.inputType);
        console.log('Theme:', session.gameSettings.theme.name);
        console.log('Game Duration:', session.gameSettings.gameDuration + 's');
        
        console.log('\n%c--- Initial State ---', 'font-weight: bold');
        console.log('Shooter:', session.initialState.shooter);
        console.log('Targets:', session.initialState.targets.length);
        console.log('Blockers:', session.initialState.blockers.length);
        
        const shots = session.events.filter(e => e.type === 'PROJECTILE_START').length;
        const hits = session.events.filter(e => e.type === 'PROJECTILE_HIT').length;
        const misses = session.events.filter(e => e.type === 'PROJECTILE_MISS').length;
        const blocked = session.events.filter(e => e.type === 'PROJECTILE_BLOCKED').length;
        
        console.log('\n%c--- Statistics ---', 'font-weight: bold');
        console.log('Total Shots:', shots);
        console.log('Hits:', hits, '(' + (shots > 0 ? (hits / shots * 100).toFixed(1) : 0) + '%)');
        console.log('Misses:', misses);
        console.log('Blocked:', blocked);
        console.log('Final Score:', session.finalScore);
        
        console.log('%c========================================', 'color: #2196F3');
    }
};

// ========================================
// Replay System
// ========================================

const ReplaySystem = {
    isReplaying: false,
    replaySession: null,
    replayEventIndex: 0,
    replayStartTime: 0,
    replayFrameId: null,
    replaySpeed: 1,
    
    // Start replay
    startReplay() {
        const session = GameLogger.getLastSession();
        if (!session) {
            console.log('[ReplaySystem] No replay data available');
            return false;
        }
        
        console.log('%c[ReplaySystem] Starting Replay', 'color: #9C27B0; font-weight: bold');
        console.log('[ReplaySystem] Session ID:', session.sessionId);
        
        this.isReplaying = true;
        this.replaySession = session;
        this.replayEventIndex = 0;
        this.replayStartTime = Date.now();
        
        // Initialize replay game state
        this.initReplayState();
        
        // Start replay loop
        this.replayLoop();
        
        return true;
    },
    
    // Initialize replay state
    initReplayState() {
        const session = this.replaySession;
        
        // Reset game state for replay
        gameState.score = 0;
        gameState.timeLeft = session.gameSettings.gameDuration;
        gameState.isPlaying = true;
        gameState.targets = [];
        gameState.projectiles = [];
        gameState.blockers = [];
        gameState.currentTheme = session.gameSettings.theme;
        
        // Set up shooter
        shooterElement.textContent = session.gameSettings.theme.shooter;
        
        // Set background
        gameScreen.className = `bg-${session.gameSettings.theme.background}`;
        
        // Restore initial targets
        session.initialState.targets.forEach(t => {
            gameState.targets.push({
                x: t.x,
                y: t.y,
                size: t.size,
                emoji: t.emoji,
                vx: t.vx,
                vy: t.vy,
                active: true,
                behavior: t.behavior,
                behaviorConfig: targetBehaviors[t.behavior] || targetBehaviors.moving,
                scoring: t.scoring,
                respawns: t.scoring ? t.scoring.type !== 'zones' : true
            });
        });
        
        // Restore initial blockers
        session.initialState.blockers.forEach(b => {
            gameState.blockers.push({
                x: b.x,
                y: b.y,
                size: b.size,
                emoji: b.emoji,
                speed: b.speed,
                direction: b.direction,
                active: true
            });
        });
        
        // Show game screen
        menuScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        updateScore();
        updateTime();
        
        // Show replay indicator
        this.showReplayIndicator();
    },
    
    // Show replay indicator
    showReplayIndicator() {
        let indicator = document.getElementById('replay-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'replay-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 70px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(156, 39, 176, 0.9);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                font-size: 1rem;
                font-weight: bold;
                z-index: 300;
                animation: pulse 1s infinite;
            `;
            
            // Add pulse animation if not exists
            if (!document.getElementById('replay-animation-style')) {
                const style = document.createElement('style');
                style.id = 'replay-animation-style';
                style.textContent = `
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.7; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            gameScreen.appendChild(indicator);
        }
        indicator.textContent = '▶️ REPLAY';
        indicator.style.display = 'block';
    },
    
    // Hide replay indicator
    hideReplayIndicator() {
        const indicator = document.getElementById('replay-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    },
    
    // Replay loop
    replayLoop() {
        if (!this.isReplaying) return;
        
        const currentTime = (Date.now() - this.replayStartTime) * this.replaySpeed;
        
        // Process events up to current time
        while (this.replayEventIndex < this.replaySession.events.length) {
            const event = this.replaySession.events[this.replayEventIndex];
            
            if (event.timestamp > currentTime) break;
            
            this.processReplayEvent(event);
            this.replayEventIndex++;
        }
        
        // Update game state
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateTargets();
        drawTargets();
        updateBlockers();
        drawBlockers();
        updateProjectiles();
        drawProjectiles();
        
        // Check if replay is complete
        if (this.replayEventIndex >= this.replaySession.events.length) {
            // Wait a moment then end replay
            setTimeout(() => this.endReplay(), 1000);
            return;
        }
        
        this.replayFrameId = requestAnimationFrame(() => this.replayLoop());
    },
    
    // Process a replay event
    processReplayEvent(event) {
        switch (event.type) {
            case 'PROJECTILE_START':
                gameState.projectiles.push({
                    x: event.data.startX,
                    y: event.data.startY,
                    vx: event.data.vx,
                    vy: event.data.vy,
                    emoji: event.data.emoji,
                    active: true
                });
                break;
                
            case 'PROJECTILE_HIT':
                gameState.score = event.data.currentScore;
                updateScore();
                showHitEffect(event.data.targetPosition.x, event.data.targetPosition.y, event.data.points);
                break;
                
            case 'PROJECTILE_BLOCKED':
                showBlockEffect(event.data.blockerPosition.x, event.data.blockerPosition.y);
                break;
                
            case 'TARGET_SPAWN':
                gameState.targets.push({
                    x: event.data.x,
                    y: event.data.y,
                    size: event.data.size,
                    emoji: event.data.emoji,
                    vx: event.data.vx,
                    vy: event.data.vy,
                    active: true,
                    behavior: event.data.behavior,
                    behaviorConfig: targetBehaviors[event.data.behavior] || targetBehaviors.moving,
                    respawns: true
                });
                break;
                
            case 'GAME_FRAME':
                gameState.timeLeft = event.data.timeLeft;
                updateTime();
                break;
        }
    },
    
    // End replay
    endReplay() {
        this.isReplaying = false;
        
        if (this.replayFrameId) {
            cancelAnimationFrame(this.replayFrameId);
            this.replayFrameId = null;
        }
        
        this.hideReplayIndicator();
        
        // Show final score
        gameState.score = this.replaySession.finalScore;
        finalScoreDisplay.textContent = gameState.score;
        gameOverScreen.classList.remove('hidden');
        
        console.log('%c[ReplaySystem] Replay Complete', 'color: #9C27B0; font-weight: bold');
    },
    
    // Stop replay
    stopReplay() {
        if (!this.isReplaying) return;
        
        this.isReplaying = false;
        
        if (this.replayFrameId) {
            cancelAnimationFrame(this.replayFrameId);
            this.replayFrameId = null;
        }
        
        this.hideReplayIndicator();
        gameState.isPlaying = false;
    }
};

// Track input type for logging
let currentInputType = 'mouse';

// Frame counter for logging
let frameCounter = 0;
const FRAME_LOG_INTERVAL = 30; // Log every 30 frames (about every 0.5s at 60fps)

// Target behavior configurations (abstracted from theme visuals)
const targetBehaviors = {
    // Moving targets with uniform scoring (like ducks)
    moving: {
        moves: true,
        speedRange: { min: 1, max: 3 },
        respawns: true,
        scoring: { type: 'uniform', basePoints: 10 }
    },
    // Stationary single target with zone scoring (like dartboard)
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
    // Stationary target with blocker (like football goal with goalkeeper)
    guarded: {
        moves: false,
        speedRange: { min: 0, max: 0 },
        respawns: false,
        hasBlocker: true,
        blockerConfig: {
            emoji: '🧤',
            size: 50,
            speed: 3,
            movementRange: 0.4 // 40% of target width
        },
        scoring: { type: 'uniform', basePoints: 20 }
    },
    // Floating targets (like balloons)
    floating: {
        moves: true,
        speedRange: { min: 0.5, max: 1.5 },
        floatUp: true, // Balloons float upward
        respawns: true,
        scoring: { type: 'uniform', basePoints: 10 }
    },
    // Standard stationary target
    stationary: {
        moves: false,
        speedRange: { min: 0, max: 0 },
        respawns: true,
        scoring: { type: 'uniform', basePoints: 10 }
    }
};

// Theme definitions with configurable target properties
const themes = {
    'shooting-range': {
        name: 'Shooting Range',
        shooter: '🔫',
        target: '🎯',
        projectile: '⚫',
        background: 'range',
        hitSound: 'hit',
        missSound: 'miss',
        // Target configuration
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
        // Target configuration
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
        // Target configuration
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
        // Target configuration - single large dartboard
        targetConfig: {
            behavior: 'dartboard',
            count: 1,
            minCount: 1,
            sizeRange: { min: 120, max: 120 },
            fixedPosition: { x: 0.5, y: 0.35 } // Center-top of play area
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
        // Target configuration - single goal with goalkeeper
        targetConfig: {
            behavior: 'guarded',
            count: 1,
            minCount: 1,
            sizeRange: { min: 180, max: 180 },
            fixedPosition: { x: 0.5, y: 0.25 } // Center-top of play area
        }
    }
};

// Game state
let gameState = {
    score: 0,
    timeLeft: 30,
    isPlaying: false,
    currentTheme: null,
    targets: [],
    projectiles: [],
    blockers: [],
    timerInterval: null
};

// Touch/Mouse state for drag shooting
let dragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0
};

// DOM Elements
let canvas, ctx;
let menuScreen, gameScreen, gameOverScreen;
let scoreDisplay, timeDisplay, finalScoreDisplay;
let shooterElement, aimLine;

// Initialize the game
function init() {
    // Get DOM elements
    menuScreen = document.getElementById('menu-screen');
    gameScreen = document.getElementById('game-screen');
    gameOverScreen = document.getElementById('game-over-screen');
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    scoreDisplay = document.getElementById('score-display');
    timeDisplay = document.getElementById('time-display');
    finalScoreDisplay = document.getElementById('final-score');
    shooterElement = document.getElementById('shooter');
    aimLine = document.getElementById('aim-line');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Setup event listeners
    setupEventListeners();
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function setupEventListeners() {
    // Theme selection buttons
    document.querySelectorAll('.theme-btn[data-theme]').forEach(btn => {
        btn.addEventListener('click', () => {
            const themeName = btn.dataset.theme;
            startGame(themes[themeName]);
        });
    });

    // Custom play button
    document.getElementById('play-custom-btn').addEventListener('click', () => {
        const targetCount = parseInt(document.getElementById('target-count-select').value);
        const targetBehavior = document.getElementById('target-behavior-select').value;
        const customTheme = {
            name: 'Custom',
            shooter: document.getElementById('shooter-select').value,
            target: document.getElementById('target-select').value,
            projectile: document.getElementById('projectile-select').value,
            background: document.getElementById('background-select').value,
            targetConfig: {
                behavior: targetBehavior,
                count: targetCount,
                minCount: Math.min(targetCount, 3),
                sizeRange: { min: 40, max: 60 }
            }
        };
        startGame(customTheme);
    });

    // Back button
    document.getElementById('back-btn').addEventListener('click', () => {
        endGame();
        showMenu();
    });

    // Game over buttons
    document.getElementById('play-again-btn').addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        startGame(gameState.currentTheme);
    });

    document.getElementById('menu-btn').addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        showMenu();
    });
    
    // Replay button
    document.getElementById('replay-btn').addEventListener('click', handleReplayClick);

    // Touch/Mouse events for shooting
    setupShootingControls();
}

function setupShootingControls() {
    // Mouse events
    canvas.addEventListener('mousedown', handleDragStart);
    canvas.addEventListener('mousemove', handleDragMove);
    canvas.addEventListener('mouseup', handleDragEnd);
    canvas.addEventListener('mouseleave', handleDragEnd);

    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
}

function handleTouchStart(e) {
    e.preventDefault();
    currentInputType = 'touch';
    const touch = e.touches[0];
    handleDragStart({ clientX: touch.clientX, clientY: touch.clientY });
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragMove({ clientX: touch.clientX, clientY: touch.clientY });
}

function handleTouchEnd(e) {
    e.preventDefault();
    handleDragEnd();
}

function handleDragStart(e) {
    if (!gameState.isPlaying || ReplaySystem.isReplaying) return;
    
    // Track input type for logging
    if (currentInputType !== 'touch') {
        currentInputType = 'mouse';
    }
    
    dragState.isDragging = true;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
    dragState.currentX = e.clientX;
    dragState.currentY = e.clientY;
    dragState.startTime = Date.now();
    
    // Log input start
    GameLogger.logInputStart({
        inputType: currentInputType,
        startX: dragState.startX,
        startY: dragState.startY,
        startTime: dragState.startTime
    });
    
    updateAimLine();
    aimLine.classList.remove('hidden');
}

function handleDragMove(e) {
    if (!dragState.isDragging) return;
    
    const prevX = dragState.currentX;
    const prevY = dragState.currentY;
    
    dragState.currentX = e.clientX;
    dragState.currentY = e.clientY;
    
    // Log input movement
    GameLogger.logInputMove({
        currentX: dragState.currentX,
        currentY: dragState.currentY,
        dx: dragState.currentX - prevX,
        dy: dragState.currentY - prevY
    });
    
    updateAimLine();
    updateShooterRotation();
}

function handleDragEnd() {
    if (!dragState.isDragging) return;
    
    dragState.isDragging = false;
    aimLine.classList.add('hidden');
    
    // Reset shooter rotation
    shooterElement.style.transform = '';
    
    // Calculate direction and force
    const dx = dragState.startX - dragState.currentX;
    const dy = dragState.startY - dragState.currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const elapsed = (Date.now() - dragState.startTime) / 1000;
    const speed = distance / Math.max(elapsed, 0.1);
    const angle = Math.atan2(dy, dx);
    const force = Math.min(speed / 100, 20);
    const shotFired = distance > 20;
    
    // Log input end with calculated values
    GameLogger.logInputEnd({
        startX: dragState.startX,
        startY: dragState.startY,
        releaseX: dragState.currentX,
        releaseY: dragState.currentY,
        dx: dx,
        dy: dy,
        distance: distance,
        elapsed: elapsed,
        speed: speed,
        angle: angle,
        force: force,
        shotFired: shotFired
    });
    
    // Minimum drag distance to shoot
    if (shotFired) {
        shootProjectile(angle, force);
    }
}

function updateAimLine() {
    const dx = dragState.startX - dragState.currentX;
    const dy = dragState.startY - dragState.currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dx, dy);
    
    // Get shooter and shooter-area positions
    const shooterRect = shooterElement.getBoundingClientRect();
    const shooterAreaRect = shooterElement.parentElement.getBoundingClientRect();
    
    // Position aim line relative to shooter-area (its parent)
    const shooterCenterX = shooterRect.left + shooterRect.width / 2 - shooterAreaRect.left;
    const shooterCenterY = shooterRect.top - shooterAreaRect.top;
    
    aimLine.style.height = `${Math.min(distance, 200)}px`;
    aimLine.style.left = `${shooterCenterX}px`;
    aimLine.style.top = `${shooterCenterY}px`;
    aimLine.style.transform = `translateX(-50%) rotate(${-angle}rad)`;
}

function updateShooterRotation() {
    const shooterRect = shooterElement.getBoundingClientRect();
    const shooterCenterX = shooterRect.left + shooterRect.width / 2;
    const shooterCenterY = shooterRect.top + shooterRect.height / 2;
    
    // Calculate angle from shooter to current touch/mouse position
    const dx = dragState.currentX - shooterCenterX;
    const dy = dragState.currentY - shooterCenterY;
    const angle = Math.atan2(dy, dx);
    
    // Convert to degrees and rotate (default orientation is pointing up, so adjust by 90 degrees)
    const degrees = (angle * 180 / Math.PI) + 90;
    shooterElement.style.transform = `rotate(${degrees}deg)`;
}

function shootProjectile(angle, force) {
    const shooterRect = shooterElement.getBoundingClientRect();
    const startX = shooterRect.left + shooterRect.width / 2;
    const startY = shooterRect.top;
    
    const projectile = {
        x: startX,
        y: startY,
        vx: Math.cos(angle) * force * 15,
        vy: Math.sin(angle) * force * 15,
        emoji: gameState.currentTheme.projectile,
        active: true
    };
    
    gameState.projectiles.push(projectile);
    
    // Log projectile start
    GameLogger.logProjectileStart(projectile, gameState.projectiles.length - 1);
}

function startGame(theme) {
    // Stop any ongoing replay
    if (ReplaySystem.isReplaying) {
        ReplaySystem.stopReplay();
    }
    
    gameState.currentTheme = theme;
    gameState.score = 0;
    gameState.timeLeft = 30;
    gameState.isPlaying = true;
    gameState.targets = [];
    gameState.projectiles = [];
    gameState.blockers = [];
    
    // Reset frame counter
    frameCounter = 0;
    
    // Start game logging session
    GameLogger.startSession({
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        inputType: currentInputType,
        theme: theme,
        gameDuration: 30
    });
    
    // Update UI
    shooterElement.textContent = theme.shooter;
    updateScore();
    updateTime();
    
    // Set background
    gameScreen.className = `bg-${theme.background}`;
    
    // Hide menu, show game
    menuScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Start timer
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTime();
        if (gameState.timeLeft <= 0) {
            gameOver();
        }
    }, 1000);
    
    // Get target configuration
    const targetConfig = theme.targetConfig || {
        behavior: 'moving',
        count: 3,
        minCount: 3,
        sizeRange: { min: 40, max: 60 }
    };
    
    // Spawn initial targets based on configuration
    spawnTargets(targetConfig.count);
    
    // Log initial state after targets are spawned
    const shooterRect = shooterElement.getBoundingClientRect();
    GameLogger.logInitialState(
        {
            emoji: theme.shooter,
            x: shooterRect.left + shooterRect.width / 2,
            y: shooterRect.top
        },
        gameState.targets,
        gameState.blockers
    );
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameState.isPlaying = false;
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function gameOver() {
    endGame();
    
    // End logging session and log summary
    GameLogger.endSession(gameState.score);
    GameLogger.logSummary();
    
    finalScoreDisplay.textContent = gameState.score;
    gameOverScreen.classList.remove('hidden');
    
    // Update replay button visibility
    updateReplayButton();
}

function showMenu() {
    // Stop any ongoing replay
    if (ReplaySystem.isReplaying) {
        ReplaySystem.stopReplay();
    }
    
    menuScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${gameState.score}`;
}

function updateTime() {
    timeDisplay.textContent = `Time: ${gameState.timeLeft}`;
}

function spawnTargets(count) {
    for (let i = 0; i < count; i++) {
        spawnTarget(i);
    }
}

function spawnTarget(index = 0) {
    const padding = 60;
    const headerHeight = 60;
    const bottomPadding = 150;
    const playWidth = canvas.width - padding * 2;
    const playHeight = canvas.height - headerHeight - padding - bottomPadding;
    
    const theme = gameState.currentTheme;
    const targetConfig = theme.targetConfig || {
        behavior: 'moving',
        count: 3,
        minCount: 3,
        sizeRange: { min: 40, max: 60 }
    };
    
    const behavior = targetBehaviors[targetConfig.behavior] || targetBehaviors.moving;
    const sizeRange = targetConfig.sizeRange;
    
    // Calculate position
    let x, y;
    if (targetConfig.fixedPosition) {
        x = padding + targetConfig.fixedPosition.x * playWidth;
        y = headerHeight + padding + targetConfig.fixedPosition.y * playHeight;
    } else {
        x = padding + Math.random() * playWidth;
        y = headerHeight + padding + Math.random() * playHeight;
    }
    
    // Calculate size
    const size = sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min);
    
    // Calculate velocity based on behavior
    let vx = 0, vy = 0;
    if (behavior.moves) {
        const speed = behavior.speedRange.min + Math.random() * (behavior.speedRange.max - behavior.speedRange.min);
        if (behavior.floatUp) {
            // Balloons float upward with slight horizontal drift
            vx = (Math.random() - 0.5) * speed;
            vy = -speed; // Negative because canvas y increases downward
        } else {
            // Random direction
            vx = (Math.random() - 0.5) * 2 * speed;
            vy = (Math.random() - 0.5) * 2 * speed;
        }
    }
    
    const target = {
        x,
        y,
        size,
        emoji: theme.target,
        vx,
        vy,
        active: true,
        behavior: targetConfig.behavior,
        behaviorConfig: behavior,
        scoring: behavior.scoring,
        respawns: behavior.respawns,
        hasBlocker: behavior.hasBlocker
    };
    
    gameState.targets.push(target);
    
    // Log target spawn (only during active gameplay, not initial spawn)
    if (GameLogger.currentSession && GameLogger.currentSession.initialState.targets.length > 0) {
        GameLogger.logTargetSpawn(target, gameState.targets.length - 1);
    }
    
    // Spawn blocker if this behavior has one and target doesn't have one yet
    if (behavior.hasBlocker) {
        const existingBlocker = gameState.blockers.find(b => b.parentTarget === target);
        if (!existingBlocker) {
            spawnBlocker(target, behavior.blockerConfig);
        }
    }
}

function spawnBlocker(target, blockerConfig) {
    const blocker = {
        x: target.x,
        y: target.y + target.size * 0.5, // Position in front of target
        size: blockerConfig.size,
        emoji: blockerConfig.emoji,
        speed: blockerConfig.speed,
        direction: 1,
        movementRange: blockerConfig.movementRange,
        parentTarget: target,
        active: true
    };
    
    gameState.blockers.push(blocker);
}

function gameLoop() {
    if (!gameState.isPlaying) return;
    
    // Increment frame counter
    frameCounter++;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw targets
    updateTargets();
    drawTargets();
    
    // Update and draw blockers
    updateBlockers();
    drawBlockers();
    
    // Update and draw projectiles
    updateProjectiles();
    drawProjectiles();
    
    // Check collisions
    checkCollisions();
    
    // Log game frame periodically for replay
    if (frameCounter % FRAME_LOG_INTERVAL === 0) {
        GameLogger.logGameFrame({
            targets: gameState.targets,
            projectiles: gameState.projectiles,
            blockers: gameState.blockers,
            score: gameState.score,
            timeLeft: gameState.timeLeft
        });
    }
    
    // Ensure minimum targets based on configuration
    const targetConfig = gameState.currentTheme.targetConfig || { minCount: 3, behavior: 'moving' };
    const behavior = targetBehaviors[targetConfig.behavior] || targetBehaviors.moving;
    
    if (behavior.respawns) {
        const activeTargets = gameState.targets.filter(t => t.active).length;
        if (activeTargets < targetConfig.minCount) {
            spawnTarget();
        }
    }
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

function updateTargets() {
    const padding = 50;
    const headerHeight = 60;
    const bottomPadding = 150;
    
    gameState.targets.forEach(target => {
        if (!target.active) return;
        
        const behavior = target.behaviorConfig || targetBehaviors.moving;
        
        // Only update position if target moves
        if (behavior.moves) {
            target.x += target.vx;
            target.y += target.vy;
            
            // Handle floating targets (balloons) - respawn when they go off top
            if (behavior.floatUp && target.y < -target.size) {
                // Respawn at bottom
                target.y = canvas.height + target.size;
                target.x = padding + Math.random() * (canvas.width - padding * 2);
            }
            
            // Bounce off walls (horizontal)
            if (target.x < padding || target.x > canvas.width - padding) {
                target.vx *= -1;
                target.x = Math.max(padding, Math.min(canvas.width - padding, target.x));
            }
            
            // Bounce off vertical walls (for non-floating targets)
            if (!behavior.floatUp) {
                if (target.y < headerHeight + padding || target.y > canvas.height - bottomPadding) {
                    target.vy *= -1;
                    target.y = Math.max(headerHeight + padding, Math.min(canvas.height - bottomPadding, target.y));
                }
            }
        }
    });
}

function updateBlockers() {
    gameState.blockers.forEach(blocker => {
        if (!blocker.active || !blocker.parentTarget.active) {
            blocker.active = false;
            return;
        }
        
        // Move blocker back and forth in front of target
        const maxOffset = blocker.parentTarget.size * blocker.movementRange;
        blocker.x += blocker.speed * blocker.direction;
        
        // Reverse direction at edges
        const offset = blocker.x - blocker.parentTarget.x;
        if (Math.abs(offset) > maxOffset) {
            blocker.direction *= -1;
            blocker.x = blocker.parentTarget.x + maxOffset * blocker.direction;
        }
    });
}

function drawBlockers() {
    gameState.blockers.forEach(blocker => {
        if (!blocker.active) return;
        
        ctx.font = `${blocker.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(blocker.emoji, blocker.x, blocker.y);
    });
}

function drawTargets() {
    gameState.targets.forEach(target => {
        if (!target.active) return;
        
        ctx.font = `${target.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(target.emoji, target.x, target.y);
    });
}

function updateProjectiles() {
    const gravity = 0.3;
    
    gameState.projectiles.forEach(projectile => {
        if (!projectile.active) return;
        
        projectile.x -= projectile.vx;
        projectile.y -= projectile.vy;
        projectile.vy -= gravity;
        
        // Remove if out of bounds
        if (projectile.x < -50 || projectile.x > canvas.width + 50 ||
            projectile.y < -50 || projectile.y > canvas.height + 50) {
            // Log projectile miss before deactivating
            let reason = 'out_of_bounds';
            if (projectile.x < -50) reason = 'left_boundary';
            else if (projectile.x > canvas.width + 50) reason = 'right_boundary';
            else if (projectile.y < -50) reason = 'top_boundary';
            else if (projectile.y > canvas.height + 50) reason = 'bottom_boundary';
            
            GameLogger.logProjectileMiss(projectile, reason);
            projectile.active = false;
        }
    });
    
    // Clean up inactive projectiles
    gameState.projectiles = gameState.projectiles.filter(p => p.active);
}

function drawProjectiles() {
    gameState.projectiles.forEach(projectile => {
        if (!projectile.active) return;
        
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(projectile.emoji, projectile.x, projectile.y);
    });
}

function checkCollisions() {
    gameState.projectiles.forEach(projectile => {
        if (!projectile.active) return;
        
        // Check blocker collisions first (blockers block projectiles)
        for (const blocker of gameState.blockers) {
            if (!blocker.active) continue;
            
            const dx = projectile.x - blocker.x;
            const dy = projectile.y - blocker.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const hitRadius = blocker.size / 2 + 10;
            
            if (distance < hitRadius) {
                // Blocked!
                GameLogger.logProjectileBlocked(projectile, blocker);
                projectile.active = false;
                showBlockEffect(blocker.x, blocker.y);
                return; // Don't check targets if blocked
            }
        }
        
        // Check target collisions
        gameState.targets.forEach(target => {
            if (!target.active) return;
            
            const dx = projectile.x - target.x;
            const dy = projectile.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const hitRadius = target.size / 2 + 15;
            
            if (distance < hitRadius) {
                // Hit! Calculate points based on scoring type
                const points = calculateScore(target, distance);
                
                if (points > 0) {
                    // Log hit before updating score
                    GameLogger.logProjectileHit(projectile, target, points, distance);
                    
                    // For non-respawning targets (dartboard, goal), don't deactivate
                    // just award points. For respawning targets, deactivate them.
                    if (target.respawns === false) {
                        // Keep target active but award points
                    } else {
                        target.active = false;
                    }
                    
                    projectile.active = false;
                    gameState.score += points;
                    updateScore();
                    
                    // Visual feedback
                    showHitEffect(target.x, target.y, points);
                }
            }
        });
    });
    
    // Clean up inactive targets (only those that should respawn)
    gameState.targets = gameState.targets.filter(t => t.active || t.respawns === false);
    
    // Clean up inactive blockers
    gameState.blockers = gameState.blockers.filter(b => b.active);
}

function calculateScore(target, distance) {
    const scoring = target.scoring || { type: 'uniform', basePoints: 10 };
    
    if (scoring.type === 'uniform') {
        return scoring.basePoints;
    }
    
    if (scoring.type === 'zones') {
        // Zone-based scoring (like dartboard)
        // Use hit radius for consistent detection
        const hitRadius = target.size / 2 + 15;
        const hitPercent = Math.min(distance / hitRadius, 1.0);
        
        for (const zone of scoring.zones) {
            if (hitPercent <= zone.radiusPercent) {
                return zone.points;
            }
        }
        // Default outer zone
        return scoring.zones[scoring.zones.length - 1].points;
    }
    
    return 10; // Default points
}

function showHitEffect(x, y, points = 10) {
    // Create a temporary hit effect
    const effect = document.createElement('div');
    effect.textContent = `+${points}`;
    effect.style.position = 'absolute';
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    
    // Different colors for different point values
    if (points >= 50) {
        effect.style.color = '#FFD700'; // Gold for bullseye
        effect.style.fontSize = '32px';
    } else if (points >= 30) {
        effect.style.color = '#FFA500'; // Orange for high score
        effect.style.fontSize = '28px';
    } else if (points >= 20) {
        effect.style.color = '#90EE90'; // Light green for medium
        effect.style.fontSize = '26px';
    } else {
        effect.style.color = '#FFFFFF'; // White for basic
        effect.style.fontSize = '24px';
    }
    
    effect.style.fontWeight = 'bold';
    effect.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    effect.style.pointerEvents = 'none';
    effect.style.zIndex = '150';
    effect.style.animation = 'fadeUp 0.5s ease-out forwards';
    
    gameScreen.appendChild(effect);
    
    setTimeout(() => effect.remove(), 500);
}

function showBlockEffect(x, y) {
    const effect = document.createElement('div');
    effect.textContent = '🛑 BLOCKED!';
    effect.style.position = 'absolute';
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    effect.style.color = '#FF4444';
    effect.style.fontSize = '20px';
    effect.style.fontWeight = 'bold';
    effect.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    effect.style.pointerEvents = 'none';
    effect.style.zIndex = '150';
    effect.style.animation = 'fadeUp 0.5s ease-out forwards';
    
    gameScreen.appendChild(effect);
    
    setTimeout(() => effect.remove(), 500);
}

// Update replay button visibility based on available replay data
function updateReplayButton() {
    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
        if (GameLogger.hasReplayData()) {
            replayBtn.style.display = 'inline-block';
        } else {
            replayBtn.style.display = 'none';
        }
    }
}

// Handle replay button click
function handleReplayClick() {
    if (ReplaySystem.isReplaying) {
        return;
    }
    
    gameOverScreen.classList.add('hidden');
    
    if (!ReplaySystem.startReplay()) {
        console.log('[ReplaySystem] Failed to start replay - no data available');
        alert('No replay data available. Play a game first!');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
