import React from 'react';

export default function Stats({ timer, wpm, accuracy }) {
    return (
        <div className="stats-container">
            <div className="stat-item">
                <div className="label">Time</div>
                <div className="value">{timer}s</div>
            </div>
            <div className="stat-item">
                <div className="label">WPM</div>
                <div className="value">{wpm}</div>
            </div>
            <div className="stat-item">
                <div className="label">Accuracy</div>
                <div className="value">{accuracy}%</div>
            </div>
        </div>
    );
}
