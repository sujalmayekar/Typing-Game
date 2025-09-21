import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Profile.css';

const API_URL = 'http://localhost:5001/api';

const Avatar = ({ seed }) => {
    const generateAvatar = (str) => {
        if (!str) str = 'default';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        const color = "00000".substring(0, 6 - c.length) + c;
        
        const gradientId = `avatar-gradient-${seed}`;
        const color1 = `#${color}`;
        const color2 = `#${(parseInt(color, 16) * 0.7).toString(16).padStart(6, '0')}`;

        return (
            <svg className="profile-avatar" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: color1 }} />
                        <stop offset="100%" style={{ stopColor: color2 }} />
                    </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="50" fill={`url(#${gradientId})`} />
            </svg>
        );
    };
    return generateAvatar(seed);
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`Date : ${label}`}</p>
          <p className="intro">{`WPM : ${payload[0].value}`}</p>
          <p className="desc">{`Accuracy : ${payload[1].value}%`}</p>
        </div>
      );
    }
    return null;
};

export default function Profile({ token, handleLogout }) {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                setError('You must be logged in to view your profile.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/profile`, {
                    headers: { 'x-auth-token': token }
                });
                setProfileData(response.data);
            } catch (err) {
                setError('Failed to fetch profile data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    if (loading) {
        return <div className="placeholder-page"><h1>Loading Profile...</h1></div>;
    }

    if (error || !profileData) {
        return <div className="placeholder-page"><h1>Profile</h1><p>{error || 'Could not load profile.'}</p> <button onClick={handleLogout}>Logout</button></div>;
    }

    const { user: profileUser, stats, history } = profileData;

    const chartData = [...history].reverse().map(session => ({
        name: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        wpm: session.wpm,
        accuracy: session.accuracy
    }));

    return (
        <div className="profile-container">
            <div className="profile-header">
                <Avatar seed={profileUser.username} />
                <div className="profile-info">
                    <h1 className="profile-username">{profileUser.username}</h1>
                    <p className="profile-joindate">Member since {new Date(profileUser.joinDate).toLocaleDateString()}</p>
                </div>
                 <button onClick={handleLogout} className="btn btn-secondary logout-btn-profile">Logout</button>
            </div>

            <div className="stats-grid">
                 <div className="stat-card">
                    <div className="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg></div>
                    <p className="stat-label">Best WPM</p>
                    <p className="stat-value">{stats.bestWpm}</p>
                </div>
                <div className="stat-card">
                     <div className="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg></div>
                    <p className="stat-label">Avg. WPM</p>
                    <p className="stat-value">{stats.avgWpm}</p>
                </div>
                <div className="stat-card">
                     <div className="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                    <p className="stat-label">Avg. Accuracy</p>
                    <p className="stat-value">{stats.avgAcc}%</p>
                </div>
                <div className="stat-card">
                     <div className="stat-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg></div>
                    <p className="stat-label">Races</p>
                    <p className="stat-value">{stats.races}</p>
                </div>
            </div>

            <div className="profile-section">
                <h2>Performance Overview</h2>
                {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                            <XAxis dataKey="name" stroke="#8a8a8a" />
                            <YAxis stroke="#8a8a8a" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="wpm" stroke="#ffffff" strokeWidth={2} name="WPM" />
                            <Line type="monotone" dataKey="accuracy" stroke="#8a8a8a" strokeWidth={2} name="Accuracy (%)" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                     <div className="chart-placeholder">
                        <p>Complete more races to see your performance chart!</p>
                    </div>
                )}
            </div>

            {history.length > 0 && (
                 <div className="profile-section recent-races-table">
                    <h2>Recent Races</h2>
                     <div className="leaderboard-header">
                        <div>Date</div>
                        <div>WPM</div>
                        <div>Accuracy</div>
                        <div>Mode</div>
                    </div>
                    {history.slice(0, 10).map((race) => (
                        <div className="leaderboard-row" key={race._id}>
                            <div>{new Date(race.date).toLocaleDateString()}</div>
                            <div>{race.wpm}</div>
                            <div>{race.accuracy}%</div>
                            <div>{race.level}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

