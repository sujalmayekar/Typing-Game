import React from 'react';

export default function Header({ currentPage, setPage, isLoggedIn }) {
    return (
        <header className="site-header">
            <div className="header-left">
                <div className="logo-clickable" onClick={() => setPage('landing')}>
                    <div className="logo">TypeRacer</div>
                </div>
            </div>

            <nav className="main-nav">
                <button
                    className={currentPage === 'game' ? 'active' : ''}
                    onClick={() => setPage('game')}
                >
                    Game
                </button>
                <button
                    className={currentPage === 'leaderboard' ? 'active' : ''}
                    onClick={() => setPage('leaderboard')}
                >
                    Leaderboard
                </button>
                <button
                    className={currentPage === 'history' ? 'active' : ''}
                    onClick={() => setPage('history')}
                >
                    History
                </button>
                 <button
                    className={currentPage === 'about' ? 'active' : ''}
                    onClick={() => setPage('about')}
                >
                    About
                </button>
            </nav>

            <div className="header-right">
                {isLoggedIn ? (
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => setPage('profile')}
                    >
                        Profile
                    </button>
                ) : (
                    <button className="btn btn-login" onClick={() => setPage('login')}>
                        Login
                    </button>
                )}
            </div>
        </header>
    );
}

