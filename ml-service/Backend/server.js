import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // Load from current directory (Backend)
dotenv.config({ path: path.join(__dirname, '../.env') }); // Fallback to parent
dotenv.config({ path: path.join(__dirname, '../.env.local') }); // Fallback to parent local

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Load API Keys from environment variables
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || process.env.VITE_API_KEY;

if (!YOUTUBE_API_KEY) {
    console.error("CRITICAL: YOUTUBE_API_KEY is missing.");
}

// --- YouTube API ---
app.get('/api/videos', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: 'Query is required' });
        if (!YOUTUBE_API_KEY) return res.status(500).json({ error: 'Missing YouTube API Key' });

        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: `${query} educational tutorial`,
                type: 'video',
                videoDuration: 'long',
                maxResults: 15,
                order: 'relevance',
                safeSearch: 'strict',
                key: YOUTUBE_API_KEY,
            }
        });

        const videos = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
        }));
        res.json({ videos });
    } catch (error) {
        console.error('YouTube API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch videos from YouTube' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
