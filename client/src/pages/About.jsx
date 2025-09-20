import React from 'react';

export default function About() {
    return (
        <div className="leaderboard-container about-page">
            <h1 className="leaderboard-title">About TypeRacer</h1>
            <div className="about-content">
                <p>
                    Welcome to TypeRacer, a modern typing game designed to help you improve your typing speed and accuracy in a fun, engaging, and competitive environment.
                </p>
                <p>
                    Our core feature is the dynamic generation of all typing challenges by a powerful AI. This ensures that you get a unique and fresh passage every single time you play, keeping the experience challenging and preventing you from memorizing texts.
                </p>
                <p>
                    Whether you're a beginner looking to learn the basics or a seasoned typist aiming to break your personal records, TypeRacer provides the tools and the platform to help you achieve your goals. Track your progress in the history tab, see how you stack up against others on the leaderboard, and race your way to becoming a typing champion.
                </p>
                <p>
                    This project was built with a modern tech stack including React, Node.js, and Google's Gemini AI.
                </p>
            </div>
        </div>
    );
}

