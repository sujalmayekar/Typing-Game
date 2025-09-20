import React, { useState, useEffect, useRef } from 'react';

export default function Header({ currentPage, setPage, isLoggedIn }) {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);


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
                    <div className="profile-container" ref={dropdownRef}>
                        <button className="btn btn-profile" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                            Profile
                        </button>
                        {isDropdownOpen && (
                            <div className="profile-dropdown">
                                <button onClick={() => { setPage('profile'); setDropdownOpen(false); }}>My Profile</button>
                                <button onClick={() => { setPage('settings'); setDropdownOpen(false); }}>Settings</button>
                                <div className="dropdown-divider"></div>
                                <button>Logout</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button className="btn btn-login" onClick={() => setPage('login')}>
                        Login
                    </button>
                )}
            </div>
        </header>
    );
}

