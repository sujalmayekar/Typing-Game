import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        // Core state variables
        this.player = null;
        this.background = null;
        this.midground = null;
        this.foreground = null;
        
        // State variables controlled by React props
        this.progress = 0;
        this.typingStatus = 'idle'; // 'idle' | 'correct' | 'incorrect'
        this.gameStatus = 'waiting';
        this.isFinished = false;

        // Positional tracking
        this.initialPlayerX = 0;
        this.targetPlayerX = 0;

        // Motion model (Limbo-like smoothness)
        this.velocityX = 0; // px/s
        this.maxSpeed = 650; // px/s
        this.acceleration = 2600; // px/s^2
        this.friction = 2800; // px/s^2 (applied when not accelerating)
        this.stopThreshold = 6; // px/s below which we snap idle
        this.lastProgress = 0;
    }

    preload() {
        this.load.image('background', 'assets/Complete Background.png');
        this.load.image('midground', 'assets/midground.png');
        this.load.image('foreground', 'assets/Foreground.png');
        this.load.spritesheet('player-idle', 'assets/Idle.png', { frameWidth: 370, frameHeight: 448 });
        this.load.spritesheet('player-run', 'assets/Run.png', { frameWidth: 475, frameHeight: 448 });
    }

    create() {
        // Create parallax backgrounds
        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background').setOrigin(0, 0);
        this.midground = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'midground').setOrigin(0, 0);
        this.foreground = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'foreground').setOrigin(0, 0);

        // Create the run animation. Idle uses a static frame.
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });

        // Setup player sprite
        this.initialPlayerX = this.scale.width / 4;
        this.player = this.add.sprite(this.initialPlayerX, this.scale.height / 1.5, 'player-idle');
        this.player.setScale(0.35);
        this.player.setOrigin(0.5, 0.5);
        this.targetPlayerX = this.initialPlayerX;

        // Set the initial state to a single, static idle frame.
        this.player.setTexture('player-idle', 0);
    }
    
    // --- Methods called from the React component to update Phaser's state ---
    
    // Called when the user's typing progress changes
    setProgress(newProgress) {
        // Clamp [0,1] to be safe
        this.progress = Math.max(0, Math.min(1, newProgress ?? 0));
        const travelDistance = this.scale.width * 0.6; // The total race distance
        this.targetPlayerX = this.initialPlayerX + (travelDistance * this.progress);
    }

    // Called when the game state (waiting, started, finished) changes
    setGameStatus(status) {
        this.gameStatus = status;
        if (this.gameStatus === 'finished' && this.progress >= 1) {
            this.completeLevel();
        } else if (this.gameStatus === 'waiting') {
            this.resetPlayer();
        }
    }

    // Called when current keystroke status changes
    setTypingStatus(status) {
        this.typingStatus = status;
    }

    // --- Core Scene Logic ---

    resetPlayer() {
        this.isFinished = false;
        this.progress = 0;
        this.typingStatus = 'idle';
        this.velocityX = 0;
        if (this.player) {
            this.tweens.killTweensOf(this.player);
            this.player.x = this.initialPlayerX;
            this.targetPlayerX = this.initialPlayerX;
            this.player.setVisible(true);
            this.player.anims.stop();
            this.player.setTexture('player-idle', 0); // Reset to static idle frame
        }
        // Reset backgrounds
        this.background.tilePositionX = 0;
        this.midground.tilePositionX = 0;
        this.foreground.tilePositionX = 0;
    }

    completeLevel() {
        if (!this.player || !this.player.active || this.isFinished) return;
        this.isFinished = true;
        this.player.play('run');

        // Final tween to the finish line
        this.tweens.add({
            targets: this.player,
            x: this.targetPlayerX,
            ease: 'Power1',
            duration: 200,
            onComplete: () => {
                if (this.player) {
                    // Then, run off the screen
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

    update() {
        if (!this.player || !this.player.active || this.isFinished) return;
        const dt = (this.game?.loop?.delta ?? 16.6) / 1000; // seconds

        // Determine desired direction: towards target only when actively typing correctly
        const canMove = this.gameStatus === 'started' && this.typingStatus === 'correct';
        const diff = this.targetPlayerX - this.player.x;
        const dir = canMove && Math.abs(diff) > 0.5 ? Math.sign(diff) : 0;

        // Acceleration or friction
        if (dir !== 0) {
            this.velocityX += dir * this.acceleration * dt;
            // Clamp to max speed
            if (Math.abs(this.velocityX) > this.maxSpeed) {
                this.velocityX = this.maxSpeed * Math.sign(this.velocityX);
            }
        } else {
            // Apply friction to smoothly come to rest
            const vSign = Math.sign(this.velocityX);
            const vMag = Math.max(0, Math.abs(this.velocityX) - this.friction * dt);
            this.velocityX = vMag * vSign;
            if (Math.abs(this.velocityX) < this.stopThreshold) this.velocityX = 0;
        }

        // Prevent overshooting target when moving towards it
        const prevX = this.player.x;
        let newX = this.player.x + this.velocityX * dt;
        if (dir > 0 && newX > this.targetPlayerX) { newX = this.targetPlayerX; this.velocityX = 0; }
        if (dir < 0 && newX < this.targetPlayerX) { newX = this.targetPlayerX; this.velocityX = 0; }
        this.player.x = newX;

        // Parallax: proportional to actual displacement (supports reverse)
        const moved = this.player.x - prevX;
        if (moved !== 0) {
            if (this.player.setFlipX) this.player.setFlipX(moved < 0);
            this.background.tilePositionX += moved * 0.35;
            this.midground.tilePositionX += moved * 0.95;
            this.foreground.tilePositionX += moved * 1.7;
        }

        // Animation: run when moving, idle when near still; speed tied to velocity
        const speed = Math.abs(this.velocityX);
        if (speed > this.stopThreshold) {
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'run') {
                this.player.play('run');
            }
            const animSpeed = Phaser.Math.Clamp(speed / this.maxSpeed, 0.6, 1.8);
            this.player.anims.timeScale = animSpeed;
        } else {
            if (this.player.anims.isPlaying) {
                this.player.anims.stop();
            }
            this.player.setTexture('player-idle', 0);
        }
    }
}

// --- React Component ---
export default function PhaserGame({ typingStatus, gameStatus, progress }) {
    const gameInstance = useRef(null);

    // Initialize Phaser
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

    // Prop listeners: When a prop from Game.jsx changes, call the corresponding method in the Phaser scene.
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

