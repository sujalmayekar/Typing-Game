import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.zombies = null;
        this.bullets = null;
        this.zombieTypes = ['Zombie1', 'Zombie2', 'Zombie3', 'Zombie4'];
        this.words = [];
    }

    init(data) {
        // This method is called when the scene starts or restarts.
        // We get the new words for the level here.
        this.words = data.words || [];
    }

    create() {
        // --- Setup Background ---
        const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height, 'background').setOrigin(0.5, 1);
        const scale = this.cameras.main.width / bg.width;
        bg.setScale(scale);

        const groundY = this.cameras.main.height - 120;

        // --- Create Animations (if they don't exist) ---
        // This check prevents errors when the scene restarts.
        if (!this.anims.exists('player_idle_anim')) {
            this.createPlayerAnims();
            this.createZombieAnims();
        }

        // --- Create Player ---
        this.player = this.physics.add.sprite(150, groundY, 'player_idle').setScale(1.5).setDepth(1);
        this.player.setCollideWorldBounds(true);
        this.player.play('player_idle_anim');

        // --- Create Groups ---
        this.bullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 30 });
        this.zombies = this.physics.add.group();
        
        // Spawn the zombies for the current level
        this.spawnZombies();

        // --- Setup Physics Collisions ---
        this.physics.add.overlap(this.bullets, this.zombies, this.handleBulletZombieCollision, null, this);
    }

    createPlayerAnims() {
        this.anims.create({
            key: 'player_idle_anim',
            frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 11 }),
            frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: 'player_shot_anim',
            frames: this.anims.generateFrameNumbers('player_shot', { start: 0, end: 3 }),
            frameRate: 20, repeat: 0
        });
    }

    createZombieAnims() {
        this.zombieTypes.forEach(type => {
            this.anims.create({
                key: `${type}_walk_anim`,
                frames: this.anims.generateFrameNumbers(`${type}_walk`, { start: 0, end: 11 }),
                frameRate: 8, repeat: -1
            });
            this.anims.create({
                key: `${type}_dead_anim`,
                frames: this.anims.generateFrameNumbers(`${type}_dead`, { start: 0, end: 11 }),
                frameRate: 15, repeat: 0
            });
        });
    }

    spawnZombies() {
        const groundY = this.cameras.main.height - 120;
        const startX = this.cameras.main.width + 200;

        this.words.forEach((word, index) => {
            const zombieType = this.zombieTypes[index % this.zombieTypes.length];
            const spawnX = startX + (index * Phaser.Math.Between(150, 300));
            
            const zombie = this.zombies.create(spawnX, groundY, `${zombieType}_walk`);
            if (zombie) {
                zombie.setScale(1.5).setDepth(1);
                zombie.play(`${zombieType}_walk_anim`);
                zombie.setVelocityX(Phaser.Math.Between(-80, -120));
                zombie.setData({ word, type: zombieType });
                zombie.body.setSize(zombie.width * 0.5, zombie.height * 0.8);

                const text = this.add.text(0, 0, word, {
                    font: '24px Arial', fill: '#ffffff',
                    backgroundColor: 'rgba(0,0,0,0.5)', padding: { x: 10, y: 5 }
                }).setOrigin(0.5, 1);
                
                zombie.setData('textDisplay', text);
            }
        });
    }

    update() {
        // Make words follow zombies
        this.zombies.getChildren().forEach(zombie => {
            const text = zombie.getData('textDisplay');
            if (text && zombie.active) {
                text.x = zombie.x;
                text.y = zombie.y - zombie.height * 0.6;
            }
        });

        // Clean up bullets that go off-screen
        this.bullets.getChildren().forEach(bullet => {
            if (bullet.x > this.cameras.main.width + 50) {
                bullet.destroy();
            }
        });
    }

    shootBullet() {
        this.player.play('player_shot_anim', true).on('animationcomplete', () => {
            this.player.play('player_idle_anim', true);
        }, this);

        const bullet = this.bullets.get(this.player.x + 80, this.player.y - 15);
        if (bullet) {
            bullet.setActive(true).setVisible(true).setScale(0.1);
            bullet.setVelocityX(800);
            bullet.body.setAllowGravity(false);
        }
    }

    handleBulletZombieCollision(bullet, zombie) {
        bullet.destroy();
        
        const zombieType = zombie.getData('type');
        zombie.disableBody(true, false);
        zombie.play(`${zombieType}_dead_anim`, true);

        const text = zombie.getData('textDisplay');
        if (text) text.destroy();

        zombie.on('animationcomplete', () => zombie.destroy());
    }
}

