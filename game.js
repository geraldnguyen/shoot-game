// Shooting Game - Main JavaScript

// Theme definitions
const themes = {
    'shooting-range': {
        name: 'Shooting Range',
        shooter: '🔫',
        target: '🎯',
        projectile: '⚫',
        background: 'range',
        hitSound: 'hit',
        missSound: 'miss'
    },
    'duck-hunting': {
        name: 'Duck Hunting',
        shooter: '🏹',
        target: '🦆',
        projectile: '➡️',
        background: 'pond',
        hitSound: 'quack',
        missSound: 'splash'
    },
    'balloon-shooting': {
        name: 'Balloon Shooting',
        shooter: '👆',
        target: '🎈',
        projectile: '📍',
        background: 'sky',
        hitSound: 'pop',
        missSound: 'whoosh'
    },
    'dart-throwing': {
        name: 'Dart Throwing',
        shooter: '✋',
        target: '🎯',
        projectile: '🎯',
        background: 'pub',
        hitSound: 'thud',
        missSound: 'clatter'
    },
    'football-shootout': {
        name: 'Football Shootout',
        shooter: '🦶',
        target: '🥅',
        projectile: '⚽',
        background: 'stadium',
        hitSound: 'goal',
        missSound: 'crowd'
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
        const customTheme = {
            name: 'Custom',
            shooter: document.getElementById('shooter-select').value,
            target: document.getElementById('target-select').value,
            projectile: document.getElementById('projectile-select').value,
            background: document.getElementById('background-select').value
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
}

function handleDragEnd() {
    if (!dragState.isDragging) return;
    
    dragState.isDragging = false;
    aimLine.classList.add('hidden');
    
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
    
    const shooterRect = shooterElement.getBoundingClientRect();
    const shooterCenterX = shooterRect.left + shooterRect.width / 2;
    const shooterCenterY = shooterRect.top;
    
    aimLine.style.height = `${Math.min(distance, 200)}px`;
    aimLine.style.left = `${shooterCenterX}px`;
    aimLine.style.bottom = `${window.innerHeight - shooterCenterY}px`;
    aimLine.style.transform = `translateX(-50%) rotate(${-angle}rad)`;
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
    
    // Spawn initial targets
    spawnTargets(3);
    
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
        spawnTarget();
    }
}

function spawnTarget() {
    const padding = 60;
    const headerHeight = 60;
    const bottomPadding = 150;
    
    const target = {
        x: padding + Math.random() * (canvas.width - padding * 2),
        y: headerHeight + padding + Math.random() * (canvas.height - headerHeight - padding - bottomPadding),
        size: 40 + Math.random() * 20,
        emoji: gameState.currentTheme.target,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        active: true,
        points: 10
    };
    
    gameState.targets.push(target);
}

function gameLoop() {
    if (!gameState.isPlaying) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw targets
    updateTargets();
    drawTargets();
    
    // Update and draw projectiles
    updateProjectiles();
    drawProjectiles();
    
    // Check collisions
    checkCollisions();
    
    // Ensure minimum targets
    const activeTargets = gameState.targets.filter(t => t.active).length;
    if (activeTargets < 3) {
        spawnTarget();
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
        
        target.x += target.vx;
        target.y += target.vy;
        
        // Bounce off walls
        if (target.x < padding || target.x > canvas.width - padding) {
            target.vx *= -1;
            target.x = Math.max(padding, Math.min(canvas.width - padding, target.x));
        }
        if (target.y < headerHeight + padding || target.y > canvas.height - bottomPadding) {
            target.vy *= -1;
            target.y = Math.max(headerHeight + padding, Math.min(canvas.height - bottomPadding, target.y));
        }
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
        
        gameState.targets.forEach(target => {
            if (!target.active) return;
            
            const dx = projectile.x - target.x;
            const dy = projectile.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const hitRadius = target.size / 2 + 15;
            
            if (distance < hitRadius) {
                // Hit!
                target.active = false;
                projectile.active = false;
                gameState.score += target.points;
                updateScore();
                
                // Visual feedback
                showHitEffect(target.x, target.y);
            }
        });
    });
    
    // Clean up inactive targets
    gameState.targets = gameState.targets.filter(t => t.active);
}

function showHitEffect(x, y) {
    // Create a temporary hit effect
    const effect = document.createElement('div');
    effect.textContent = '+10';
    effect.style.position = 'absolute';
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    effect.style.color = '#FFD700';
    effect.style.fontSize = '24px';
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
