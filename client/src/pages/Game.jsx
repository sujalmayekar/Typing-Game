import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios'; // Import axios for API requests
import Stats from '../components/Stats';
import TypingArea from '../components/TypingArea';
import RacingTrack from '../components/RacingTrack';
import Results from '../components/Results';

// The API base URL for your backend server
const API_URL = 'http://localhost:5001';

// This function now fetches text from your backend
const fetchAIText = async (level) => {
    try {
        const response = await axios.get(`${API_URL}/api/text/${level}`);
        return response.data.text;
    } catch (error) {
        console.error("Error fetching AI text:", error);
        // Return a default text if the API call fails
        return "The server seems to be offline. Please try again later.";
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
    const [errorState, setErrorState] = useState(false);
    const [finalStats, setFinalStats] = useState(null);
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

        setUserInput(value);

        if (!gameStartTimeRef.current) return;

        let correctChars = 0;
        const currentLength = value.length;
        for (let i = 0; i < currentLength; i++) {
            if (value[i] === textToType[i]) {
                correctChars++;
            }
        }

        const lastCharIndex = currentLength - 1;
        const isError = textToType[lastCharIndex] && value[lastCharIndex] !== textToType[lastCharIndex];
        if (isError) {
            setErrorState(true);
            setTimeout(() => setErrorState(false), 400);
        }

        const timeElapsed = (Date.now() - gameStartTimeRef.current) / 1000;
        const minutes = timeElapsed / 60;
        
        setAccuracy(currentLength > 0 ? Math.round((correctChars / currentLength) * 100) : 100);
        setWpm(minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0);

        if (value.length === textToType.length) {
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

    const correctCharCount = userInput.split('').filter((char, index) => char === textToType[index]).length;
    const progress = textToType.length > 0 ? (correctCharCount / textToType.length) * 100 : 0;
    const canAdvance = finalStats?.completed && finalStats?.accuracy >= 85 && levelIndex[level] < levels.length - 1;

    return (
        <div className="game-container">
            {finalStats && <Results stats={finalStats} onRestart={handleRestart} onNextLevel={handleNextLevel} canAdvance={canAdvance} />}
            <RacingTrack progress={progress} errorState={errorState} />
            <Stats timer={timer} wpm={wpm} accuracy={accuracy} />
            <TypingArea textToType={textToType} userInput={userInput} onInputChange={handleInputChange} gameStatus={gameStatus} />
            <div className="level-selector">
                {levels.map((lvl) => {
                    const isUnlocked = levelIndex[lvl] <= levelIndex[unlockedLevel];
                    return <button key={lvl} className={`level-button ${level === lvl ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`} onClick={() => isUnlocked && startGame(lvl)} disabled={!isUnlocked}>{lvl}</button>;
                })}
            </div>
        </div>
    );
}
