import mongoose from 'mongoose';

const GameSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    wpm: {
        type: Number,
        required: true,
    },
    accuracy: {
        type: Number,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Ensure a user can't have multiple identical entries for the same second
GameSessionSchema.index({ userId: 1, wpm: 1, accuracy: 1, level: 1, date: 1 }, { unique: true });


export default mongoose.model('GameSession', GameSessionSchema);

