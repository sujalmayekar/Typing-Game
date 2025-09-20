import React from 'react';
import './Profile.css';

// Mock data to simulate a real user profile
const MOCK_USER = {
    username: 'VelocityViper',
    joinDate: '2025-08-15',
    avatarSeed: 'velocityviper' // Seed for generating a consistent avatar
};

const MOCK_STATS = {
    bestWpm: 152,
    avgWpm: 128,
    avgAcc: 98,
    races: 241
};

const MOCK_HISTORY = [
    { date: '2025-09-20', wpm: 148, accuracy: 99, mode: 'Expert' },
    { date: '2025-09-20', wpm: 152, accuracy: 97, mode: 'Expert' },
    { date: '2025-09-19', wpm: 135, accuracy: 100, mode: 'Advanced' },
    { date: '2025-09-18', wpm: 121, accuracy: 98, mode: 'Advanced' },
    { date: '2025-09-17', wpm: 115, accuracy: 99, mode: 'Intermediate' }
];


// Simple component to generate a unique SVG avatar from a string
const Avatar = ({ seed }) => {
    const generateAvatar = (str) => {
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


export default function Profile() {
    return (
        <div className="profile-container">
            <div className="profile-header">
                <Avatar seed={MOCK_USER.avatarSeed} />
                <div className="profile-info">
                    <h1 className="profile-username">{MOCK_USER.username}</h1>
                    <p className="profile-joindate">Member since {MOCK_USER.joinDate}</p>
                </div>
            </div>

            <div className="stats-grid">
                 <div className="stat-card">
                    <div className="stat-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                    </div>
                    <p className="stat-label">Best WPM</p>
                    <p className="stat-value">{MOCK_STATS.bestWpm}</p>
                </div>
                <div className="stat-card">
                     <div className="stat-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
                    </div>
                    <p className="stat-label">Avg. WPM</p>
                    <p className="stat-value">{MOCK_STATS.avgWpm}</p>
                </div>
                <div className="stat-card">
                     <div className="stat-icon">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="stat-label">Avg. Accuracy</p>
                    <p className="stat-value">{MOCK_STATS.avgAcc}%</p>
                </div>
                <div className="stat-card">
                     <div className="stat-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
                    </div>
                    <p className="stat-label">Races</p>
                    <p className="stat-value">{MOCK_STATS.races}</p>
                </div>
            </div>

            <div className="profile-section">
                <h2>Performance Overview</h2>
                <div className="chart-placeholder">
                    <p>WPM Performance Chart Coming Soon</p>
                </div>
            </div>
             <div className="profile-section recent-races-table">
                <h2>Recent Races</h2>
                 <div className="leaderboard-header">
                    <div>Date</div>
                    <div>WPM</div>
                    <div>Accuracy</div>
                    <div>Mode</div>
                </div>
                {MOCK_HISTORY.map((race, index) => (
                    <div className="leaderboard-row" key={index}>
                        <div>{race.date}</div>
                        <div>{race.wpm}</div>
                        <div>{race.accuracy}%</div>
                        <div>{race.mode}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}