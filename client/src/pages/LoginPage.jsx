import React, { useState } from 'react';

export default function LoginPage({ setPage }) {
    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, you'd handle form submission here.
        // For now, we'll just navigate to the game page after "logging in".
        setPage('game');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                <p>{isLogin ? 'Login to track your progress.' : 'Sign up to start your journey.'}</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" placeholder="Enter your username" required />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" placeholder="Enter your email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="Enter your password" required />
                    </div>
                    <button type="submit" className="btn btn-auth">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-switch">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </div>
                 <button className="btn-back" onClick={() => setPage('landing')}>
                    &larr; Back to Home
                </button>
            </div>
        </div>
    );
}
