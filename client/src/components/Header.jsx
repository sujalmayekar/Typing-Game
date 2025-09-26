import React from 'react';

export default function Header({ currentPage, setPage, isLoggedIn, handleLogout }) {
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
                {isLoggedIn && (
                    <button
                        className={currentPage === 'history' ? 'active' : ''}
                        onClick={() => setPage('history')}
                    >
                        History
                    </button>
                )}
                 <button
                    className={currentPage === 'rules' ? 'active' : ''}
                    onClick={() => setPage('rules')}
                >
                    Rules
                </button>
            </nav>

            <div className="header-right">
                {isLoggedIn ? (
                    <>
                        <button 
                            className={`btn btn-secondary profile-btn ${currentPage === 'profile' ? 'active' : ''}`}
                            onClick={() => setPage('profile')}
                        >
                            Profile
                        </button>
                         <button 
                            className="btn btn-secondary logout-btn" 
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <button className="btn btn-primary" onClick={() => setPage('login')}>
                        Login / Sign Up
                    </button>
                )}
            </div>
        </header>
    );
}

