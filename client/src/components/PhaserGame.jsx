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
        this.isFinished = false; // Flag to control update loop during completion animation
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
        // FIX 1: Set a static texture on creation instead of playing the faulty idle animation.
        this.player.setTexture('player-idle', 0);
    }
    
    // --- Methods called from React ---
    setTypingStatus(status) {
        this.currentTypingStatus = status;
    }

    setProgress(newProgress) {
        this.progress = newProgress;
        const travelDistance = this.scale.width * 0.6; // The total distance the player will run
        this.targetPlayerX = this.initialPlayerX + (travelDistance * this.progress);
    }
    
    resetPlayer() {
        this.isFinished = false; // Reset the finish flag
        this.progress = 0;
        if (this.player) {
            if (!this.scene.isActive()) return;
            // Stop any running tweens to prevent conflicts
            this.tweens.killTweensOf(this.player); 

            // Reset position
            this.player.x = this.initialPlayerX;
            this.targetPlayerX = this.initialPlayerX;
            this.player.setVisible(true);

            // FIX 2: On reset, stop all animations and set the static idle texture.
            this.player.anims.stop();
            this.player.setTexture('player-idle', 0);

            // Reset background positions
            this.background.tilePositionX = 0;
            this.midground.tilePositionX = 0;
            this.foreground.tilePositionX = 0;
        }
    }

    completeLevel() {
        if (!this.player || !this.player.active || this.isFinished) return;
        
        this.isFinished = true; // Prevent update loop from interfering
        this.player.play('run');

        // Tween to the finish line to ensure the player arrives exactly at the end
        this.tweens.add({
            targets: this.player,
            x: this.targetPlayerX,
            ease: 'Power1',
            duration: 300, 
            onUpdate: () => {
                // Manually scroll the background during the final tween
                const movementSinceLastFrame = this.player.x - (this.player.prevTweenedProps?.x || this.player.x);
                this.background.tilePositionX += movementSinceLastFrame * 0.2;
                this.midground.tilePositionX += movementSinceLastFrame * 0.5;
                this.foreground.tilePositionX += movementSinceLastFrame * 0.8;
            },
            onComplete: () => {
                // After reaching the finish line, tween off the screen
                if (this.player) {
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
            }
        });
    }
    // --- End Methods called from React ---

    update() {
        if (!this.player || !this.player.active || this.isFinished) return;

        const isRunning = this.currentTypingStatus === 'correct';
        const currentAnim = this.player.anims.currentAnim;
        const CONSTANT_RUN_SPEED = 3.5; // A fixed speed for running

        // Only move if typing is correct AND player hasn't reached their target position yet
        if (isRunning && this.player.x < this.targetPlayerX) {
            if (!currentAnim || currentAnim.key !== 'run') {
                this.player.play('run');
            }
            
            const distanceToTarget = this.targetPlayerX - this.player.x;
            const movementThisFrame = Math.min(CONSTANT_RUN_SPEED, distanceToTarget);
            
            this.player.x += movementThisFrame;

            // Scroll backgrounds based on the constant movement speed
            this.background.tilePositionX += movementThisFrame * 0.2;
            this.midground.tilePositionX += movementThisFrame * 0.5;
            this.foreground.tilePositionX += movementThisFrame * 0.8;

        } else {
            // FIX 3: This is the core fix. If not running, stop ALL animations
            // and set the texture to the first, static idle frame. This guarantees no movement.
            const currentAnimKey = this.player.anims.currentAnim?.key;
            if (currentAnimKey === 'run' || this.player.anims.isPlaying) {
                this.player.anims.stop();
                this.player.setTexture('player-idle', 0);
            }
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

    useEffect(() => {
        const scene = gameInstance.current?.scene?.scenes[0];
        if (scene && scene.setTypingStatus) {
            scene.setTypingStatus(typingStatus);
        }
    }, [typingStatus]);

    useEffect(() => {
        const scene = gameInstance.current?.scene?.scenes[0];
        if (scene && scene.setProgress) {
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

