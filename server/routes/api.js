import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import GameSession from '../models/GameSession.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// --- AUTH ROUTES ---

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with that email already exists' });
        }
        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        user = new User({ username, email, password });
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email, joinDate: user.joinDate } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, email: user.email, joinDate: user.joinDate } });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- USER PROFILE ---

// @route   GET /api/profile
// @desc    Get current user's profile data
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const sessions = await GameSession.find({ userId: req.user.id }).sort({ date: -1 });

        const stats = {
            bestWpm: 0,
            avgWpm: 0,
            avgAcc: 0,
            races: sessions.length,
        };

        if (sessions.length > 0) {
            stats.bestWpm = Math.max(...sessions.map(s => s.wpm));
            const totalWpm = sessions.reduce((acc, s) => acc + s.wpm, 0);
            stats.avgWpm = Math.round(totalWpm / sessions.length);
            const totalAcc = sessions.reduce((acc, s) => acc + s.accuracy, 0);
            stats.avgAcc = Math.round(totalAcc / sessions.length);
        }

        res.json({ user, stats, history: sessions }); 
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// --- GAME & LEADERBOARD ROUTES ---

// @route   POST /api/game/save
// @desc    Save a game session result
// @access  Private
router.post('/game/save', authMiddleware, async (req, res) => {
    const { wpm, accuracy, level } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
             return res.status(404).json({ message: 'User not found' });
        }

        const newSession = new GameSession({
            userId: req.user.id,
            username: user.username,
            wpm,
            accuracy,
            level
        });

        await newSession.save();
        res.status(201).json(newSession);

    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(409).json({ message: "Duplicate game session detected." });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/leaderboard
// @desc    Get top 10 players based on level, wpm, and accuracy
// @access  Public
router.get('/leaderboard', async (req, res) => {
    try {
        // Aggregation pipeline for custom sorting
        const leaderboard = await GameSession.aggregate([
            // 1. Get the best score for each user
            {
                $sort: {
                    wpm: -1,
                    accuracy: -1
                }
            },
            {
                $group: {
                    _id: "$userId",
                    username: { $first: "$username" },
                    bestWpm: { $first: "$wpm" },
                    bestAccuracy: { $first: "$accuracy" },
                    topLevel: { $first: "$level" }
                }
            },
            // 2. Add a numeric score for level to allow proper sorting
            {
                $addFields: {
                    levelScore: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$topLevel", "Expert"] }, then: 4 },
                                { case: { $eq: ["$topLevel", "Advanced"] }, then: 3 },
                                { case: { $eq: ["$topLevel", "Intermediate"] }, then: 2 },
                                { case: { $eq: ["$topLevel", "Beginner"] }, then: 1 }
                            ],
                            default: 0
                        }
                    }
                }
            },
            // 3. Sort by the new criteria: level > wpm > accuracy
            {
                $sort: {
                    levelScore: -1,
                    bestWpm: -1,
                    bestAccuracy: -1
                }
            },
            // 4. Limit to the top 10 players
            { $limit: 10 },
            // 5. Format the final output
            {
                $project: {
                    _id: 0,
                    name: "$username",
                    wpm: "$bestWpm",
                    accuracy: "$bestAccuracy",
                    level: "$topLevel"
                }
            }
        ]);

        // Add rank to the results
        const rankedLeaderboard = leaderboard.map((player, index) => ({
            rank: index + 1,
            ...player
        }));
        
        res.json(rankedLeaderboard);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET /api/history
// @desc    Get user's full game history
// @access  Private
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const history = await GameSession.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


export default router;

