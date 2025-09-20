import React from 'react';

export default function History() {
    // Mock data for the user's game history
    const MOCK_HISTORY = [
        { date: '2025-09-20', wpm: 85, accuracy: 97, mode: 'Normal' },
        { date: '2025-09-19', wpm: 78, accuracy: 98, mode: 'Hard' },
        { date: '2025-09-19', wpm: 92, accuracy: 95, mode: 'Normal' },
        { date: '2025-09-18', wpm: 81, accuracy: 99, mode: 'Normal' },
        { date: '2025-09-17', wpm: 75, accuracy: 94, mode: 'Hard' },
        { date: '2025-09-16', wpm: 88, accuracy: 96, mode: 'Normal' },
    ];

    return (
        <div className="placeholder-page leaderboard-container">
            <h1>My Game History</h1>
            <p>Review your past performances to see how you've improved.</p>
            <div className="leaderboard-table">
                <div className="leaderboard-header history-header">
                    <div>Date</div>
                    <div>WPM</div>
                    <div>Accuracy</div>
                    <div>Mode</div>
                </div>
                {MOCK_HISTORY.map((entry, index) => (
                    <div className="leaderboard-row history-row" key={index}>
                        <div>{entry.date}</div>
                        <div>{entry.wpm}</div>
                        <div>{entry.accuracy}%</div>
                        <div>{entry.mode}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

