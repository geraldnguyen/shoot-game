// Shooting Game - Main JavaScript

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
            sizeRange: { min: 150, max: 150 },
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
    if (!gameState.isPlaying) return;
    
    dragState.isDragging = true;
    dragState.startX = e.clientX;
    dragState.startY = e.clientY;
    dragState.currentX = e.clientX;
    dragState.currentY = e.clientY;
    dragState.startTime = Date.now();
    
    updateAimLine();
    aimLine.classList.remove('hidden');
}

function handleDragMove(e) {
    if (!dragState.isDragging) return;
    
    dragState.currentX = e.clientX;
    dragState.currentY = e.clientY;
    
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
    
    // Minimum drag distance to shoot
    if (distance > 20) {
        // Normalize and apply force based on speed
        const force = Math.min(speed / 100, 20);
        const angle = Math.atan2(dy, dx);
        
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
}

function startGame(theme) {
    gameState.currentTheme = theme;
    gameState.score = 0;
    gameState.timeLeft = 30;
    gameState.isPlaying = true;
    gameState.targets = [];
    gameState.projectiles = [];
    gameState.blockers = [];
    
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
    finalScoreDisplay.textContent = gameState.score;
    gameOverScreen.classList.remove('hidden');
}

function showMenu() {
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
        
        projectile.x += projectile.vx;
        projectile.y -= projectile.vy;
        projectile.vy -= gravity;
        
        // Remove if out of bounds
        if (projectile.x < -50 || projectile.x > canvas.width + 50 ||
            projectile.y < -50 || projectile.y > canvas.height + 50) {
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
