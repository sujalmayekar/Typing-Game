import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Stats from '../components/Stats';
import ScrollingTypingArea from '../components/ScrollingTypingArea';
import PhaserGame from '../components/PhaserGame';
import Results from '../components/Results';
import './Game.css';

const API_URL = 'http://localhost:5001/api';

const fetchAIText = async (level) => {
    try {
        const response = await axios.get(`${API_URL}/text?level=${level}`);
        if (response.data && response.data.text) {
            return response.data.text;
        }
        return "Server responded without text. Please check server logs.";
    } catch (error) {
        console.error("Error fetching AI text:", error);
        return "The server is offline or an error occurred.";
    }
};

const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const levelIndex = { Beginner: 0, Intermediate: 1, Advanced: 2, Expert: 3 };
const TIME_LIMIT = 60;
const REQUIRED_ACCURACY = 85;

export default function Game({ user, token }) {
    const [level, setLevel] = useState('Beginner');
    const [unlockedLevel, setUnlockedLevel] = useState('Beginner');
    const [textToType, setTextToType] = useState('');
    const [userInput, setUserInput] = useState('');
    const [gameStatus, setGameStatus] = useState('waiting'); // 'waiting', 'started', 'finished'
    const [typingStatus, setTypingStatus] = useState('idle'); // 'idle', 'correct', 'incorrect', 'backspacing'
    const [timer, setTimer] = useState(TIME_LIMIT);
    const [finalStats, setFinalStats] = useState(null);
    
    const timerIntervalRef = useRef(null);
    const gameStartTimeRef = useRef(null);
    
    const userInputRef = useRef(userInput);
    userInputRef.current = userInput;
    const idleTimeoutRef = useRef(null);

    const saveGameSession = useCallback(async (stats) => {
        if (!user || !token) return;

        try {
            await axios.post(`${API_URL}/game/save`, {
                wpm: stats.wpm,
                accuracy: stats.accuracy,
                level: level,
            }, {
                headers: { 'x-auth-token': token }
            });
        } catch (error) {
            console.error('Failed to save game session:', error.response ? error.response.data.message : error.message);
        }
    }, [user, token, level]);

    const endGame = useCallback((completedText, caughtByDarkness = false) => {
        setGameStatus((currentStatus) => {
            if (currentStatus === 'finished') return currentStatus;

            clearInterval(timerIntervalRef.current);

            const finalInput = userInputRef.current;
            const timeElapsed = gameStartTimeRef.current ? Math.round((Date.now() - gameStartTimeRef.current) / 1000) : TIME_LIMIT;

            let correctChars = 0;
            finalInput.split('').forEach((char, index) => {
                if (index < textToType.length && char === textToType[index]) {
                    correctChars++;
                }
            });

            const minutes = timeElapsed / 60;
            const finalWPM = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
            const finalAccuracy = finalInput.length > 0 ? Math.round((correctChars / finalInput.length) * 100) : 0;
            
            let message = "";
            let wasSuccessful = false;

            if (caughtByDarkness) {
                message = "Caught by the darkness!";
            } else if (completedText) {
                if (finalAccuracy < REQUIRED_ACCURACY) {
                    message = "Improve Accuracy";
                } else {
                    message = "Level Complete!";
                    wasSuccessful = true;
                }
            } else {
                message = "Time's Up!";
            }

            const stats = {
                wpm: finalWPM,
                accuracy: finalAccuracy,
                time: timeElapsed,
                completed: wasSuccessful,
                message: message
            };

            setFinalStats(stats);
            saveGameSession(stats);

            if (wasSuccessful) {
                const currentLevelIdx = levelIndex[level];
                if (currentLevelIdx < levels.length - 1) {
                    const nextLevel = levels[currentLevelIdx + 1];
                    if (levelIndex[nextLevel] > levelIndex[unlockedLevel]) {
                        setUnlockedLevel(nextLevel);
                    }
                }
            }
            return 'finished';
        });
    }, [textToType, level, unlockedLevel, saveGameSession]);

    const startGame = useCallback(async (selectedLevel) => {
        clearInterval(timerIntervalRef.current);
        setLevel(selectedLevel);
        setGameStatus('waiting');
        setUserInput('');
        setTimer(TIME_LIMIT);
        setFinalStats(null);
        gameStartTimeRef.current = null;
        setTextToType('Loading...');
        const newText = await fetchAIText(selectedLevel);
        setTextToType(newText);
    }, []);

    useEffect(() => {
        startGame('Beginner');
    }, [startGame]);

    useEffect(() => {
        if (gameStatus === 'started') {
            timerIntervalRef.current = setInterval(() => {
                const timeElapsed = Math.round((Date.now() - gameStartTimeRef.current) / 1000);
                const timeRemaining = TIME_LIMIT - timeElapsed;

                if (timeRemaining <= 0) {
                    setTimer(0);
                    endGame(false);
                } else {
                    setTimer(timeRemaining);
                }
            }, 1000);
        } else {
            clearInterval(timerIntervalRef.current);
        }

        return () => clearInterval(timerIntervalRef.current);
    }, [gameStatus, endGame]);

    const handleInputChange = (value) => {
        if (gameStatus === 'finished' || !textToType || textToType === 'Loading...') return;

        if (gameStatus === 'waiting' && value.length > 0) {
            setGameStatus('started');
            gameStartTimeRef.current = Date.now();
        }

        clearTimeout(idleTimeoutRef.current);

        const prev = userInputRef.current;
        let currentStatus = 'idle';

        if (value.length > prev.length) {
            const idx = prev.length;
            currentStatus = (textToType[idx] === value[idx]) ? 'correct' : 'incorrect';
        } else if (value.length < prev.length) {
            currentStatus = 'backspacing';
        }

        setTypingStatus(currentStatus);
        setUserInput(value);

        if (currentStatus === 'correct' || currentStatus === 'backspacing') {
            idleTimeoutRef.current = setTimeout(() => {
                setTypingStatus('idle');
            }, 2000);
        }

        if (value.length === textToType.length) {
            endGame(true);
        }
    };
    
    const handleDarknessCaught = useCallback(() => {
        endGame(false, true);
    }, [endGame]);

    const handleRestart = () => startGame(level);
    const handleNextLevel = () => {
        const currentLevelIdx = levelIndex[level];
        if (currentLevelIdx < levels.length - 1) {
            const nextLevel = levels[currentLevelIdx + 1];
            if (levelIndex[nextLevel] <= levelIndex[unlockedLevel]) {
                startGame(nextLevel);
            }
        }
    };
    
    const progress = textToType.length > 0 ? Math.max(0, Math.min(1, userInput.length / textToType.length)) : 0;
    const canAdvance = finalStats?.completed && finalStats?.accuracy >= REQUIRED_ACCURACY && levelIndex[level] < levels.length - 1;

    return (
        <div className="game-container storyboard">
            {finalStats && <Results stats={finalStats} onRestart={handleRestart} onNextLevel={handleNextLevel} canAdvance={canAdvance} />}
            
            <PhaserGame 
                typingStatus={typingStatus}
                gameStatus={gameStatus}
                progress={progress}
                onDarknessCaught={handleDarknessCaught}
            />

            <Stats timer={timer} gameStatus={gameStatus} />
            <ScrollingTypingArea textToType={textToType} userInput={userInput} onInputChange={handleInputChange} gameStatus={gameStatus} />
            <div className="level-selector">
                {levels.map((lvl) => {
                    const isUnlocked = levelIndex[lvl] <= levelIndex[unlockedLevel];
                    return <button key={lvl} className={`level-button ${level === lvl ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`} onClick={() => isUnlocked && startGame(lvl)} disabled={!isUnlocked}>{lvl}</button>;
                })}
            </div>
        </div>
    );
}
