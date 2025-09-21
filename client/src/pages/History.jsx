import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export default function History({ user, token }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user || !token) {
                setError('You must be logged in to view your history.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/history`, {
                    headers: { 'x-auth-token': token }
                });
                setHistory(response.data);
            } catch (err) {
                setError('Failed to fetch game history. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user, token]);

    if (loading) {
        return <div className="placeholder-page"><h1>Loading History...</h1></div>;
    }

    if (error) {
        return <div className="placeholder-page"><h1>My Game History</h1><p>{error}</p></div>;
    }

    return (
        <div className="placeholder-page leaderboard-container">
            <h1>My Game History</h1>
            <p>Review your past performances to see how you've improved.</p>
            {history.length > 0 ? (
                <div className="leaderboard-table">
                    <div className="leaderboard-header history-header">
                        <div>Date</div>
                        <div>WPM</div>
                        <div>Accuracy</div>
                        <div>Level</div>
                    </div>
                    {history.map((entry) => (
                        <div className="leaderboard-row history-row" key={entry._id}>
                            <div>{new Date(entry.date).toLocaleDateString()}</div>
                            <div>{entry.wpm}</div>
                            <div>{entry.accuracy}%</div>
                            <div>{entry.level}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>You haven't completed any games yet. Go play one!</p>
            )}
        </div>
    );
}

