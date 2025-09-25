import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.background = null;
        this.midground = null;
        this.foreground = null;
        
        this.progress = 0;
        this.typingStatus = 'idle'; 
        this.gameStatus = 'waiting';
        this.isFinished = false;

        this.initialPlayerX = 0;
        this.targetPlayerX = 0;

        // Simplified motion model
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.maxSpeed = 300; 
        this.acceleration = 600;
        this.deceleration = 1200; // Increased deceleration for a more responsive stop
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
            key: 'run',
            frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });

        this.initialPlayerX = this.scale.width / 4;
        this.player = this.add.sprite(this.initialPlayerX, this.scale.height / 1.5, 'player-idle');
        this.player.setScale(0.35);
        this.player.setOrigin(0.5, 0.5);
        this.targetPlayerX = this.initialPlayerX;

        this.player.setTexture('player-idle', 0);
        this.player.setFlipX(false); // Default orientation: face right.
    }
    
    setProgress(newProgress) {
        this.progress = Math.max(0, Math.min(1, newProgress ?? 0));
        const travelDistance = this.scale.width * 0.6;
        this.targetPlayerX = this.initialPlayerX + (travelDistance * this.progress);
    }

    setGameStatus(status) {
        this.gameStatus = status;
        if (status === 'finished' && this.progress >= 1) this.completeLevel();
        else if (status === 'waiting') this.resetPlayer();
    }

    setTypingStatus(status) {
        this.typingStatus = status;
    }

    resetPlayer() {
        this.isFinished = false;
        this.progress = 0;
        this.typingStatus = 'idle';
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        if (this.player) {
            this.tweens.killTweensOf(this.player);
            this.player.x = this.initialPlayerX;
            this.targetPlayerX = this.initialPlayerX;
            this.player.setVisible(true);
            this.player.anims.stop();
            this.player.setTexture('player-idle', 0);
            this.player.setFlipX(false); // Ensure it faces right on reset
        }
        this.background.tilePositionX = 0;
        this.midground.tilePositionX = 0;
        this.foreground.tilePositionX = 0;
    }

    completeLevel() {
        if (!this.player || !this.player.active || this.isFinished) return;
        this.isFinished = true;
        this.tweens.add({
            targets: this.player,
            x: this.scale.width + this.player.width,
            ease: 'Power1',
            duration: 1200,
            onStart: () => {
                if (this.player) {
                    this.player.setFlipX(false);
                    this.player.play('run');
                }
            },
            onComplete: () => {
                 if (this.player) this.player.setVisible(false);
            }
        });
    }

    update(time, delta) {
        if (!this.player || !this.player.active || this.isFinished) return;
        const dt = delta / 1000;

        const isMovingForward = this.player.x < this.targetPlayerX;
        const isMovingBackward = this.player.x > this.targetPlayerX;

        // --- Determine Target Speed ---
        const shouldBeRunning = this.gameStatus === 'started' && (this.typingStatus === 'correct' || this.typingStatus === 'idle');

        if (shouldBeRunning && isMovingForward) {
            this.targetSpeed = this.maxSpeed;
        } else {
            this.targetSpeed = 0;
        }
        
        // --- Smoothly Adjust Speed ---
        if (this.currentSpeed < this.targetSpeed) {
            this.currentSpeed = Math.min(this.targetSpeed, this.currentSpeed + this.acceleration * dt);
        } else if (this.currentSpeed > this.targetSpeed) {
            this.currentSpeed = Math.max(this.targetSpeed, this.currentSpeed - this.deceleration * dt);
        }
        
        const prevX = this.player.x;

        // --- Apply Movement ---
        if (this.typingStatus === 'backspacing' && isMovingBackward) {
            const backwardSpeed = this.maxSpeed * 0.75;
            this.player.x = Math.max(this.targetPlayerX, this.player.x - backwardSpeed * dt);
        } else {
            if (isMovingForward) {
                this.player.x = Math.min(this.targetPlayerX, this.player.x + this.currentSpeed * dt);
            } else {
                // Allows for smooth stopping even if slightly overshooting target
                this.player.x += this.currentSpeed * dt; 
            }
        }

        const moved = this.player.x - prevX;

        // --- Set Animation and Orientation ---
        if (Math.abs(moved) > 0.1) { // Player is physically moving
            this.player.play('run', true);
            this.player.setFlipX(moved < 0);
        } else { // Player is idle
            this.player.anims.stop();
            this.player.setTexture('player-idle', 0);
            this.player.setFlipX(false);
        }

        // --- Adjust Animation Speed ---
        if (this.player.anims.isPlaying) {
            const currentMoveSpeed = Math.abs(moved / dt);
            const animSpeed = Phaser.Math.Clamp(currentMoveSpeed / this.maxSpeed, 0.8, 1.5);
            this.player.anims.timeScale = animSpeed;
        }
       
        // --- Update Parallax Backgrounds ---
        this.background.tilePositionX += moved * 0.2;
        this.midground.tilePositionX += moved * 0.5;
        this.foreground.tilePositionX += moved * 1.0;
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
            if (gameInstance.current) {
                gameInstance.current.destroy(true, false);
                gameInstance.current = null;
            }
        };
    }, []);

    useEffect(() => {
        gameInstance.current?.scene?.scenes[0]?.setProgress(progress);
    }, [progress]);

    useEffect(() => {
        gameInstance.current?.scene?.scenes[0]?.setTypingStatus(typingStatus);
    }, [typingStatus]);

    useEffect(() => {
        gameInstance.current?.scene?.scenes[0]?.setGameStatus(gameStatus);
    }, [gameStatus]);

    return <div id="phaser-container" className="racing-track-storyboard" />;
}

