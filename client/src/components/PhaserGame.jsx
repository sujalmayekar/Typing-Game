import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

// === PHASER GAME SCENE ===
// This class contains all the logic for the zombie survival game itself.

class ZombieScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ZombieScene' });
        this.player = null;
        this.zombies = null;
        this.bullets = null;
        this.playerHealth = 100;
        this.healthText = null;
        this.fireRate = 500; // ms between shots, will be updated by WPM
        this.nextFire = 0;
    }

    preload() {
        // --- UPDATED ASSET PATHS ---
        // Loading assets from the new subdirectories in /public/assets/

        this.load.image('background', '/assets/background.png');
        this.load.image('bullet', 'https://placehold.co/15x5/f1c40f/000000?text=');

        // Main Character (mc) Spritesheets
        this.load.spritesheet('player_idle_sheet', '/assets/mc/Idle.png', { frameWidth: 200, frameHeight: 200 });
        this.load.spritesheet('player_attack_sheet', '/assets/mc/Shot_1.png', { frameWidth: 200, frameHeight: 200 });
        this.load.spritesheet('player_hurt_sheet', '/assets/mc/Hurt.png', { frameWidth: 200, frameHeight: 200 });
        this.load.spritesheet('player_dead_sheet', '/assets/mc/Dead.png', { frameWidth: 200, frameHeight: 200 });

        // Zombie Spritesheets (now loading all three types)
        this.load.spritesheet('zombie_1_walk_sheet', '/assets/Zombie_1/Walk.png', { frameWidth: 200, frameHeight: 200 });
        this.load.spritesheet('zombie_1_dead_sheet', '/assets/Zombie_1/Dead.png', { frameWidth: 200, frameHeight: 200 });
        
        this.load.spritesheet('zombie_2_walk_sheet', '/assets/Zombie_2/Walk.png', { frameWidth: 200, frameHeight: 200 });
        this.load.spritesheet('zombie_2_dead_sheet', '/assets/Zombie_2/Dead.png', { frameWidth: 200, frameHeight: 200 });

        this.load.spritesheet('zombie_3_walk_sheet', '/assets/Zombie_3/Walk.png', { frameWidth: 200, frameHeight: 200 });
        this.load.spritesheet('zombie_3_dead_sheet', '/assets/Zombie_3/Dead.png', { frameWidth: 200, frameHeight: 200 });

        // Effects Spritesheet (assuming this is still in the root assets folder)
        this.load.spritesheet('explosion_sheet', '/assets/Explosion.png', { frameWidth: 128, frameHeight: 128 });
    }

    create() {
        // Set up the game world
        this.background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        this.background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // --- Create all animations ---
        // Player Animations
        this.anims.create({ key: 'player_idle', frames: this.anims.generateFrameNumbers('player_idle_sheet'), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'player_attack', frames: this.anims.generateFrameNumbers('player_attack_sheet'), frameRate: 20, repeat: 0 });
        this.anims.create({ key: 'player_hurt', frames: this.anims.generateFrameNumbers('player_hurt_sheet'), frameRate: 10, repeat: 0 });
        this.anims.create({ key: 'player_dead', frames: this.anims.generateFrameNumbers('player_dead_sheet'), frameRate: 10, repeat: 0 });
        
        // Zombie Animations
        this.anims.create({ key: 'zombie_1_walk', frames: this.anims.generateFrameNumbers('zombie_1_walk_sheet'), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'zombie_1_dead', frames: this.anims.generateFrameNumbers('zombie_1_dead_sheet'), frameRate: 10, repeat: 0 });
        this.anims.create({ key: 'zombie_2_walk', frames: this.anims.generateFrameNumbers('zombie_2_walk_sheet'), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'zombie_2_dead', frames: this.anims.generateFrameNumbers('zombie_2_dead_sheet'), frameRate: 10, repeat: 0 });
        this.anims.create({ key: 'zombie_3_walk', frames: this.anims.generateFrameNumbers('zombie_3_walk_sheet'), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'zombie_3_dead', frames: this.anims.generateFrameNumbers('zombie_3_dead_sheet'), frameRate: 10, repeat: 0 });

        // Effect Animations
        this.anims.create({ key: 'explode', frames: this.anims.generateFrameNumbers('explosion_sheet'), frameRate: 20, repeat: 0, hideOnComplete: true });

        // Player
        this.player = this.physics.add.sprite(100, this.cameras.main.height - 100, 'player_idle_sheet');
        this.player.setCollideWorldBounds(true).setScale(0.8);
        this.player.play('player_idle');
        this.player.on('animationcomplete', (animation) => {
            if (animation.key !== 'player_idle') {
                this.player.play('player_idle');
            }
        }, this);

        // Groups
        this.zombies = this.physics.add.group();
        this.bullets = this.physics.add.group();
        
        // UI
        this.healthText = this.add.text(16, 16, `Health: ${this.playerHealth}%`, { fontSize: '24px', fill: '#ffffff', fontStyle: 'bold' });

        // Collisions
        this.physics.add.overlap(this.bullets, this.zombies, this.bulletHitZombie, null, this);
        this.physics.add.overlap(this.player, this.zombies, this.zombieHitPlayer, null, this);

        // Event Listeners
        this.events.on('fireBullet', this.fireBullet, this);
        this.events.on('updateGameData', this.updateGameData, this);
        this.events.on('setPlayerErrorState', this.setPlayerErrorState, this);
        this.events.on('startGame', this.startGame, this);
    }

    startGame(level) {
        // Reset game state
        this.playerHealth = 100;
        this.healthText.setText(`Health: ${this.playerHealth}%`);
        this.zombies.clear(true, true);
        this.bullets.clear(true, true);
        this.player.clearTint();
        this.player.play('player_idle');
        this.physics.resume();

        const zombieConfig = {
            Beginner: { count: 5, speed: -50 },
            Intermediate: { count: 10, speed: -75 },
            Advanced: { count: 15, speed: -100 },
            Expert: { count: 20, speed: -125 },
        };
        const config = zombieConfig[level] || zombieConfig.Beginner;
        const zombieTypes = ['zombie_1', 'zombie_2', 'zombie_3'];

        for (let i = 0; i < config.count; i++) {
            // --- NEW: Randomly select a zombie type ---
            const randomType = Phaser.Utils.Array.GetRandom(zombieTypes);
            const walkSheet = `${randomType}_walk_sheet`;
            const deadAnim = `${randomType}_dead`;

            const y = this.cameras.main.height - 100;
            const x = this.cameras.main.width + Phaser.Math.Between(200, 2000);
            
            const zombie = this.zombies.create(x, y, walkSheet);
            zombie.setData('deadAnim', deadAnim); // Store the correct dead animation key
            zombie.setVelocityX(config.speed);
            zombie.setScale(0.8).setFlipX(true);
            zombie.play(`${randomType}_walk`);
        }
    }
    
    updateGameData({ wpm, accuracy }) {
        this.fireRate = Math.max(100, 600 - (wpm * 4));
        const baseSpeed = -50;
        const speedPenalty = (100 - accuracy) * 1.5;
        const newSpeed = baseSpeed - speedPenalty;
        this.zombies.getChildren().forEach(zombie => {
             if (zombie.active) zombie.setVelocityX(Math.min(-10, newSpeed));
        });
    }

    fireBullet(time) {
        if (time < this.nextFire) return;
        if (this.player.anims.currentAnim.key === 'player_idle') {
            this.player.play('player_attack');
            const bullet = this.bullets.create(this.player.x + 50, this.player.y - 15, 'bullet');
            bullet.setVelocityX(800);
            bullet.body.allowGravity = false;
            this.nextFire = time + this.fireRate;
        }
    }

    bulletHitZombie(bullet, zombie) {
        bullet.destroy();
        this.add.sprite(zombie.x, zombie.y, 'explosion_sheet').setScale(0.8).play('explode');
        zombie.disableBody(true, false);
        // Use the stored dead animation key
        zombie.play(zombie.getData('deadAnim'));
        zombie.on('animationcomplete', () => zombie.destroy());
    }

    zombieHitPlayer(player, zombie) {
        if (!player.body.touching.none) {
            zombie.destroy();
            this.playerHealth -= 20;
            this.healthText.setText(`Health: ${this.playerHealth}%`);

            if (this.playerHealth > 0) {
                player.play('player_hurt');
            } else {
                this.physics.pause();
                player.play('player_dead');
                this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'GAME OVER', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5);
            }
        }
    }
    
    setPlayerErrorState(isError) {
        if (isError) {
            this.player.setTint(0xff0000);
        } else {
            this.player.clearTint();
        }
    }
}


// === REACT COMPONENT (No changes needed here) ===
export default function PhaserGame({ correctWordCount, wpm, accuracy, errorState, gameStatus, level }) {
    const gameInstance = useRef(null);

    useEffect(() => {
        const config = {
            type: Phaser.AUTO,
            width: '100%',
            height: '100%',
            parent: 'phaser-container',
            transparent: true,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 }, // Disable gravity for a 2D side-view
                    debug: false
                }
            },
            scene: [ZombieScene]
        };

        gameInstance.current = new Phaser.Game(config);
        
        return () => {
            gameInstance.current.destroy(true);
        };
    }, []);
    
    useEffect(() => {
        if (gameInstance.current && gameStatus === 'started') {
            const scene = gameInstance.current.scene.getScene('ZombieScene');
            if(scene && scene.sys.isActive()) {
                 scene.events.emit('startGame', level);
            }
        }
    }, [gameStatus, level]);

    useEffect(() => {
        if (gameInstance.current && gameInstance.current.scene.getScene('ZombieScene')) {
            const scene = gameInstance.current.scene.getScene('ZombieScene');
             if(scene && scene.sys.isActive()) {
                scene.events.emit('updateGameData', { wpm, accuracy });
                scene.events.emit('setPlayerErrorState', errorState);
             }
        }
    }, [wpm, accuracy, errorState]);

    useEffect(() => {
        if (correctWordCount > 0 && gameInstance.current) {
             const scene = gameInstance.current.scene.getScene('ZombieScene');
             if(scene && scene.sys.isActive()) {
                scene.events.emit('fireBullet', gameInstance.current.getTime());
             }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [correctWordCount]);

    return <div id="phaser-container" className="racing-track-storyboard" style={{ width: '100%', height: '100%' }} />;
}

