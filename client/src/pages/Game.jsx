import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios'; // Make sure axios is imported
import Stats from '../components/Stats';
// We are using the scrolling component now
import ScrollingTypingArea from '../components/ScrollingTypingArea';
import PhaserPlaceHolder from '../components/PhaserPlaceHolder';
import Results from '../components/Results';
import './Game.css';

// This function now correctly calls your backend
const fetchAIText = async (level) => {
    const API_URL = 'http://localhost:5001/api/text';
    try {
        const response = await axios.get(`${API_URL}?level=${level}`);
        if (response.data && response.data.text) {
            return response.data.text;
        }
        // This will be returned if the server response is malformed
        return "Server responded without text. Please check server logs.";
    } catch (error) {
        console.error("Error fetching AI text:", error);
        // This will be displayed in the typing area if the server is offline or errors out
        return "I've updated the ScrollingTypingArea.jsx component to detect whether the text spans one or multiple lines. Based on that, it adds an is-centered class to the display box.";
    }
};


const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const levelIndex = { Beginner: 0, Intermediate: 1, Advanced: 2, Expert: 3 };
const TIME_LIMIT = 60;

export default function Game() {
    const [level, setLevel] = useState('Beginner');
    const [unlockedLevel, setUnlockedLevel] = useState('Beginner');
    const [textToType, setTextToType] = useState('');
    const [userInput, setUserInput] = useState('');
    const [gameStatus, setGameStatus] = useState('waiting');
    const [timer, setTimer] = useState(TIME_LIMIT);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [finalStats, setFinalStats] = useState(null);
    const [errorState, setErrorState] = useState(false); // <-- State for tracking errors
    const timerIntervalRef = useRef(null);
    const gameStartTimeRef = useRef(null);

    const userInputRef = useRef(userInput);
    userInputRef.current = userInput;

    const endGame = useCallback((completedSuccessfully) => {
        if (gameStatus === 'finished') return;
        setGameStatus('finished');
        clearInterval(timerIntervalRef.current);

        const finalInput = userInputRef.current;
        const timeElapsed = gameStartTimeRef.current ? Math.round((Date.now() - gameStartTimeRef.current) / 1000) : 0;

        let correctChars = 0;
        finalInput.split('').forEach((char, index) => {
            if (char === textToType[index]) correctChars++;
        });

        const finalAccuracy = finalInput.length > 0 ? Math.round((correctChars / finalInput.length) * 100) : 0;
        const finalWPM = timeElapsed > 0 ? Math.round((correctChars / 5) / (timeElapsed / 60)) : 0;

        setFinalStats({
            wpm: finalWPM,
            accuracy: finalAccuracy,
            time: timeElapsed,
            completed: completedSuccessfully,
            message: completedSuccessfully ? "Level Complete!" : "Time's Up!"
        });

        if (completedSuccessfully && finalAccuracy >= 85) {
            const currentLevelIdx = levelIndex[level];
            if (currentLevelIdx < levels.length - 1) {
                const nextLevel = levels[currentLevelIdx + 1];
                if (levelIndex[nextLevel] > levelIndex[unlockedLevel]) setUnlockedLevel(nextLevel);
            }
        }
    }, [gameStatus, textToType, level, unlockedLevel]);


    const startGame = useCallback(async (selectedLevel) => {
        clearInterval(timerIntervalRef.current);
        setLevel(selectedLevel);
        setGameStatus('waiting');
        setUserInput('');
        setTimer(TIME_LIMIT);
        setWpm(0);
        setAccuracy(100);
        setErrorState(false);
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
        if (gameStatus !== 'started') return;

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

        return () => clearInterval(timerIntervalRef.current);
    }, [gameStatus, endGame]);

    const handleInputChange = (value) => {
        if (gameStatus === 'finished' || !textToType || textToType === 'Loading...') return;

        if (gameStatus === 'waiting' && value.length > 0) {
            setGameStatus('started');
            gameStartTimeRef.current = Date.now();
        }

        // Check for errors by comparing the input with the source text
        if (textToType.startsWith(value)) {
            setErrorState(false);
        } else {
            setErrorState(true);
        }
        
        setUserInput(value);

        if (!gameStartTimeRef.current) return;

        let correctChars = 0;
        const currentLength = value.length;
        for (let i = 0; i < currentLength; i++) {
            if (value[i] === textToType[i]) {
                correctChars++;
            }
        }

        const timeElapsed = (Date.now() - gameStartTimeRef.current) / 1000;
        const minutes = timeElapsed / 60;

        setAccuracy(currentLength > 0 ? Math.round((correctChars / currentLength) * 100) : 100);
        setWpm(minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0);

        if (currentLength === textToType.length) {
            endGame(true);
        }
    };

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
    
    // Calculate progress based on user input length vs. total text length
    const progress = textToType.length > 0 ? (userInput.length / textToType.length) * 100 : 0;
    const canAdvance = finalStats?.completed && finalStats?.accuracy >= 85 && levelIndex[level] < levels.length - 1;

    return (
        <div className="game-container storyboard">
            {finalStats && <Results stats={finalStats} onRestart={handleRestart} onNextLevel={handleNextLevel} canAdvance={canAdvance} />}
            <PhaserPlaceHolder progress={progress} errorState={errorState} />
            <Stats timer={timer} gameStatus={gameStatus} />
            {/* The simple structure is restored, now using the scrolling component */}
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

