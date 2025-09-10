import React from 'react';

export default function Header({ currentPage, setPage }) {
    return (
        <header className="site-header">
            <div className="logo">TypeRacer</div>
            <nav className="main-nav">
                <button className={currentPage === 'game' ? 'active' : ''} onClick={() => setPage('game')}>Game</button>
                <button className={currentPage === 'leaderboard' ? 'active' : ''} onClick={() => setPage('leaderboard')}>Leaderboard</button>
                <button className={currentPage === 'history' ? 'active' : ''} onClick={() => setPage('history')}>History</button>
            </nav>
        </header>
    );
}
