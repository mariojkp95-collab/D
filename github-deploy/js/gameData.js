// DRAKORIA - Game Data System
// NosTale-inspired classes, stats, and game mechanics

const GameData = {
    // Character Classes (based on NosTale)
    classes: {
        swordsman: {
            name: 'Spadaccino',
            description: 'Maestro del combattimento corpo a corpo con alta difesa e attacco fisico',
            icon: '⚔️',
            primaryStat: 'attack',
            baseStats: {
                hp: 180,
                mp: 40,
                attack: 25,
                defense: 20,
                magic: 8,
                speed: 15,
                luck: 10
            },
            statGrowth: {
                hp: 12,
                mp: 3,
                attack: 3,
                defense: 2,
                magic: 1,
                speed: 1,
                luck: 1
            },
            skills: [
                { id: 'q', name: 'Colpo di Spada', icon: '⚔️', damage: 120, cost: 0, cooldown: 0, level: 1 },
                { id: 'w', name: 'Scudo', icon: '🛡️', damage: 0, cost: 15, cooldown: 8, level: 5, effect: 'defense' },
                { id: 'e', name: 'Attacco Poderoso', icon: '💥', damage: 200, cost: 25, cooldown: 6, level: 10 },
                { id: 'r', name: 'Furia Berserker', icon: '✨', damage: 0, cost: 40, cooldown: 30, level: 15, effect: 'berserk' }
            ]
        },
        
        archer: {
            name: 'Arciere',
            description: 'Esperto di attacchi a distanza con alta velocità e precisione',
            icon: '🏹',
            primaryStat: 'speed',
            baseStats: {
                hp: 140,
                mp: 60,
                attack: 22,
                defense: 12,
                magic: 10,
                speed: 25,
                luck: 15
            },
            statGrowth: {
                hp: 8,
                mp: 5,
                attack: 2,
                defense: 1,
                magic: 1,
                speed: 3,
                luck: 2
            },
            skills: [
                { id: 'q', name: 'Tiro con Arco', icon: '🏹', damage: 100, cost: 0, cooldown: 0, level: 1 },
                { id: 'w', name: 'Tiro Multiplo', icon: '🎯', damage: 80, cost: 20, cooldown: 5, level: 5, effect: 'multi' },
                { id: 'e', name: 'Freccia Esplosiva', icon: '💥', damage: 180, cost: 30, cooldown: 8, level: 10 },
                { id: 'r', name: 'Occhio di Falco', icon: '✨', damage: 0, cost: 35, cooldown: 25, level: 15, effect: 'precision' }
            ]
        },
        
        mage: {
            name: 'Mago',
            description: 'Padrone degli elementi magici con devastanti incantesimi',
            icon: '🔮',
            primaryStat: 'magic',
            baseStats: {
                hp: 100,
                mp: 100,
                attack: 15,
                defense: 8,
                magic: 30,
                speed: 18,
                luck: 12
            },
            statGrowth: {
                hp: 6,
                mp: 8,
                attack: 1,
                defense: 1,
                magic: 4,
                speed: 2,
                luck: 1
            },
            skills: [
                { id: 'q', name: 'Dardo Magico', icon: '🔮', damage: 110, cost: 8, cooldown: 0, level: 1 },
                { id: 'w', name: 'Palla di Fuoco', icon: '🔥', damage: 160, cost: 25, cooldown: 4, level: 5 },
                { id: 'e', name: 'Fulmine', icon: '💥', damage: 220, cost: 35, cooldown: 6, level: 10 },
                { id: 'r', name: 'Meteora', icon: '✨', damage: 300, cost: 60, cooldown: 15, level: 15 }
            ]
        }
    },

    // Experience Table (NosTale-style exponential growth)
    experienceTable: (() => {
        const table = [0]; // Level 0
        for (let level = 1; level <= 99; level++) {
            if (level === 1) {
                table.push(100);
            } else {
                // Exponential growth similar to NosTale
                const baseExp = 100;
                const multiplier = Math.pow(1.12, level - 1);
                const levelExp = Math.floor(baseExp * multiplier);
                table.push(table[level - 1] + levelExp);
            }
        }
        return table;
    })(),

    // Enemy Types
    enemies: {
        greenSlime: {
            name: 'Slime Verde',
            icon: '🟢',
            level: 1,
            hp: 50,
            attack: 8,
            defense: 2,
            exp: 15,
            gold: 5
        },
        blueSlime: {
            name: 'Slime Blu',
            icon: '🔵',
            level: 3,
            hp: 80,
            attack: 12,
            defense: 4,
            exp: 25,
            gold: 8
        },
        redSlime: {
            name: 'Slime Rosso',
            icon: '🔴',
            level: 5,
            hp: 120,
            attack: 18,
            defense: 6,
            exp: 40,
            gold: 12
        },
        goblin: {
            name: 'Goblin',
            icon: '👹',
            level: 8,
            hp: 200,
            attack: 25,
            defense: 10,
            exp: 70,
            gold: 20
        },
        orc: {
            name: 'Orco',
            icon: '🧌',
            level: 12,
            hp: 350,
            attack: 40,
            defense: 18,
            exp: 120,
            gold: 35
        }
    },

    // Items and Equipment
    items: {
        // Weapons
        bronzeSword: {
            name: 'Spada di Bronzo',
            type: 'weapon',
            class: 'swordsman',
            icon: '🗡️',
            stats: { attack: 5 },
            level: 1,
            rarity: 'common'
        },
        ironSword: {
            name: 'Spada di Ferro',
            type: 'weapon',
            class: 'swordsman',
            icon: '⚔️',
            stats: { attack: 12 },
            level: 5,
            rarity: 'uncommon'
        },
        woodenBow: {
            name: 'Arco di Legno',
            type: 'weapon',
            class: 'archer',
            icon: '🏹',
            stats: { attack: 4, speed: 2 },
            level: 1,
            rarity: 'common'
        },
        magicStaff: {
            name: 'Bastone Magico',
            type: 'weapon',
            class: 'mage',
            icon: '🪄',
            stats: { magic: 8, mp: 10 },
            level: 1,
            rarity: 'common'
        },

        // Armor
        leatherArmor: {
            name: 'Armatura di Cuoio',
            type: 'armor',
            icon: '🦺',
            stats: { defense: 3, hp: 15 },
            level: 1,
            rarity: 'common'
        },
        chainmail: {
            name: 'Cotta di Maglia',
            type: 'armor',
            icon: '🛡️',
            stats: { defense: 8, hp: 30 },
            level: 5,
            rarity: 'uncommon'
        },

        // Consumables
        healthPotion: {
            name: 'Pozione di Vita',
            type: 'consumable',
            icon: '🧪',
            effect: { heal: 50 },
            rarity: 'common'
        },
        manaPotion: {
            name: 'Pozione di Mana',
            type: 'consumable',
            icon: '💙',
            effect: { restoreMp: 30 },
            rarity: 'common'
        }
    },

    // Game Constants
    constants: {
        maxLevel: 99,
        baseSpeed: 100, // pixels per second
        canvasSize: { width: 800, height: 600 },
        respawnTime: 5000, // 5 seconds
        maxEnemies: 8
    },

    // Utility Functions
    utils: {
        calculateStats(className, level) {
            const classData = GameData.classes[className];
            if (!classData) return null;

            const stats = { ...classData.baseStats };
            const growth = classData.statGrowth;

            // Apply level-based growth
            for (const stat in growth) {
                stats[stat] += growth[stat] * (level - 1);
            }

            return stats;
        },

        getRequiredExp(level) {
            if (level >= GameData.constants.maxLevel) {
                return GameData.experienceTable[GameData.constants.maxLevel];
            }
            return GameData.experienceTable[level] || 0;
        },

        calculateLevel(totalExp) {
            for (let level = 1; level <= GameData.constants.maxLevel; level++) {
                if (totalExp < GameData.experienceTable[level]) {
                    return level - 1;
                }
            }
            return GameData.constants.maxLevel;
        },

        getExpProgress(totalExp, level) {
            if (level >= GameData.constants.maxLevel) return 1;

            const currentLevelExp = GameData.experienceTable[level];
            const nextLevelExp = GameData.experienceTable[level + 1];
            const progress = (totalExp - currentLevelExp) / (nextLevelExp - currentLevelExp);

            return Math.max(0, Math.min(1, progress));
        },

        getAvailableSkills(className, level) {
            const classData = GameData.classes[className];
            if (!classData) return [];

            return classData.skills.filter(skill => skill.level <= level);
        },

        calculateDamage(attacker, target, skillMultiplier = 1) {
            const baseDamage = attacker.attack * skillMultiplier;
            const defense = target.defense || 0;
            const damage = Math.max(1, baseDamage - defense);
            
            // Add some randomness (±10%)
            const randomFactor = 0.9 + Math.random() * 0.2;
            return Math.floor(damage * randomFactor);
        },

        getRandomEnemy(playerLevel) {
            const enemyTypes = Object.keys(GameData.enemies);
            const suitableEnemies = enemyTypes.filter(type => {
                const enemy = GameData.enemies[type];
                return enemy.level >= playerLevel - 2 && enemy.level <= playerLevel + 3;
            });

            if (suitableEnemies.length === 0) {
                return GameData.enemies.greenSlime; // Fallback
            }

            const randomType = suitableEnemies[Math.floor(Math.random() * suitableEnemies.length)];
            return { ...GameData.enemies[randomType], type: randomType };
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameData;
}

console.log('🎮 DRAKORIA Game Data loaded successfully!');