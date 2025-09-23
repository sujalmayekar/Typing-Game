import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load only the player sprite sheets for now
        this.load.spritesheet('player-idle', 'assets/Idle.png', {
            frameWidth: 120,
            frameHeight: 150
        });
        this.load.spritesheet('player-run', 'assets/Run.png', {
            frameWidth: 120,
            frameHeight: 150
        });
    }

    create() {
        // Once assets are loaded, start the main game scene
        this.scene.start('GameScene');
    }
}

