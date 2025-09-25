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
        this.deceleration = 1200;

        // Darkness properties
        this.darkness = null;
        this.darknessX = 0;
        this.darknessSpeed = 40; // Base speed
        this.darknessBuffer = 5 // Safety distance from player
        this.darknessActive = false;
        this.darknessStartDelay = 1.5; // seconds
        this._darknessStartTime = 0;
        this.darknessSlowWhenPlayerMoves = true;
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
        
        this.createFeatheredDarkness();

        // Create the run animation
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('player-run', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });

        // Adjust player starting position and size
        this.initialPlayerX = this.scale.width / 7; 
        this.player = this.add.sprite(this.initialPlayerX, this.scale.height / 1.28, 'player-idle');
        this.player.setScale(0.45); 
        this.player.setOrigin(0.5, 0.5);
        this.targetPlayerX = this.initialPlayerX;
        
        // **FIX:** Draw the foreground behind the player
        this.foreground = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'foreground').setOrigin(0, 0);
        this.foreground.setDepth(-1); // Ensure it's behind the player and darkness
        this.player.setDepth(1); // Ensure player is on top
        this.darkness.setDepth(0); // Darkness is between player and foreground


        // Set initial player state
        this.player.setTexture('player-idle', 0);
        this.player.setFlipX(false);
    }
    
    createFeatheredDarkness() {
        const w = this.scale.width * 1.5;
        const h = this.scale.height;
        const textureKey = 'darknessGradient';

        // Use a Canvas to create a proper horizontal linear gradient
        const canvasTexture = this.textures.createCanvas(textureKey, w, h);
        const context = canvasTexture.getContext();
        
        // Create a gradient that goes from black (left) to transparent (right)
        const gradient = context.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, 'rgba(0,0,0,1)'); // Opaque black at the start
        gradient.addColorStop(0.96, 'rgba(0,0,0,1)'); // Opaque for most of it
        gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Fade to transparent at the very edge

        context.fillStyle = gradient;
        context.fillRect(0, 0, w, h);

        // Refresh the texture to make it available to the scene
        canvasTexture.refresh();
        
        this.darkness = this.add.image(-w, h / 2, textureKey).setOrigin(0, 0.5);
        // The alpha is now baked into the gradient, but we can still apply a global alpha
        this.darkness.alpha = 0.9;
        this.darknessX = -w;
        this.darknessActive = false;
    }
    
    setProgress(newProgress) {
        this.progress = Math.max(0, Math.min(1, newProgress ?? 0));
        const travelDistance = this.scale.width * 0.6;
        this.targetPlayerX = this.initialPlayerX + (travelDistance * this.progress);
    }

    setGameStatus(status) {
        this.gameStatus = status;
        if(status === 'started') {
            this._darknessStartTime = this.time.now + (this.darknessStartDelay * 1000);
        }
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
        
        this.resetDarkness();

        if (this.player) {
            this.tweens.killTweensOf(this.player);
            this.player.x = this.initialPlayerX;
            this.targetPlayerX = this.initialPlayerX;
            this.player.setVisible(true);
            this.player.anims.stop();
            this.player.setTexture('player-idle', 0);
            this.player.setFlipX(false);
        }
        this.background.tilePositionX = 0;
        this.midground.tilePositionX = 0;
        this.foreground.tilePositionX = 0;
    }
    
    resetDarkness() {
        if (this.darkness) {
            const w = this.scale.width * 1.5;
            this.darkness.x = -w;
            this.darknessX = -w;
        }
        this.darknessActive = false;
    }

    completeLevel() {
        if (!this.player || !this.player.active || this.isFinished) return;
        this.isFinished = true;
        this.darknessActive = false;
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

        const shouldRunForward = this.gameStatus === 'started' && (this.typingStatus === 'correct' || this.typingStatus === 'idle') && isMovingForward;
        const shouldRunBackward = this.gameStatus === 'started' && this.typingStatus === 'backspacing' && isMovingBackward;

        if (shouldRunForward || shouldRunBackward) {
            this.targetSpeed = this.maxSpeed;
        } else {
            this.targetSpeed = 0;
        }
        
        if (this.currentSpeed < this.targetSpeed) {
            this.currentSpeed = Math.min(this.targetSpeed, this.currentSpeed + this.acceleration * dt);
        } else if (this.currentSpeed > this.targetSpeed) {
            this.currentSpeed = Math.max(this.targetSpeed, this.currentSpeed - this.deceleration * dt);
        }
        
        const prevX = this.player.x;
        
        let direction = 0;
        if (shouldRunForward) {
            direction = 1;
        } else if (shouldRunBackward) {
            direction = -1;
        }

        this.player.x += this.currentSpeed * direction * dt;

        // Clamp player position to target
        if (direction === 1 && this.player.x > this.targetPlayerX) {
            this.player.x = this.targetPlayerX;
        } else if (direction === -1 && this.player.x < this.targetPlayerX) {
            this.player.x = this.targetPlayerX;
        }

        const moved = this.player.x - prevX;
        
        this.updateDarkness(dt, moved);


        if (Math.abs(moved) > 0.1) {
            this.player.play('run', true);
            this.player.setFlipX(moved < 0);
        } else {
            this.player.anims.stop();
            this.player.setTexture('player-idle', 0);
            this.player.setFlipX(false);
        }

        if (this.player.anims.isPlaying) {
            const currentMoveSpeed = Math.abs(moved / dt);
            const animSpeed = Phaser.Math.Clamp(currentMoveSpeed / this.maxSpeed, 0.8, 1.5);
            this.player.anims.timeScale = animSpeed;
        }
       
        this.background.tilePositionX += moved * 0.2;
        this.midground.tilePositionX += moved * 0.5;
        this.foreground.tilePositionX += moved * 1.0;
    }
    
    updateDarkness(dt, moved) {
        if (!this.darkness || this.isFinished) return;
        
        if (!this.darknessActive) {
            if (this.gameStatus === 'started' && this.time.now >= this._darknessStartTime) {
                this.darknessActive = true;
            } else {
                return;
            }
        }

        let speed = this.darknessSpeed;
        if (this.darknessSlowWhenPlayerMoves && moved > 0) {
            // Player is moving forward, darkness is relatively slower
            const playerSpeed = moved / dt;
            speed = Math.max(10, this.darknessSpeed - playerSpeed * 0.5);
        }

        this.darknessX += speed * dt;
        this.darkness.x = this.darknessX;

        // Collision Check
        const darknessRightEdge = this.darkness.x + this.darkness.width;
        const playerCatchPoint = this.player.x - this.darknessBuffer;

        if (darknessRightEdge >= playerCatchPoint) {
            this.isFinished = true; // Stop updates
            this.darknessActive = false;
            this.game.events.emit('darknessCaught');
        }
    }
}

export default function PhaserGame({ typingStatus, gameStatus, progress, onDarknessCaught }) {
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
        
        // Event listener for when the darkness catches the player
        gameInstance.current.events.on('darknessCaught', onDarknessCaught);
        
        return () => {
            if (gameInstance.current) {
                gameInstance.current.events.off('darknessCaught', onDarknessCaught);
                gameInstance.current.destroy(true, false);
                gameInstance.current = null;
            }
        };
    }, [onDarknessCaught]);

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

