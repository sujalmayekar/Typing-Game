import React from 'react';

// Mock data to simulate a real leaderboard
const mockLeaderboard = [
    { rank: 1, name: 'VelocityViper', wpm: 152, accuracy: 99, level: 'Expert' },
    { rank: 2, name: 'TypingTornado', wpm: 148, accuracy: 100, level: 'Expert' },
    { rank: 3, name: 'KeyMasher', wpm: 135, accuracy: 97, level: 'Expert' },
    { rank: 4, name: 'CodeSlinger', wpm: 121, accuracy: 98, level: 'Advanced' },
    { rank: 5, name: 'QuickFingers', wpm: 115, accuracy: 99, level: 'Advanced' },
    { rank: 6, name: 'LetterLasso', wpm: 109, accuracy: 100, level: 'Advanced' },
    { rank: 7, name: 'SteadyKeys', wpm: 95, accuracy: 100, level: 'Intermediate' },
    { rank: 8, name: 'FirstTry', wpm: 88, accuracy: 96, level: 'Intermediate' },
];

export default function Leaderboard() {
    return (
        <div className="placeholder-page leaderboard-container">
            <h1>Leaderboard</h1>
            <p>See how you stack up against the fastest typists.</p>
            <div className="leaderboard-table">
                <div className="leaderboard-header">
                    <div>Rank</div>
                    <div>Player</div>
                    <div>WPM</div>
                    <div>Accuracy</div>
                    <div>Top Level</div>
                </div>
                {mockLeaderboard.map((player) => (
                    <div className="leaderboard-row" key={player.rank}>
                        <div><span className={`rank-${player.rank}`}>{player.rank}</span></div>
                        <div>{player.name}</div>
                        <div>{player.wpm}</div>
                        <div>{player.accuracy}%</div>
                        <div>{player.level}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

