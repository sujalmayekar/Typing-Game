import React from 'react';

// Mock data for past game sessions
const mockHistory = [
    { level: 'Intermediate', wpm: 92, accuracy: 98, date: '2025-09-07' },
    { level: 'Intermediate', wpm: 85, accuracy: 95, date: '2025-09-07' },
    { level: 'Beginner', wpm: 75, accuracy: 100, date: '2025-09-06' },
    { level: 'Beginner', wpm: 68, accuracy: 94, date: '2025-09-06' },
    { level: 'Beginner', wpm: 71, accuracy: 97, date: '2025-09-06' },
];

export default function History() {
    return (
        <div className="placeholder-page history-container">
            <h1>Your History</h1>
            <p>Review your recent typing sessions to track your progress.</p>
            <div className="history-grid">
                {mockHistory.map((session, index) => (
                    <div className="history-card" key={index}>
                        <div className="card-header">
                            <h3>{session.level}</h3>
                            <span>{session.date}</span>
                        </div>
                        <div className="card-body">
                            <div className="card-stat">
                                <span className="value">{session.wpm}</span>
                                <span className="label">WPM</span>
                            </div>
                            <div className="card-stat">
                                <span className="value">{session.accuracy}%</span>
                                <span className="label">Accuracy</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

