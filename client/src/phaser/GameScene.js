import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.gameActive = false;
    }

    create() {
        const { width, height } = this.scale;

        // Set a simple background color since we are not using background assets yet
        this.cameras.main.setBackgroundColor('#1a1a1a');

        // Create player animations from the loaded sprite sheets
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1,
        });

        // Create player sprite and position it
        this.player = this.add.sprite(width / 2, height / 2, 'player-idle');
        this.player.setScale(1.5);
        this.player.play('idle');

        // Listen for events from the PhaserGame.jsx bridge component
        this.events.on('startGame', this.startGame, this);
        this.events.on('endGame', this.endGame, this);
        this.events.on('correctStroke', this.handleCorrectStroke, this);
        this.events.on('incorrectStroke', this.handleIncorrectStroke, this);
    }

    // --- Public Methods (Called from React via events) ---

    startGame() {
        this.gameActive = true;
        this.player.play('idle');
    }
    
    endGame() {
        this.gameActive = false;
        this.player.anims.stop();
        this.player.play('idle'); // Revert to idle state when game is over
    }

    handleCorrectStroke() {
        if (!this.gameActive) return;

        this.player.anims.play('run', true);
        this.addGlowEffect(this.player, 0xffffff); // White glow for success

        // After a short burst of running, return to idle
        this.time.delayedCall(200, () => {
            if (this.gameActive) {
                this.player.anims.play('idle', true);
            }
        });
    }

    handleIncorrectStroke() {
        if (!this.gameActive) return;

        // Shake the camera for feedback on mistakes
        this.cameras.main.shake(150, 0.008);
        this.addGlowEffect(this.player, 0xff0000); // Red glow for error
    }
    
    // --- Helper Methods ---

    addGlowEffect(target, color) {
        // Check if the Post FX pipeline is available on the target
        if (target.postFX) {
            const fx = target.postFX.addGlow(color, 1, 0, false, 0.1, 10);
            this.tweens.add({
                targets: fx,
                outerStrength: 0,
                duration: 250,
                onComplete: () => {
                    target.postFX.remove(fx);
                }
            });
        }
    }
}

