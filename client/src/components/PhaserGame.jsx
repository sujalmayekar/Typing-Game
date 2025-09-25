import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';

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

        // --- "Limbo" Style Motion Model ---
        // We use lower friction than acceleration to create a feeling of momentum and "coasting" to a stop.
        this.velocityX = 0; // Current speed in pixels/second
        this.maxSpeed = 700; // Top speed
        this.acceleration = 3000; // How quickly the character gets to top speed
        this.friction = 1200;   // How quickly the character slows down. Lower value = more "slide".
        this.stopThreshold = 5; // Below this speed, snap to a full stop.
        
        // A grace period to keep the character "active" during brief typing pauses.
        this.lastCorrectTypeTime = 0; // Timestamp of the last correct keypress
        this.runGracePeriod = 800; // ms to keep running after last correct input.
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

        // Create the run animation.
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
        this.player.setFlipX(false); // Ensure player starts facing forward

        // Set the initial state to a single, static idle frame.
        this.player.setTexture('player-idle', 0);
    }
    
    // --- Methods called from the React component to update Phaser's state ---
    
    setProgress(newProgress) {
        this.progress = Math.max(0, Math.min(1, newProgress ?? 0));
        const travelDistance = this.scale.width * 0.6; // The total race distance
        this.targetPlayerX = this.initialPlayerX + (travelDistance * this.progress);
    }

    setGameStatus(status) {
        this.gameStatus = status;
        if (this.gameStatus === 'finished' && this.progress >= 1) {
            this.completeLevel();
        } else if (this.gameStatus === 'waiting') {
            this.resetPlayer();
        }
    }

    setTypingStatus(status) {
        this.typingStatus = status;
    }

    // --- Core Scene Logic ---

    resetPlayer() {
        this.isFinished = false;
        this.progress = 0;
        this.typingStatus = 'idle';
        this.velocityX = 0;
        this.lastCorrectTypeTime = 0;
        if (this.player) {
            this.tweens.killTweensOf(this.player);
            this.player.x = this.initialPlayerX;
            this.targetPlayerX = this.initialPlayerX;
            this.player.setVisible(true);
            this.player.anims.stop();
            this.player.setTexture('player-idle', 0);
            this.player.setFlipX(false); // Explicitly set direction on reset
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

    update(time, delta) {
        if (!this.player || !this.player.active || this.isFinished) return;
        const dt = delta / 1000; // seconds

        // Update timestamp on correct typing to extend the "running" state
        if (this.typingStatus === 'correct') {
            this.lastCorrectTypeTime = time;
        }

        // Determine if the player should be trying to move
        const isRunningGracePeriod = (time - this.lastCorrectTypeTime) < this.runGracePeriod;
        const canMove = this.gameStatus === 'started' && isRunningGracePeriod;
        const diff = this.targetPlayerX - this.player.x;
        const dir = canMove && Math.abs(diff) > 1 ? Math.sign(diff) : 0;

        // --- PHYSICS: Apply acceleration or friction ---
        if (dir !== 0) {
            this.velocityX += dir * this.acceleration * dt;
            this.velocityX = Phaser.Math.Clamp(this.velocityX, -this.maxSpeed, this.maxSpeed);
        } else {
            const vSign = Math.sign(this.velocityX);
            const vMag = Math.abs(this.velocityX);
            const frictionMagnitude = this.friction * dt;
            this.velocityX = vSign * Math.max(0, vMag - frictionMagnitude);
        }

        // --- POSITION: Update based on velocity ---
        this.player.x += this.velocityX * dt;

        // Prevent overshooting the target
        const newSign = Math.sign(this.targetPlayerX - this.player.x);
        if (dir !== 0 && newSign !== dir) {
            this.player.x = this.targetPlayerX;
            this.velocityX = 0;
        }
        
        // --- VISUALS ---

        // 1. Smooth Parallax Scrolling tied to velocity
        this.background.tilePositionX += this.velocityX * dt * 0.2;
        this.midground.tilePositionX += this.velocityX * dt * 0.6;
        this.foreground.tilePositionX += this.velocityX * dt * 1.2;

        const speed = Math.abs(this.velocityX);

        // 2. Fix Sprite Glitch: Only change direction if moving meaningfully.
        if (speed > this.stopThreshold) {
            this.player.setFlipX(this.velocityX < 0);
        }
        
        // 3. Animation State
        const shouldAnimateRun = this.gameStatus === 'started' && speed > this.stopThreshold;

        if (shouldAnimateRun) {
            if (!this.player.anims.isPlaying || this.player.anims.currentAnim.key !== 'run') {
                this.player.play('run');
            }
            const animSpeed = Phaser.Math.Clamp(speed / this.maxSpeed, 0.7, 1.5);
            this.player.anims.timeScale = animSpeed;
        } else {
            // Only switch to idle if not moving (below threshold)
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
            if (gameInstance.current) {
                gameInstance.current.destroy(true, false);
                gameInstance.current = null;
            }
        };
    }, []);

    // Prop listeners
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

