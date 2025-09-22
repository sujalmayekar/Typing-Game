import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    init(data) {
        this.initialWords = data.words || [];
    }

    preload() {
        // Using relative paths from the 'public' directory root is the most reliable way with Vite.
        // This ensures Vite can correctly serve the assets during development.
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('player_idle', 'assets/MainCharacter/Idle.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('player_shot', 'assets/MainCharacter/Shot.png', { frameWidth: 128, frameHeight: 128 });

        const zombieTypes = ['Zombie1', 'Zombie2', 'Zombie3', 'Zombie4'];
        zombieTypes.forEach(type => {
            this.load.spritesheet(`${type}_walk`, `assets/zombies/${type}_Walk.png`, { frameWidth: 128, frameHeight: 128 });
            this.load.spritesheet(`${type}_dead`, `assets/zombies/${type}_Dead.png`, { frameWidth: 128, frameHeight: 128 });
        });
        
        // A placeholder for the bullet, using one of the shot frames.
        this.load.image('bullet', 'assets/MainCharacter/Shot.png');
    }

    create() {
        // This scene's only job is to load assets and then immediately start the main GameScene.
        this.scene.start('GameScene', { words: this.initialWords });
    }
}

