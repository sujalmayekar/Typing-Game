import React from 'react';

export default function LandingPage({ setPage }) {
    return (
        <div className="landing-container">
            <h1 className="landing-title">TypeRacer</h1>
            <p className="landing-subtitle">The AI-powered typing challenge</p>
            <div className="landing-buttons">
                <button 
                    className="btn btn-primary" 
                    onClick={() => setPage('game')}
                >
                    Start Game
                </button>
                <button 
                    className="btn btn-secondary" 
                    onClick={() => setPage('login')}
                >
                    Login / Sign Up
                </button>
            </div>
        </div>
    );
}
