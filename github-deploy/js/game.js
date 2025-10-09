// DRAKORIA - Integrated Game Engine v3.0
// Fully integrated with UI Manager and Storage System

class DrakoriaGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.animationId = null;
        
        // Current game state
        this.currentPlayer = null;
        this.gameWorld = {
            enemies: new Map(),
            npcs: [],
            items: [],
            particles: []
        };
        
        // Game settings
        this.settings = {
            targetFPS: 60,
            worldSize: { width: 1600, height: 1200 },
            debug: true
        };
        
        // Input handling
        this.input = {
            keys: new Set(),
            mouse: { x: 0, y: 0, clicked: false },
            touch: { active: false, x: 0, y: 0 }
        };
        
        // Camera system
        this.camera = {
            x: 0,
            y: 0,
            target: null,
            smoothing: 0.1
        };
        
        // Game timers
        this.timers = {
            lastUpdate: 0,
            enemySpawn: 0,
            autoSave: 0
        };
        
        console.log('🎮 DRAKORIA Game Engine v3.0 inizializzato');
    }

    // Initialize game engine
    init() {
        if (!this.setupCanvas()) {
            console.error('❌ Errore inizializzazione canvas');
            return false;
        }
        
        this.setupInputHandlers();
        this.setupHUD();
        
        console.log('✅ Game engine pronto');
        return true;
    }

    // Load character and start game
    loadCharacter(characterData) {
        console.log('👤 Caricamento personaggio:', characterData.name);
        
        this.currentPlayer = this.createPlayerFromStorage(characterData);
        this.camera.target = this.currentPlayer;
        
        // Center camera on player
        this.camera.x = this.currentPlayer.position.x - window.innerWidth / 2;
        this.camera.y = this.currentPlayer.position.y - window.innerHeight / 2;
        
        // Initialize world
        this.initializeWorld();
        
        // Start game loop
        this.startGame();
        
        // Update HUD with player data
        this.updateHUD();
        
        console.log('✨ Personaggio caricato e gioco avviato');
    }

    createPlayerFromStorage(data) {
        const classData = GameData.classes[data.class];
        
        return {
            // Basic info
            name: data.name,
            class: data.class,
            level: data.level,
            experience: data.experience,
            
            // Stats
            stats: { ...data.stats },
            currentHp: data.currentHp || data.stats.hp,
            currentMp: data.currentMp || data.stats.mp,
            
            // Position and movement
            position: { ...data.position },
            velocity: { x: 0, y: 0 },
            speed: 120, // pixels per second
            
            // Visual
            size: { width: 32, height: 32 },
            color: classData?.color || '#4CAF50',
            
            // Combat
            isAttacking: false,
            attackCooldown: 0,
            skills: classData?.skills || [],
            
            // Animation
            animation: {
                state: 'idle',
                frame: 0,
                timer: 0,
                direction: 'down'
            },
            
            // Inventory
            inventory: [...(data.inventory || [])],
            equipment: { ...data.equipment },
            gold: data.gold || 100
        };
    }

    setupCanvas() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            console.error('❌ Canvas game-canvas non trovato');
            return false;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set initial size
        this.resizeCanvas();
        
        // Handle resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Canvas styling
        this.canvas.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
        
        console.log('🖼️ Canvas configurato:', this.canvas.width, 'x', this.canvas.height);
        return true;
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Update viewport
        this.viewport = {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }

    setupInputHandlers() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.input.keys.add(e.code);
            this.handleKeyPress(e.code);
        });
        
        document.addEventListener('keyup', (e) => {
            this.input.keys.delete(e.code);
        });
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.input.mouse.x = e.clientX - rect.left;
            this.input.mouse.y = e.clientY - rect.top;
            this.input.mouse.clicked = true;
            this.handleMouseClick(this.input.mouse.x, this.input.mouse.y);
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.input.mouse.clicked = false;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.input.mouse.x = e.clientX - rect.left;
            this.input.mouse.y = e.clientY - rect.top;
        });
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.input.touch.x = touch.clientX - rect.left;
            this.input.touch.y = touch.clientY - rect.top;
            this.input.touch.active = true;
            this.handleTouch(this.input.touch.x, this.input.touch.y);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.input.touch.active = false;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                this.input.touch.x = touch.clientX - rect.left;
                this.input.touch.y = touch.clientY - rect.top;
            }
        });
        
        console.log('🎯 Input handlers configurati');
    }

    setupHUD() {
        // HUD elements are handled by the HTML/CSS
        // This method updates the HUD with current player data
        console.log('📊 HUD configurato');
    }

    initializeWorld() {
        // Clear existing enemies
        this.gameWorld.enemies.clear();
        
        // Spawn some initial enemies
        this.spawnInitialEnemies();
        
        console.log('🌍 Mondo inizializzato');
    }

    spawnInitialEnemies() {
        const enemyCount = 8;
        const playerPos = this.currentPlayer.position;
        
        for (let i = 0; i < enemyCount; i++) {
            // Spawn enemies around the player but not too close
            const angle = (Math.PI * 2 * i) / enemyCount;
            const distance = 200 + Math.random() * 300;
            
            const x = playerPos.x + Math.cos(angle) * distance;
            const y = playerPos.y + Math.sin(angle) * distance;
            
            this.spawnEnemy(x, y);
        }
    }

    spawnEnemy(x, y, type = 'slime') {
        const enemyData = GameData.enemies[type];
        if (!enemyData) {
            console.warn('Tipo nemico non trovato:', type);
            return null;
        }
        
        const enemy = {
            id: Date.now() + Math.random(),
            type: type,
            name: enemyData.name,
            position: { x, y },
            velocity: { x: 0, y: 0 },
            
            // Stats from GameData
            stats: { ...enemyData.stats },
            currentHp: enemyData.stats.hp,
            
            // Visual
            size: { width: 28, height: 28 },
            color: enemyData.color || '#ff4444',
            
            // AI
            ai: {
                state: 'wander',
                target: null,
                lastAction: 0,
                aggroRange: enemyData.aggroRange || 100,
                attackRange: enemyData.attackRange || 32
            },
            
            // Combat
            isAttacking: false,
            attackCooldown: 0,
            
            // Animation
            animation: {
                state: 'idle',
                frame: 0,
                timer: 0
            }
        };
        
        this.gameWorld.enemies.set(enemy.id, enemy);
        return enemy;
    }

    startGame() {
        if (this.gameRunning) {
            console.log('⚠️ Gioco già in esecuzione');
            return;
        }
        
        this.gameRunning = true;
        this.timers.lastUpdate = performance.now();
        
        // Start game loop
        const gameLoop = (currentTime) => {
            if (!this.gameRunning) return;
            
            const deltaTime = (currentTime - this.timers.lastUpdate) / 1000;
            this.timers.lastUpdate = currentTime;
            
            this.update(deltaTime);
            this.render();
            
            this.animationId = requestAnimationFrame(gameLoop);
        };
        
        this.animationId = requestAnimationFrame(gameLoop);
        
        console.log('🚀 Gioco avviato');
    }

    stopGame() {
        this.gameRunning = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Save player progress
        this.savePlayerProgress();
        
        console.log('⏹️ Gioco fermato');
    }

    update(deltaTime) {
        if (!this.currentPlayer) return;
        
        // Update player
        this.updatePlayer(deltaTime);
        
        // Update enemies
        this.updateEnemies(deltaTime);
        
        // Update camera
        this.updateCamera(deltaTime);
        
        // Update timers
        this.updateTimers(deltaTime);
        
        // Check collisions
        this.checkCollisions();
        
        // Auto-save every 30 seconds
        this.timers.autoSave += deltaTime;
        if (this.timers.autoSave >= 30) {
            this.savePlayerProgress();
            this.timers.autoSave = 0;
        }
    }

    updatePlayer(deltaTime) {
        const player = this.currentPlayer;
        
        // Handle movement input
        let moveX = 0;
        let moveY = 0;
        
        if (this.input.keys.has('KeyW') || this.input.keys.has('ArrowUp')) moveY -= 1;
        if (this.input.keys.has('KeyS') || this.input.keys.has('ArrowDown')) moveY += 1;
        if (this.input.keys.has('KeyA') || this.input.keys.has('ArrowLeft')) moveX -= 1;
        if (this.input.keys.has('KeyD') || this.input.keys.has('ArrowRight')) moveX += 1;
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707; // 1/sqrt(2)
            moveY *= 0.707;
        }
        
        // Apply movement
        player.velocity.x = moveX * player.speed;
        player.velocity.y = moveY * player.speed;
        
        // Update position
        player.position.x += player.velocity.x * deltaTime;
        player.position.y += player.velocity.y * deltaTime;
        
        // Keep player in world bounds
        const worldSize = this.settings.worldSize;
        player.position.x = Math.max(16, Math.min(worldSize.width - 16, player.position.x));
        player.position.y = Math.max(16, Math.min(worldSize.height - 16, player.position.y));
        
        // Update animation
        if (moveX !== 0 || moveY !== 0) {
            player.animation.state = 'walking';
            if (Math.abs(moveX) > Math.abs(moveY)) {
                player.animation.direction = moveX > 0 ? 'right' : 'left';
            } else {
                player.animation.direction = moveY > 0 ? 'down' : 'up';
            }
        } else {
            player.animation.state = 'idle';
        }
        
        // Update cooldowns
        if (player.attackCooldown > 0) {
            player.attackCooldown -= deltaTime;
        }
    }

    updateEnemies(deltaTime) {
        this.gameWorld.enemies.forEach(enemy => {
            this.updateEnemyAI(enemy, deltaTime);
            
            // Update position
            enemy.position.x += enemy.velocity.x * deltaTime;
            enemy.position.y += enemy.velocity.y * deltaTime;
            
            // Update cooldowns
            if (enemy.attackCooldown > 0) {
                enemy.attackCooldown -= deltaTime;
            }
        });
    }

    updateEnemyAI(enemy, deltaTime) {
        const player = this.currentPlayer;
        const distToPlayer = this.getDistance(enemy.position, player.position);
        
        // Check if player is in aggro range
        if (distToPlayer <= enemy.ai.aggroRange && enemy.ai.state !== 'attacking') {
            enemy.ai.state = 'chasing';
            enemy.ai.target = player;
        }
        
        switch (enemy.ai.state) {
            case 'wander':
                // Random wandering
                if (Date.now() - enemy.ai.lastAction > 2000) {
                    const angle = Math.random() * Math.PI * 2;
                    enemy.velocity.x = Math.cos(angle) * 30;
                    enemy.velocity.y = Math.sin(angle) * 30;
                    enemy.ai.lastAction = Date.now();
                }
                break;
                
            case 'chasing':
                // Chase player
                if (distToPlayer <= enemy.ai.attackRange) {
                    enemy.ai.state = 'attacking';
                } else if (distToPlayer > enemy.ai.aggroRange * 1.5) {
                    enemy.ai.state = 'wander';
                } else {
                    const dx = player.position.x - enemy.position.x;
                    const dy = player.position.y - enemy.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    enemy.velocity.x = (dx / distance) * 50;
                    enemy.velocity.y = (dy / distance) * 50;
                }
                break;
                
            case 'attacking':
                // Attack player
                enemy.velocity.x = 0;
                enemy.velocity.y = 0;
                
                if (distToPlayer > enemy.ai.attackRange) {
                    enemy.ai.state = 'chasing';
                } else if (enemy.attackCooldown <= 0) {
                    this.enemyAttack(enemy, player);
                    enemy.attackCooldown = 1.5;
                }
                break;
        }
    }

    updateCamera(deltaTime) {
        if (!this.camera.target) return;
        
        const targetX = this.camera.target.position.x - this.viewport.width / 2;
        const targetY = this.camera.target.position.y - this.viewport.height / 2;
        
        // Smooth camera follow
        this.camera.x += (targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (targetY - this.camera.y) * this.camera.smoothing;
        
        // Keep camera in world bounds
        const worldSize = this.settings.worldSize;
        this.camera.x = Math.max(0, Math.min(worldSize.width - this.viewport.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(worldSize.height - this.viewport.height, this.camera.y));
    }

    updateTimers(deltaTime) {
        // Spawn new enemies periodically
        this.timers.enemySpawn += deltaTime;
        if (this.timers.enemySpawn >= 10 && this.gameWorld.enemies.size < 15) {
            const player = this.currentPlayer;
            const spawnAngle = Math.random() * Math.PI * 2;
            const spawnDistance = 300 + Math.random() * 200;
            
            const spawnX = player.position.x + Math.cos(spawnAngle) * spawnDistance;
            const spawnY = player.position.y + Math.sin(spawnAngle) * spawnDistance;
            
            this.spawnEnemy(spawnX, spawnY);
            this.timers.enemySpawn = 0;
        }
    }

    render() {
        if (!this.ctx || !this.currentPlayer) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context
        this.ctx.save();
        
        // Apply camera transform
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Render world background
        this.renderBackground();
        
        // Render game objects
        this.renderEnemies();
        this.renderPlayer();
        
        // Restore context
        this.ctx.restore();
        
        // Render UI elements (not affected by camera)
        if (this.settings.debug) {
            this.renderDebugInfo();
        }
    }

    renderBackground() {
        const ctx = this.ctx;
        const worldSize = this.settings.worldSize;
        
        // Simple grid background
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        const gridSize = 50;
        for (let x = 0; x < worldSize.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, worldSize.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < worldSize.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(worldSize.width, y);
            ctx.stroke();
        }
        
        // World border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, worldSize.width, worldSize.height);
    }

    renderPlayer() {
        const player = this.currentPlayer;
        const ctx = this.ctx;
        
        // Player body
        ctx.fillStyle = player.color;
        ctx.fillRect(
            player.position.x - player.size.width / 2,
            player.position.y - player.size.height / 2,
            player.size.width,
            player.size.height
        );
        
        // Player border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            player.position.x - player.size.width / 2,
            player.position.y - player.size.height / 2,
            player.size.width,
            player.size.height
        );
        
        // HP bar above player
        this.renderHealthBar(player.position.x, player.position.y - 25, player.currentHp, player.stats.hp, 30);
        
        // Player name
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.position.x, player.position.y - 35);
    }

    renderEnemies() {
        this.gameWorld.enemies.forEach(enemy => {
            const ctx = this.ctx;
            
            // Enemy body
            ctx.fillStyle = enemy.color;
            ctx.fillRect(
                enemy.position.x - enemy.size.width / 2,
                enemy.position.y - enemy.size.height / 2,
                enemy.size.width,
                enemy.size.height
            );
            
            // Enemy border
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.strokeRect(
                enemy.position.x - enemy.size.width / 2,
                enemy.position.y - enemy.size.height / 2,
                enemy.size.width,
                enemy.size.height
            );
            
            // HP bar
            this.renderHealthBar(enemy.position.x, enemy.position.y - 20, enemy.currentHp, enemy.stats.hp, 25);
        });
    }

    renderHealthBar(x, y, current, max, width) {
        const ctx = this.ctx;
        const height = 4;
        const percentage = current / max;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x - width / 2, y, width, height);
        
        // Health fill
        ctx.fillStyle = percentage > 0.5 ? '#4CAF50' : percentage > 0.25 ? '#FF9800' : '#F44336';
        ctx.fillRect(x - width / 2, y, width * percentage, height);
        
        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - width / 2, y, width, height);
    }

    renderDebugInfo() {
        const ctx = this.ctx;
        const player = this.currentPlayer;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px monospace';
        ctx.textAlign = 'left';
        
        const debugInfo = [
            `Player: ${player.name} (${player.class})`,
            `Position: ${Math.round(player.position.x)}, ${Math.round(player.position.y)}`,
            `Level: ${player.level} | HP: ${player.currentHp}/${player.stats.hp}`,
            `Enemies: ${this.gameWorld.enemies.size}`,
            `Camera: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}`
        ];
        
        debugInfo.forEach((line, index) => {
            ctx.fillText(line, 10, 20 + index * 18);
        });
    }

    // Event Handlers
    handleKeyPress(keyCode) {
        switch (keyCode) {
            case 'Space':
                this.playerAttack();
                break;
            case 'KeyI':
                console.log('Inventory (not implemented)');
                break;
            case 'Escape':
                if (window.UI) {
                    UI.showScreen('characters');
                }
                break;
        }
    }

    handleMouseClick(x, y) {
        // Convert screen coordinates to world coordinates
        const worldX = x + this.camera.x;
        const worldY = y + this.camera.y;
        
        console.log('Click at world position:', worldX, worldY);
        
        // Check if clicking on enemy
        this.gameWorld.enemies.forEach(enemy => {
            const dx = worldX - enemy.position.x;
            const dy = worldY - enemy.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= enemy.size.width / 2) {
                this.playerAttackEnemy(enemy);
            }
        });
    }

    handleTouch(x, y) {
        // Mobile touch handling - move player towards touch point
        const worldX = x + this.camera.x;
        const worldY = y + this.camera.y;
        
        // This could be enhanced with path finding
        console.log('Touch at:', worldX, worldY);
    }

    // Combat System
    playerAttack() {
        const player = this.currentPlayer;
        
        if (player.attackCooldown > 0) {
            console.log('Attack on cooldown');
            return;
        }
        
        // Find nearest enemy in attack range
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        this.gameWorld.enemies.forEach(enemy => {
            const distance = this.getDistance(player.position, enemy.position);
            if (distance <= 60 && distance < nearestDistance) {
                nearestEnemy = enemy;
                nearestDistance = distance;
            }
        });
        
        if (nearestEnemy) {
            this.playerAttackEnemy(nearestEnemy);
        } else {
            console.log('No enemy in range');
        }
    }

    playerAttackEnemy(enemy) {
        const player = this.currentPlayer;
        
        if (player.attackCooldown > 0) return;
        
        // Calculate damage
        const baseDamage = player.stats.attack;
        const damage = Math.floor(baseDamage * (0.8 + Math.random() * 0.4));
        
        // Apply damage
        enemy.currentHp -= damage;
        
        console.log(`${player.name} attacks ${enemy.name} for ${damage} damage!`);
        
        // Check if enemy is defeated
        if (enemy.currentHp <= 0) {
            this.defeatEnemy(enemy);
        }
        
        // Set attack cooldown
        player.attackCooldown = 1.0;
    }

    enemyAttack(enemy, target) {
        const damage = Math.floor(enemy.stats.attack * (0.7 + Math.random() * 0.6));
        target.currentHp -= damage;
        
        console.log(`${enemy.name} attacks ${target.name} for ${damage} damage!`);
        
        if (target.currentHp <= 0) {
            console.log('Player defeated!');
            // Handle player death
            this.handlePlayerDeath();
        }
        
        // Update HUD
        this.updateHUD();
    }

    defeatEnemy(enemy) {
        // Calculate EXP reward
        const expReward = enemy.stats.level * 10;
        this.giveExperience(expReward);
        
        // Remove enemy
        this.gameWorld.enemies.delete(enemy.id);
        
        console.log(`${enemy.name} defeated! +${expReward} EXP`);
    }

    giveExperience(amount) {
        const player = this.currentPlayer;
        player.experience += amount;
        
        // Check for level up
        const requiredExp = GameData.utils.getRequiredExperience(player.level + 1);
        if (player.experience >= requiredExp && player.level < 99) {
            this.levelUp();
        }
        
        this.updateHUD();
    }

    levelUp() {
        const player = this.currentPlayer;
        player.level++;
        
        // Recalculate stats
        player.stats = GameData.utils.calculateStats(player.class, player.level);
        
        // Restore HP/MP
        player.currentHp = player.stats.hp;
        player.currentMp = player.stats.mp;
        
        console.log(`🎉 ${player.name} reached level ${player.level}!`);
        
        if (window.UI) {
            UI.showMessage(`Level Up! Level ${player.level}`, 'success');
        }
        
        this.updateHUD();
    }

    handlePlayerDeath() {
        console.log('💀 Player has died');
        
        // Respawn with half HP
        this.currentPlayer.currentHp = Math.floor(this.currentPlayer.stats.hp / 2);
        
        // Reset position to spawn
        this.currentPlayer.position = { x: 400, y: 300 };
        
        if (window.UI) {
            UI.showMessage('You have died! Respawned with reduced HP.', 'error');
        }
        
        this.updateHUD();
    }

    // Utility Methods
    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    updateHUD() {
        const player = this.currentPlayer;
        if (!player) return;
        
        // Update HP bar
        const hpBar = document.querySelector('.bar-fill.hp');
        if (hpBar) {
            const hpPercentage = (player.currentHp / player.stats.hp) * 100;
            hpBar.style.width = `${hpPercentage}%`;
        }
        
        // Update MP bar
        const mpBar = document.querySelector('.bar-fill.mp');
        if (mpBar) {
            const mpPercentage = (player.currentMp / player.stats.mp) * 100;
            mpBar.style.width = `${mpPercentage}%`;
        }
        
        // Update EXP bar
        const expBar = document.querySelector('.bar-fill.exp');
        if (expBar) {
            const currentExp = player.experience - GameData.utils.getRequiredExperience(player.level);
            const nextExp = GameData.utils.getRequiredExperience(player.level + 1) - GameData.utils.getRequiredExperience(player.level);
            const expPercentage = (currentExp / nextExp) * 100;
            expBar.style.width = `${Math.min(expPercentage, 100)}%`;
        }
        
        // Update level display
        const levelDisplay = document.querySelector('.player-level');
        if (levelDisplay) {
            levelDisplay.textContent = `Lv.${player.level}`;
        }
    }

    savePlayerProgress() {
        if (!this.currentPlayer) return;
        
        // Find which character slot this is
        const characters = Storage.getAllCharacters();
        let slot = null;
        
        for (let i = 1; i <= 4; i++) {
            const char = characters[`slot${i}`];
            if (char && char.name === this.currentPlayer.name) {
                slot = i;
                break;
            }
        }
        
        if (slot) {
            Storage.saveCharacterProgress(slot, this.currentPlayer);
            console.log('💾 Progresso salvato');
        }
    }

    // Cleanup
    destroy() {
        this.stopGame();
        
        // Remove event listeners
        // (In a real implementation, you'd store references and remove them)
        
        console.log('🗑️ Game engine destroyed');
    }
}

// Global game instance
window.Game = new DrakoriaGame();

// Auto-initialize when UI is ready
document.addEventListener('DOMContentLoaded', () => {
    if (Game.init()) {
        console.log('✅ DRAKORIA Game Engine ready');
    }
});

console.log('🎮 DRAKORIA Game System loaded!');