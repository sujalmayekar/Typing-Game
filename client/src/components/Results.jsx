import React from 'react';

export default function Results({ stats, onRestart, onNextLevel, canAdvance }) {
    return (
        <div className="results-overlay">
            <div className="results-modal">
                {/* The title is now dynamic based on how the game ended */}
                <h2>{stats.message}</h2>
                <div className="results-stats">
                    <div className="stat-item">
                        <div className="label">Time</div>
                        <div className="value">{stats.time}s</div>
                    </div>
                    <div className="stat-item">
                        <div className="label">WPM</div>
                        <div className="value">{stats.wpm}</div>
                    </div>
                    <div className="stat-item">
                        <div className="label">Accuracy</div>
                        <div className="value">{stats.accuracy}%</div>
                    </div>
                </div>
                <div className="results-buttons">
                    <button className="restart-button" onClick={onRestart}>Try Again</button>
                    {canAdvance && (
                        <button className="next-level-button" onClick={onNextLevel}>Next Level</button>
                    )}
                </div>
            </div>
        </div>
    );
}
