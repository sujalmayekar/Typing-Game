import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Initialize Google Gemini Client ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// --- Text Generation Logic (Unchanged) ---
const getTextForLevel = async (level) => {
    let prompt;
    switch (level) {
        case 'Beginner':
            prompt = "Generate one simple, encouraging sentence that is easy to type. Around 10-15 words. Do not include quotes or special characters.";
            break;
        case 'Intermediate':
            prompt = "Generate a single, interesting sentence that is moderately complex. Around 20-25 words. Do not include quotes.";
            break;
        case 'Advanced':
            prompt = "Generate a sentence on a topic like science or history and include special characters. Total around 25-30 words. Do not include quotes.";
            break;
        case 'Expert':
            prompt = "Generate two connected sentences on a topic like science or history. Total around 30-40 words. Do not include quotes.";
            break;
        default:
            prompt = "Generate one simple sentence. Around 10 words. Do not include quotes.";
            break;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        const rawText = response.text();
        const cleanText = rawText
            .trim()
            .replace(/[\r\n]+/g, ' ')
            .replace(/^["']|["']$/g, '');

        return cleanText;

    } catch (error) {
        console.error("Error fetching text from Google Gemini API:", error.message);
        return "The server is online, but there was an issue with the AI text generator.";
    }
};

// --- API Routes ---

// Text Generation Route (Kept separate for clarity)
app.get('/api/text', async (req, res) => {
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        const { level = 'Beginner' } = req.query;
        const text = await getTextForLevel(level);
        res.json({ text });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch text', error: error.message });
    }
});

// All other API routes (Auth, User, Game Data)
app.use('/api', apiRoutes);


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

