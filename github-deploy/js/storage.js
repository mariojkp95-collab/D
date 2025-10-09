// DRAKORIA - Local Storage System
// Gestisce salvataggio account, personaggi e impostazioni

class StorageManager {
    constructor() {
        this.storageKey = 'drakoria_data';
        this.defaultData = {
            account: {
                username: null,
                isGuest: false,
                selectedServer: null,
                loginTime: null
            },
            characters: {
                slot1: null,
                slot2: null,
                slot3: null,
                slot4: null
            },
            settings: {
                soundEnabled: true,
                musicEnabled: true,
                graphicsQuality: 'medium',
                language: 'it',
                notifications: true
            },
            gameData: {
                achievments: [],
                playTime: 0,
                lastPlayed: null
            }
        };
        
        this.data = this.loadData();
        console.log('💾 Storage Manager inizializzato');
    }

    // Load data from localStorage
    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults to handle new fields
                return this.mergeWithDefaults(parsed, this.defaultData);
            }
        } catch (error) {
            console.error('❌ Errore caricamento dati:', error);
        }
        
        return { ...this.defaultData };
    }

    // Save data to localStorage
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            console.log('💾 Dati salvati correttamente');
            return true;
        } catch (error) {
            console.error('❌ Errore salvataggio dati:', error);
            return false;
        }
    }

    // Merge saved data with defaults (for backward compatibility)
    mergeWithDefaults(saved, defaults) {
        const merged = { ...defaults };
        
        for (const key in saved) {
            if (typeof saved[key] === 'object' && saved[key] !== null && !Array.isArray(saved[key])) {
                merged[key] = this.mergeWithDefaults(saved[key], defaults[key] || {});
            } else {
                merged[key] = saved[key];
            }
        }
        
        return merged;
    }

    // Account Management
    setAccount(username, isGuest = false, server = null) {
        this.data.account = {
            username: username,
            isGuest: isGuest,
            selectedServer: server,
            loginTime: Date.now()
        };
        this.saveData();
        console.log(`👤 Account impostato: ${username} (Guest: ${isGuest})`);
    }

    getAccount() {
        return this.data.account;
    }

    isLoggedIn() {
        return this.data.account.username !== null;
    }

    logout() {
        this.data.account = {
            username: null,
            isGuest: false,
            selectedServer: null,
            loginTime: null
        };
        this.saveData();
        console.log('👤 Logout completato');
    }

    // Character Management
    createCharacter(slot, characterData) {
        if (slot < 1 || slot > 4) {
            console.error('❌ Slot personaggio non valido:', slot);
            return false;
        }

        const character = {
            name: characterData.name,
            class: characterData.class,
            level: 1,
            experience: 0,
            stats: GameData.utils.calculateStats(characterData.class, 1),
            position: { x: 400, y: 300 },
            inventory: [],
            equipment: {},
            gold: 100,
            createdAt: Date.now(),
            lastPlayed: Date.now(),
            playTime: 0
        };

        // Set current HP/MP to max
        character.currentHp = character.stats.hp;
        character.currentMp = character.stats.mp;

        this.data.characters[`slot${slot}`] = character;
        this.saveData();
        
        console.log(`✨ Personaggio creato nello slot ${slot}:`, character);
        return true;
    }

    getCharacter(slot) {
        if (slot < 1 || slot > 4) return null;
        return this.data.characters[`slot${slot}`];
    }

    getAllCharacters() {
        return this.data.characters;
    }

    findFirstEmptySlot() {
        for (let i = 1; i <= 4; i++) {
            if (!this.data.characters[`slot${i}`]) {
                return i;
            }
        }
        return null; // Tutti gli slot sono occupati
    }

    deleteCharacter(slot) {
        if (slot < 1 || slot > 4) {
            console.error('❌ Slot personaggio non valido:', slot);
            return false;
        }

        this.data.characters[`slot${slot}`] = null;
        this.saveData();
        
        console.log(`🗑️ Personaggio eliminato dallo slot ${slot}`);
        return true;
    }

    saveCharacterProgress(slot, characterData) {
        if (slot < 1 || slot > 4 || !this.data.characters[`slot${slot}`]) {
            console.error('❌ Impossibile salvare progresso:', slot);
            return false;
        }

        // Update character data
        const character = this.data.characters[`slot${slot}`];
        Object.assign(character, characterData);
        character.lastPlayed = Date.now();
        
        this.saveData();
        console.log(`💾 Progresso salvato per slot ${slot}`);
        return true;
    }

    // Character name validation
    isCharacterNameAvailable(name) {
        if (!name || name.length < 3 || name.length > 12) return false;
        
        // Check if name contains only valid characters
        const validName = /^[a-zA-Z0-9_]+$/.test(name);
        if (!validName) return false;
        
        // Check if name is already used
        for (let i = 1; i <= 4; i++) {
            const character = this.getCharacter(i);
            if (character && character.name.toLowerCase() === name.toLowerCase()) {
                return false;
            }
        }
        
        // Check against reserved names
        const reservedNames = ['admin', 'system', 'drakoria', 'nostale', 'guest', 'null', 'undefined'];
        if (reservedNames.includes(name.toLowerCase())) return false;
        
        return true;
    }

    // Settings Management
    getSetting(key) {
        return this.data.settings[key];
    }

    setSetting(key, value) {
        this.data.settings[key] = value;
        this.saveData();
        console.log(`⚙️ Impostazione aggiornata: ${key} = ${value}`);
    }

    getSettings() {
        return this.data.settings;
    }

    // Game Data
    addPlayTime(minutes) {
        this.data.gameData.playTime += minutes;
        this.data.gameData.lastPlayed = Date.now();
        this.saveData();
    }

    getPlayTime() {
        return this.data.gameData.playTime;
    }

    addAchievement(achievementId) {
        if (!this.data.gameData.achievments.includes(achievementId)) {
            this.data.gameData.achievments.push(achievementId);
            this.saveData();
            console.log(`🏆 Achievement sbloccato: ${achievementId}`);
            return true;
        }
        return false;
    }

    hasAchievement(achievementId) {
        return this.data.gameData.achievments.includes(achievementId);
    }

    // Utility Methods
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            this.data = this.mergeWithDefaults(imported, this.defaultData);
            this.saveData();
            console.log('📥 Dati importati correttamente');
            return true;
        } catch (error) {
            console.error('❌ Errore importazione dati:', error);
            return false;
        }
    }

    clearAllData() {
        const confirmClear = confirm('⚠️ Sei sicuro di voler cancellare tutti i dati? Questa azione non può essere annullata!');
        if (confirmClear) {
            localStorage.removeItem(this.storageKey);
            this.data = { ...this.defaultData };
            console.log('🗑️ Tutti i dati sono stati cancellati');
            return true;
        }
        return false;
    }

    // Data Statistics
    getDataStats() {
        const chars = Object.values(this.data.characters).filter(c => c !== null);
        return {
            totalCharacters: chars.length,
            highestLevel: chars.length > 0 ? Math.max(...chars.map(c => c.level)) : 0,
            totalPlayTime: this.data.gameData.playTime,
            achievements: this.data.gameData.achievments.length,
            accountAge: this.data.account.loginTime ? 
                Math.floor((Date.now() - this.data.account.loginTime) / (1000 * 60 * 60 * 24)) : 0
        };
    }

    // Auto-save system
    startAutoSave(intervalMinutes = 5) {
        setInterval(() => {
            this.saveData();
            console.log('💾 Auto-save completato');
        }, intervalMinutes * 60 * 1000);
        
        console.log(`🔄 Auto-save attivato (ogni ${intervalMinutes} minuti)`);
    }
}

// Global storage instance
window.Storage = new StorageManager();

console.log('💾 Sistema Storage inizializzato!');