import React, { useState } from 'react';
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
    const [page, setPage] = useState('landing'); // Start on the landing page

    const renderPage = () => {
        switch (page) {
            case 'landing':
                return <LandingPage setPage={setPage} />;
            case 'login':
                return <LoginPage setPage={setPage} />;
            case 'leaderboard':
                return <Leaderboard />;
            case 'history':
                return <History />;
            case 'profile':
                return <Profile />;
            case 'about':
                return <About />;
            case 'game':
            default:
                return <Game />;
        }
    };

    // Conditionally render the header
    const showHeader = page !== 'landing' && page !== 'login';

    return (
        <div className="app-container">
            {/* Set isLoggedIn to true to demonstrate profile access */}
            {showHeader && <Header currentPage={page} setPage={setPage} isLoggedIn={true} />}
            <main className="main-content">{renderPage()}</main>
        </div>
    );
}