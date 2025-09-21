import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth';

export default function LoginPage({ setPage, onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { username, email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.id]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = isLogin ? '/login' : '/signup';
        const payload = isLogin ? { email, password } : { username, email, password };

        try {
            const response = await axios.post(`${API_URL}${endpoint}`, payload);
            onLogin(response.data); // Pass token and user data up to App.jsx
        } catch (err) {
            const errorMessage = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'An error occurred. Please try again.';
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                <p>{isLogin ? 'Login to track your progress.' : 'Sign up to start your journey.'}</p>
                
                {error && <p className="auth-error">{error}</p>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" id="username" value={username} onChange={onChange} placeholder="Enter your username" required />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={onChange} placeholder="Enter your email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={password} onChange={onChange} placeholder="Enter your password" required minLength="6" />
                    </div>
                    <button type="submit" className="btn btn-auth" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                </form>

                <div className="auth-switch">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }}>
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

