import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.background = null;
        this.midground = null;
        this.foreground = null;
        this.progress = 0;
        this.initialPlayerX = 0;
        this.targetPlayerX = 0;
        this.currentTypingStatus = 'idle'; // State managed within Phaser
    }

    preload() {
        this.load.image('background', 'assets/Complete Background.png');
        this.load.image('midground', 'assets/midground.png');
        this.load.image('foreground', 'assets/Foreground.png');
        this.load.spritesheet('player-idle', 'assets/Idle.png', { frameWidth: 370, frameHeight: 448 });
        this.load.spritesheet('player-run', 'assets/Run.png', { frameWidth: 475, frameHeight: 448 });
    }

    create() {
        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background').setOrigin(0, 0);
        this.midground = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'midground').setOrigin(0, 0);
        this.foreground = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'foreground').setOrigin(0, 0);

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.initialPlayerX = this.scale.width / 4;
        this.player = this.add.sprite(this.initialPlayerX, this.scale.height / 1.5, 'player-idle');
        this.player.setScale(0.35);
        this.player.setOrigin(0.5, 0.5);
        this.targetPlayerX = this.initialPlayerX;
        this.player.play('idle');
    }
    
    // --- Methods called from React ---
    setTypingStatus(status) {
        this.currentTypingStatus = status;
    }

    setProgress(newProgress) {
        this.progress = newProgress;
        const travelDistance = this.scale.width * 0.6;
        this.targetPlayerX = this.initialPlayerX + (travelDistance * this.progress);
    }
    
    resetPlayer() {
        this.progress = 0;
        if (this.player) {
            if (!this.scene.isActive()) return;
            this.player.x = this.initialPlayerX;
            this.targetPlayerX = this.initialPlayerX;
            this.player.play('idle');
            this.player.setVisible(true);
        }
    }

    completeLevel() {
        if (!this.player) return;
        this.tweens.add({
            targets: this.player,
            x: this.scale.width + this.player.width,
            ease: 'Power1',
            duration: 1000,
            onComplete: () => {
                 if (this.player) this.player.setVisible(false);
            }
        });
    }
    // --- End Methods called from React ---

    update() {
        if (!this.player || !this.player.active) return;
        
        // Animation logic is now handled inside the game loop for reliability
        const currentAnim = this.player.anims.getName();
        if (this.currentTypingStatus === 'correct') {
            if (currentAnim !== 'run') {
                this.player.play('run');
            }
        } else { // 'idle' or 'incorrect'
            if (currentAnim !== 'idle') {
                this.player.play('idle');
            }
        }
        
        // Smoothly move player to target X position
        this.player.x += (this.targetPlayerX - this.player.x) * 0.05;

        // Background scrolling logic, now correctly tied to the reliable animation state
        if (this.player.anims.getName() === 'run') {
            this.background.tilePositionX += 0.5;
            this.midground.tilePositionX += 1.5;
            this.foreground.tilePositionX += 2;
        }
    }
}

export default function PhaserGame({ typingStatus, gameStatus, progress }) {
    const gameInstance = useRef(null);

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: '100%',
            height: '100%',
            parent: 'phaser-container',
            transparent: true,
            scene: [GameScene]
        };
        gameInstance.current = new Phaser.Game(config);
        return () => {
            gameInstance.current.destroy(true, false);
            gameInstance.current = null;
        };
    }, []);

    // This useEffect now just passes the state to Phaser, not controls it directly.
    useEffect(() => {
        const scene = gameInstance.current?.scene?.scenes[0];
        if (scene && scene.setTypingStatus) {
            scene.setTypingStatus(typingStatus);
        }
    }, [typingStatus]);

    useEffect(() => {
        const scene = gameInstance.current?.scene?.scenes[0];
        if (scene) {
            scene.setProgress(progress);
        }
    }, [progress]);

    useEffect(() => {
        const scene = gameInstance.current?.scene?.scenes[0];
        if (scene) {
            if (gameStatus === 'finished' && progress >= 1) {
                scene.completeLevel();
            } else if (gameStatus === 'waiting') {
                scene.resetPlayer();
            }
        }
    }, [gameStatus, progress]);

    return <div id="phaser-container" className="racing-track-storyboard" />;
}

