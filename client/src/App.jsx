import React, { useState } from 'react';
import Game from './pages/Game.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import History from './pages/History.jsx';
import Header from './components/Header.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import About from './pages/About.jsx';
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
            {showHeader && <Header currentPage={page} setPage={setPage} />}
            <main className="main-content">{renderPage()}</main>
        </div>
    );
}

