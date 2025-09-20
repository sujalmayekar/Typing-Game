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
        <div className="leaderboard-container">
            <h1 className="leaderboard-title">My Game History</h1>
            <div className="table-wrapper">
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>WPM</th>
                            <th>Accuracy</th>
                            <th>Mode</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_HISTORY.map((entry, index) => (
                            <tr key={index}>
                                <td>{entry.date}</td>
                                <td>{entry.wpm}</td>
                                <td>{entry.accuracy}%</td>
                                <td>{entry.mode}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
