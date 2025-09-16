import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- REMOVED OPENAI API ---
// We no longer need to connect to the OpenAI service.

// --- MongoDB Connection ---
// We keep this for when we add user accounts and leaderboards later.
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Pre-defined Text Bank (Free Alternative) ---
const textBank = {
    Beginner: [
        "The sun is very bright today.",
        "A journey of a thousand miles begins with a single step.",
        "An apple a day keeps the doctor away.",
        "The early bird catches the worm.",
        "Never give up on your dreams.",
    ],
    Intermediate: [
        "Success is not the key to happiness. Happiness is the key to success.",
        "The best way to predict the future is to create it yourself.",
        "Technology has advanced rapidly over the last few decades.",
        "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    ],
    Advanced: [
        "The philosophical intricacies of existentialism challenge our perceptions of freedom and responsibility.",
        "In the realm of quantum mechanics, particles can exist in multiple states simultaneously, a phenomenon known as superposition.",
        "Cryptocurrency represents a paradigm shift in financial technology, utilizing decentralized blockchain networks for security.",
    ],
    Expert: [
        "Bioinformatics algorithms are crucial for analyzing voluminous genomic datasets to identify genetic markers for diseases.",
        "The geopolitical ramifications of global climate change necessitate international cooperation on unprecedented scales.",
        "Metacognition, the awareness of one's own thought processes, is a cornerstone of effective learning and problem-solving strategies.",
    ]
};

// --- API Routes ---

/**
 * @route   GET /api/text/:level
 * @desc    Gets a random typing challenge text from the local text bank
 * @access  Public
 */
app.get('/api/text/:level', (req, res) => {
    const { level } = req.params;
    const textsForLevel = textBank[level] || textBank.Beginner;
    
    // Pick a random text from the array for the given level
    const randomIndex = Math.floor(Math.random() * textsForLevel.length);
    const text = textsForLevel[randomIndex];

    res.json({ text });
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

