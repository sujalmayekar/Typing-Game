import React, { useState } from 'react';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import History from './pages/History';
import Header from './components/Header';
import './App.css';

export default function App() {
    const [page, setPage] = useState('game');

    const renderPage = () => {
        switch (page) {
            case 'leaderboard':
                return <Leaderboard />;
            case 'history':
                return <History />;
            default:
                return <Game />;
        }
    };

    return (
        <div className="app-container">
            <Header currentPage={page} setPage={setPage} />
            <main className="main-content">{renderPage()}</main>
        </div>
    );
}
