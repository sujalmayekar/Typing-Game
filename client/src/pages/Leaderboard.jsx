import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get(`${API_URL}/leaderboard`);
                setLeaderboard(response.data);
            } catch (err) {
                setError('Failed to fetch leaderboard data. The server might be down.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return <div className="placeholder-page"><h1>Loading Leaderboard...</h1></div>;
    }

    if (error) {
        return <div className="placeholder-page"><h1>Leaderboard</h1><p>{error}</p></div>;
    }

    return (
        <div className="placeholder-page leaderboard-container">
            <h1>Leaderboard</h1>
            <p>See how you stack up against the fastest typists.</p>
            {leaderboard.length > 0 ? (
                <div className="leaderboard-table">
                    <div className="leaderboard-header">
                        <div>Rank</div>
                        <div>Player</div>
                        <div>WPM</div>
                        <div>Accuracy</div>
                        <div>Top Level</div>
                    </div>
                    {leaderboard.map((player) => (
                        <div className="leaderboard-row" key={player.rank}>
                            <div><span className={`rank-${player.rank}`}>{player.rank}</span></div>
                            <div>{player.name}</div>
                            <div>{player.wpm}</div>
                            <div>{player.accuracy}%</div>
                            <div>{player.level}</div>
                        </div>
                    ))}
                </div>
            ) : (
                 <p>No leaderboard data available yet. Be the first to set a record!</p>
            )}
        </div>
    );
}

