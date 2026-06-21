import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/user/study-session
router.post('/study-session', protect, async (req, res) => {
    try {
        const { topic, attentionScore, durationMinutes } = req.body;

        if (!topic || attentionScore === undefined) {
            return res.status(400).json({ error: 'Topic and attentionScore are required' });
        }

        // Add to the beginning of the array so newest is first
        req.user.studySessions.unshift({
            topic,
            attentionScore,
            durationMinutes: durationMinutes || 0
        });

        // Keep only top 20 or so if we want to limit size, but for now we keep all
        await req.user.save();

        res.status(200).json(req.user);
    } catch (error) {
        console.error('Error saving study session:', error);
        res.status(500).json({ error: 'Failed to save study session' });
    }
});

export default router;
