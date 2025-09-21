import React, { useState, useEffect } from 'react';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import History from './pages/History';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import About from './pages/About';
import Profile from './pages/Profile';
import './App.css';

export default function App() {
    const [page, setPage] = useState('landing');
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    // On initial load, check for a token in localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogin = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setPage('game'); // Redirect to game after login
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setPage('landing'); // Redirect to landing page after logout
    };

    const renderPage = () => {
        switch (page) {
            case 'landing':
                return <LandingPage setPage={setPage} />;
            case 'login':
                return <LoginPage setPage={setPage} onLogin={handleLogin} />;
            case 'leaderboard':
                return <Leaderboard />;
            case 'history':
                 // Pass user and token to history page
                return <History user={user} token={token} />;
            case 'profile':
                // Pass user, token and logout handler to profile page
                return <Profile user={user} token={token} handleLogout={handleLogout} />;
            case 'about':
                return <About />;
            case 'game':
            default:
                // Pass user and token to game page
                return <Game user={user} token={token} />;
        }
    };

    const isLoggedIn = !!token;
    const showHeader = page !== 'landing' && page !== 'login';

    return (
        <div className="app-container">
            {showHeader && (
                <Header 
                    currentPage={page} 
                    setPage={setPage} 
                    isLoggedIn={isLoggedIn}
                    handleLogout={handleLogout}
                />
            )}
            <main className={`main-content ${page === 'game' ? 'game-active' : ''}`}>{renderPage()}</main>
        </div>
    );
}

