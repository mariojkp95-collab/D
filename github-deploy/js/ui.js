// DRAKORIA - UI Management System
// Gestisce navigazione schermate, animazioni e interazioni utente

class UIManager {
    constructor() {
        this.currentScreen = 'loading';
        this.screens = {};
        this.fadeTransition = false;
        this.mobileDetected = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        console.log('🎮 UI Manager inizializzato');
        console.log('📱 Mobile device:', this.mobileDetected);
        
        this.initializeScreens();
        this.setupEventListeners();
        this.setupMobileFeatures();
    }

    // Initialize screen references
    initializeScreens() {
        this.screens = {
            loading: document.getElementById('loading-screen'),
            login: document.getElementById('login-screen'),
            servers: document.getElementById('server-screen'),
            characters: document.getElementById('character-screen'),
            creation: document.getElementById('creation-screen'),
            game: document.getElementById('game-screen')
        };

        // Validate all screens exist with detailed logging
        console.log('🔍 Cercando schermate...');
        for (const [name, element] of Object.entries(this.screens)) {
            if (!element) {
                console.error(`❌ Schermata mancante: ${name}`);
                console.log(`   -> Cercando elemento con ID: ${name === 'servers' ? 'server-screen' : name === 'characters' ? 'character-screen' : name + '-screen'}`);
            } else {
                console.log(`✅ Schermata trovata: ${name}`, element);
            }
        }

        console.log('📋 Schermate registrate:', Object.keys(this.screens));
        console.log('📋 DOM readyState:', document.readyState);
    }

    // Setup event listeners
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Guest login button
        const guestBtn = document.getElementById('guest-btn');
        if (guestBtn) {
            guestBtn.addEventListener('click', () => this.handleGuestLogin());
            console.log('🎮 Guest login button collegato');
        } else {
            console.warn('⚠️ Guest button non trovato');
        }

        // Back buttons
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleBackButton(e));
            console.log('🔙 Back button collegato:', btn.id);
        });

        // Server cards
        document.querySelectorAll('.server-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleServerSelect(e));
        });

        // Character slots
        document.querySelectorAll('.character-slot').forEach(slot => {
            slot.addEventListener('click', (e) => this.handleCharacterSlot(e));
        });

        // Character creation button
        const createBtn = document.getElementById('creation-create-btn');
        if (createBtn) {
            createBtn.addEventListener('click', (e) => this.handleCharacterCreation(e));
            console.log('✨ Create character button collegato');
        }

        // Class selection - rimosso da qui, sarà inizializzato in initializeCharacterCreation

        // Character name input validation
        const nameInput = document.getElementById('char-name');
        if (nameInput) {
            nameInput.addEventListener('input', () => this.validateCharacterName());
            console.log('📝 Name input collegato');
        } else {
            console.warn('⚠️ Name input non trovato');
        }

        // Debug shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.showScreen('login');
                        console.log('🔧 Debug: Passaggio forzato a login');
                        break;
                    case '2':
                        e.preventDefault();
                        this.showScreen('servers');
                        console.log('🔧 Debug: Passaggio forzato a server');
                        break;
                    case '3':
                        e.preventDefault();
                        this.showScreen('characters');
                        console.log('🔧 Debug: Passaggio forzato a personaggi');
                        break;
                }
            }
        });
        
        console.log('🎯 Event listeners configurati');
        console.log('🔧 Debug shortcuts: Ctrl+1=Login, Ctrl+2=Servers, Ctrl+3=Characters');
    }

    // Setup mobile-specific features
    setupMobileFeatures() {
        if (this.mobileDetected) {
            // Prevent zoom on input focus
            document.addEventListener('touchstart', (e) => {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            });

            // Add mobile class for CSS
            document.body.classList.add('mobile-device');

            // Setup virtual joystick if needed
            this.setupVirtualJoystick();
        }

        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        console.log('📱 Funzionalità mobile configurate');
    }

    // Screen Navigation
    showScreen(screenName, options = {}) {
        const { fade = true, callback = null } = options;
        
        if (!this.screens[screenName]) {
            console.error(`❌ Schermata non trovata: ${screenName}`);
            return;
        }

        const currentElement = this.screens[this.currentScreen];
        const nextElement = this.screens[screenName];

        if (fade && !this.fadeTransition) {
            this.fadeTransition = true;
            
            // Fade out current screen
            if (currentElement) {
                currentElement.style.opacity = '0';
                setTimeout(() => {
                    currentElement.classList.remove('active');
                    currentElement.style.display = 'none';
                    
                    // Fade in next screen
                    nextElement.style.display = 'flex';
                    nextElement.classList.add('active');
                    setTimeout(() => {
                        nextElement.style.opacity = '1';
                        this.fadeTransition = false;
                        if (callback) callback();
                    }, 50);
                }, 300);
            }
        } else {
            // Instant transition
            if (currentElement) {
                currentElement.classList.remove('active');
                currentElement.style.display = 'none';
            }
            
            nextElement.style.display = 'flex';
            nextElement.classList.add('active');
            nextElement.style.opacity = '1';
            
            if (callback) callback();
        }

        this.currentScreen = screenName;
        console.log(`📺 Schermata cambiata: ${screenName}`);

        // Screen-specific initialization
        this.onScreenChange(screenName);
    }

    // Handle screen-specific logic
    onScreenChange(screenName) {
        switch (screenName) {
            case 'loading':
                this.initializeLoading();
                break;
            case 'login':
                this.initializeLogin();
                break;
            case 'servers':
                this.initializeServers();
                break;
            case 'characters':
                this.initializeCharacters();
                break;
            case 'creation':
                this.initializeCharacterCreation();
                break;
            case 'game':
                this.initializeGame();
                break;
        }
    }

    // Screen Initializers
    initializeLoading() {
        console.log('⏳ Inizializzazione loading screen...');
        
        // Check if Storage is available
        if (typeof Storage === 'undefined') {
            console.error('❌ Storage non disponibile, aspetto...');
            this.updateLoadingProgress(10, 'Caricamento sistema storage...');
            // Retry after storage loads
            setTimeout(() => this.initializeLoading(), 500);
            return;
        }
        
        // Simulate loading with progress
        this.updateLoadingProgress(25, 'Inizializzazione nuovo gioco...');
        
        setTimeout(() => {
            this.updateLoadingProgress(50, 'Caricamento dati di gioco...');
            
            setTimeout(() => {
                this.updateLoadingProgress(75, 'Controllo stato utente...');
                
                setTimeout(() => {
                    this.updateLoadingProgress(100, 'Completato!');
                    
                    setTimeout(() => {
                        console.log('� Reset sessione per nuovo inizio...');
                        
                        // Pulisci sempre i dati di login al ricarico per ripartire dal menu
                        Storage.logout();
                        
                        console.log('➡️ Passaggio a schermata login');
                        this.showScreen('login');
                    }, 500);
                }, 400);
            }, 400);
        }, 600);
    }

    updateLoadingProgress(percentage, status) {
        const loadingBar = document.getElementById('loading-bar');
        const loadingStatus = document.getElementById('loading-status');
        
        if (loadingBar) {
            loadingBar.style.width = percentage + '%';
        }
        
        if (loadingStatus) {
            loadingStatus.textContent = status;
        }
        
        console.log(`📊 Loading: ${percentage}% - ${status}`);
    }

    initializeLogin() {
        // Clear previous login data
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        // Focus username field
        setTimeout(() => {
            document.getElementById('username').focus();
        }, 300);
    }

    initializeServers() {
        // Update server status
        this.updateServerStatus();
    }

    initializeCharacters() {
        // Load and display characters
        this.loadCharacterSlots();
    }

    initializeCharacterCreation() {
        // Reset creation form
        this.resetCharacterCreation();
        
        // Initialize class selection events
        console.log('🎯 Inizializzazione eventi selezione classe...');
        document.querySelectorAll('.class-option').forEach(option => {
            // Rimuovi event listener esistenti se presenti
            option.removeEventListener('click', this.classSelectHandler);
            
            // Aggiungi nuovo event listener
            this.classSelectHandler = (e) => this.handleClassSelect(e);
            option.addEventListener('click', this.classSelectHandler);
            console.log('🎯 Event listener aggiunto per classe:', option.dataset.class);
        });
    }

    initializeGame() {
        // Initialize game engine
        if (window.Game) {
            Game.init();
        }
    }

    // Login Handlers
    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (username.length < 3) {
            this.showMessage('Nome utente troppo corto (minimo 3 caratteri)', 'error');
            return;
        }
        
        if (password.length < 4) {
            this.showMessage('Password troppo corta (minimo 4 caratteri)', 'error');
            return;
        }
        
        // Simulate login (in real game would validate with server)
        this.showMessage('Login in corso...', 'info');
        
        setTimeout(() => {
            Storage.setAccount(username, false);
            this.showMessage('Login completato!', 'success');
            this.showScreen('servers');
        }, 1000);
    }

    handleGuestLogin() {
        const guestName = `Guest${Math.floor(Math.random() * 9999)}`;
        
        Storage.setAccount(guestName, true);
        this.showMessage(`Benvenuto ${guestName}!`, 'success');
        
        setTimeout(() => {
            this.showScreen('servers');
        }, 1000);
    }

    // Server Selection
    updateServerStatus() {
        const servers = [
            { id: 'server1', name: 'Drakoria Main', status: 'online', players: Math.floor(Math.random() * 500) + 100 },
            { id: 'server2', name: 'Elven Forest', status: 'online', players: Math.floor(Math.random() * 300) + 50 },
            { id: 'server3', name: 'Dragon Valley', status: 'maintenance', players: 0 },
            { id: 'server4', name: 'Crystal Lake', status: 'online', players: Math.floor(Math.random() * 200) + 25 }
        ];

        servers.forEach(server => {
            const card = document.querySelector(`[data-server="${server.id}"]`);
            if (card) {
                const statusEl = card.querySelector('.server-status');
                const playersEl = card.querySelector('.server-players');
                
                statusEl.textContent = server.status === 'online' ? 'Online' : 'Manutenzione';
                statusEl.className = `server-status ${server.status}`;
                
                if (playersEl) {
                    playersEl.textContent = `${server.players} giocatori`;
                }
            }
        });
    }

    handleServerSelect(e) {
        const serverCard = e.target.closest('.server-card');
        if (!serverCard) return;
        
        const serverId = serverCard.dataset.server;
        const serverStatus = serverCard.querySelector('.server-status').classList.contains('online');
        
        if (!serverStatus) {
            this.showMessage('Server in manutenzione', 'error');
            return;
        }
        
        // Select server
        document.querySelectorAll('.server-card').forEach(card => {
            card.classList.remove('selected');
        });
        serverCard.classList.add('selected');
        
        // Save server selection and proceed
        setTimeout(() => {
            Storage.data.account.selectedServer = serverId;
            Storage.saveData();
            this.showScreen('characters');
        }, 500);
    }

    // Character Management
    loadCharacterSlots() {
        for (let i = 1; i <= 4; i++) {
            const character = Storage.getCharacter(i);
            const slotEl = document.querySelector(`[data-slot="${i}"]`);
            
            if (slotEl) {
                if (character) {
                    // Show character info
                    slotEl.innerHTML = `
                        <div class="character-info">
                            <div class="character-avatar">
                                <img src="assets/sprites/player/${character.class}_idle.png" 
                                     alt="${character.class}" onerror="this.style.display='none'">
                            </div>
                            <div class="character-details">
                                <h3>${character.name}</h3>
                                <p class="character-class">${this.getClassName(character.class)}</p>
                                <p class="character-level">Livello ${character.level}</p>
                            </div>
                            <div class="character-actions">
                                <button class="play-btn" onclick="UI.playCharacter(${i})">Gioca</button>
                                <button class="delete-btn" onclick="UI.deleteCharacterSlot(${i})">✕</button>
                            </div>
                        </div>
                    `;
                } else {
                    // Show empty slot
                    slotEl.innerHTML = `
                        <div class="empty-slot">
                            <div class="create-character">
                                <span class="create-icon">+</span>
                                <p>Crea Personaggio</p>
                            </div>
                        </div>
                    `;
                }
            }
        }
    }

    handleCharacterSlot(e) {
        const slot = e.target.closest('.character-slot');
        if (!slot) return;
        
        const slotNumber = parseInt(slot.dataset.slot);
        const character = Storage.getCharacter(slotNumber);
        
        if (character) {
            // Play with existing character
            this.playCharacter(slotNumber);
        } else {
            // Create new character
            this.currentCreationSlot = slotNumber;
            this.showScreen('creation');
        }
    }

    playCharacter(slot) {
        const character = Storage.getCharacter(slot);
        if (!character) {
            this.showMessage('Personaggio non trovato', 'error');
            return;
        }
        
        this.showMessage(`Caricamento di ${character.name}...`, 'info');
        
        setTimeout(() => {
            // Load character into game
            if (window.Game) {
                Game.loadCharacter(character);
            }
            this.showScreen('game');
        }, 1000);
    }

    deleteCharacterSlot(slot) {
        const character = Storage.getCharacter(slot);
        if (!character) return;
        
        const confirmDelete = confirm(`Sei sicuro di voler eliminare ${character.name}? Questa azione non può essere annullata!`);
        if (confirmDelete) {
            Storage.deleteCharacter(slot);
            this.loadCharacterSlots(); // Refresh display
            this.showMessage('Personaggio eliminato', 'success');
        }
    }

    // Character Creation
    resetCharacterCreation() {
        const nameInput = document.getElementById('char-name');
        if (nameInput) {
            nameInput.value = '';
        }
        document.querySelectorAll('.class-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        this.selectedClass = null;
        this.updateCreateButton();
    }

    handleClassSelect(e) {
        console.log('🎯 handleClassSelect chiamato!', e.target);
        const classOption = e.target.closest('.class-option');
        if (!classOption) {
            console.log('❌ Nessuna class-option trovata');
            return;
        }
        
        console.log('✅ class-option trovata:', classOption.dataset.class);
        
        // Clear previous selection
        document.querySelectorAll('.class-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Select new class
        classOption.classList.add('selected');
        this.selectedClass = classOption.dataset.class;
        
        this.updateCreateButton();
        console.log('🎉 Classe selezionata:', this.selectedClass);
    }

    validateCharacterName() {
        const nameInput = document.getElementById('char-name');
        const name = nameInput.value.trim();
        
        if (name.length === 0) {
            this.clearNameValidation();
            return;
        }
        
        const isValid = Storage.isCharacterNameAvailable(name);
        
        if (isValid) {
            nameInput.classList.remove('invalid');
            nameInput.classList.add('valid');
        } else {
            nameInput.classList.remove('valid');
            nameInput.classList.add('invalid');
        }
        
        this.updateCreateButton();
        return isValid;
    }

    clearNameValidation() {
        const nameInput = document.getElementById('char-name');
        nameInput.classList.remove('valid', 'invalid');
    }

    updateCreateButton() {
        const createBtn = document.getElementById('creation-create-btn');
        const nameInput = document.getElementById('char-name');
        const name = nameInput ? nameInput.value.trim() : '';
        const hasValidName = name.length >= 3 && Storage.isCharacterNameAvailable(name);
        
        if (createBtn) {
            createBtn.disabled = !hasValidName || !this.selectedClass;
            console.log('🔘 Pulsante create:', createBtn.disabled ? 'disabilitato' : 'abilitato');
        }
    }

    handleCharacterCreation(e) {
        e.preventDefault();
        console.log('🎨 Inizio creazione personaggio');
        
        const nameInput = document.getElementById('char-name');
        if (!nameInput) {
            console.error('❌ Input nome non trovato!');
            this.showMessage('Errore nel form di creazione', 'error');
            return;
        }
        
        const characterName = nameInput.value.trim();
        console.log('📋 Nome:', characterName, 'Classe selezionata:', this.selectedClass);
        
        // Validazioni
        if (!characterName) {
            this.showMessage('Inserisci un nome per il personaggio', 'error');
            return;
        }
        
        if (characterName.length < 3) {
            this.showMessage('Il nome deve essere lungo almeno 3 caratteri', 'error');
            return;
        }
        
        if (!this.selectedClass) {
            this.showMessage('Seleziona una classe', 'error');
            return;
        }
        
        if (!Storage.isCharacterNameAvailable(characterName)) {
            this.showMessage('Nome già in uso', 'error');
            return;
        }
        
        console.log('✅ Validazione OK, creo personaggio...');
        
        // Trova il primo slot libero
        const slot = Storage.findFirstEmptySlot();
        if (!slot) {
            this.showMessage('Tutti gli slot personaggio sono occupati', 'error');
            return;
        }
        
        // Crea il personaggio
        const characterData = {
            name: characterName,
            class: this.selectedClass
        };
        
        // Salva il personaggio
        const success = Storage.createCharacter(slot, characterData);
        
        if (success) {
            console.log('🎉 Personaggio creato con successo!');
            this.showMessage(`${characterName} creato con successo!`, 'success');
            
            // Torna alla schermata personaggi per vedere il nuovo personaggio
            setTimeout(() => {
                this.showScreen('characters');
            }, 1500);
        } else {
            this.showMessage('Errore nella creazione del personaggio', 'error');
        }
    }

    // Back button handler
    handleBackButton(e) {
        console.log(`🔙 Back button premuto dalla schermata: ${this.currentScreen}`);
        
        switch (this.currentScreen) {
            case 'servers':
                console.log('📱 Tornando al login...');
                this.showScreen('login');
                break;
            case 'characters':
                console.log('🖥️ Tornando alla selezione server...');
                this.showScreen('servers');
                break;
            case 'creation':
                console.log('👥 Tornando alla selezione personaggi...');
                this.showScreen('characters');
                break;
            case 'game':
                console.log('🎮 Tornando alla selezione personaggi...');
                this.showScreen('characters');
                break;
            default:
                console.log('⚠️ Nessuna azione back definita per:', this.currentScreen);
        }
    }

    // Utility Methods
    getClassName(classKey) {
        const classes = {
            swordsman: 'Spadaccino',
            archer: 'Arciere',
            mage: 'Mago'
        };
        return classes[classKey] || classKey;
    }

    showMessage(message, type = 'info', duration = 3000) {
        // Remove existing messages
        const existingMessage = document.querySelector('.ui-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `ui-message ${type}`;
        messageEl.textContent = message;
        
        // Add to page
        document.body.appendChild(messageEl);
        
        // Auto remove
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, duration);
        
        console.log(`💬 ${type.toUpperCase()}: ${message}`);
    }

    // Virtual Joystick (for mobile)
    setupVirtualJoystick() {
        // This would be expanded for actual mobile joystick functionality
        console.log('🕹️ Virtual joystick setup (placeholder)');
    }

    // Utility for responsive design
    isMobile() {
        return this.mobileDetected || window.innerWidth <= 768;
    }

    // Get current screen
    getCurrentScreen() {
        return this.currentScreen;
    }
}

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.UI = new UIManager();
        console.log('🎮 Sistema UI inizializzato (DOM ready)!');
        
        // Start loading sequence
        setTimeout(() => {
            if (UI.currentScreen === 'loading') {
                UI.initializeLoading();
            }
        }, 100);
    });
} else {
    // DOM already loaded
    window.UI = new UIManager();
    console.log('🎮 Sistema UI inizializzato (DOM already loaded)!');
    
    // Start loading sequence
    setTimeout(() => {
        if (UI.currentScreen === 'loading') {
            UI.initializeLoading();
        }
    }, 100);
}
