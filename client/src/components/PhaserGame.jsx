import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
// CORRECTED: The import path now uses a capital 'P' to match the actual folder name.
import { GameScene } from '../Phaser/GameScene';
import { BootScene } from '../phaser/BootScene';

export default function PhaserGame({ shootTrigger, textToType }) {
    const gameInstance = useRef(null);
    const phaserContainerRef = useRef(null);
    const words = textToType ? textToType.split(' ').filter(word => word.length > 0) : [];

    // Effect for initializing and destroying the game instance once
    useEffect(() => {
        if (gameInstance.current || !phaserContainerRef.current) return;

        const { width, height } = phaserContainerRef.current.getBoundingClientRect();

        const config = {
            type: Phaser.AUTO,
            width: width,
            height: height,
            parent: 'phaser-container',
            backgroundColor: '#000000',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 300 },
                    debug: false
                }
            },
            scene: [BootScene, GameScene]
        };

        gameInstance.current = new Phaser.Game(config);

        // Cleanup function to destroy the game instance on component unmount
        return () => {
            if (gameInstance.current) {
                gameInstance.current.destroy(true);
                gameInstance.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs only once

    // Effect for starting or restarting the game scene when text changes
    useEffect(() => {
        if (gameInstance.current && textToType && textToType !== 'Loading...') {
            const newWords = textToType.split(' ').filter(w => w.length > 0);
            const game = gameInstance.current;

            // Check if the game has scenes and is ready
            if (game.scene.scenes.length > 0) {
                const bootScene = game.scene.getScene('BootScene');
                const gameScene = game.scene.getScene('GameScene');
                
                // If GameScene is active, restart it with new words
                if (gameScene && gameScene.sys.isActive()) {
                    gameScene.scene.restart({ words: newWords });
                } 
                // Otherwise, start the BootScene, which will load assets and then start GameScene
                else if (bootScene) {
                    game.scene.start('BootScene', { words: newWords });
                }
            }
        }
    }, [textToType]);

    // Effect for handling the shoot trigger
    useEffect(() => {
        if (gameInstance.current && gameInstance.current.scene.isActive('GameScene') && shootTrigger > 0) {
            const scene = gameInstance.current.scene.getScene('GameScene');
            if (scene && scene.shootBullet) { // Check if the method exists
                scene.shootBullet();
            }
        }
    }, [shootTrigger]);

    return <div id="phaser-container" ref={phaserContainerRef} className="racing-track-storyboard" />;
}

