import express from 'express';
import cors from 'cors';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // Load from current directory (Backend)
dotenv.config({ path: path.join(__dirname, '../.env') }); // Fallback to parent
dotenv.config({ path: path.join(__dirname, '../.env.local') }); // Fallback to parent local

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit to accept Large Base64 Certificates
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurobright')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

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


// --- WhatsApp Precision Reminders ---
app.post('/api/reminders/whatsapp', async (req, res) => {
    try {
        const { topic, completedLevelsCount, totalLevelsCount, nextLevelConcepts } = req.body;

        if (!topic) return res.status(400).json({ error: 'Missing topic in request.' });

        const metaAccessToken = process.env.META_ACCESS_TOKEN;
        const phoneNumberId = process.env.META_PHONE_NUMBER_ID || '985139691354987';

        const conceptsText = (nextLevelConcepts && nextLevelConcepts.length > 0)
            ? nextLevelConcepts.map((c, i) => `${i + 1}. ${c}`).join('\n')
            : 'More advanced topics...';

        const messageBody = `Hello! Your Precision Reminder bot from NueroBright here 🤖. You were learning ${topic}. You have completed ${completedLevelsCount || 0}/${totalLevelsCount || 5} levels! To proceed to the next level, you need to learn:\n${conceptsText}`;

        // Primary and Fallback numbers (Meta API requires numbers without the '+' and without 'whatsapp:')
        // NOTE: The Meta WhatsApp Cloud API usually requires the country code (e.g., 91 for India).
        const primaryToNumber = '918807715828';
        const fallbackToNumber = '919944445829';

        const sendMetaMessage = async (to) => {
            return axios.post(`https://graph.facebook.com/v25.0/${phoneNumberId}/messages`, {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: { preview_url: false, body: messageBody }
            }, {
                headers: {
                    'Authorization': `Bearer ${metaAccessToken}`,
                    'Content-Type': 'application/json'
                }
            });
        };

        let messageId;
        try {
            console.log(`Attempting to send Meta WhatsApp message to primary number: ${primaryToNumber}`);
            const response = await sendMetaMessage(primaryToNumber);
            messageId = response.data.messages[0].id;
            console.log(`Success! Sent to primary number. Message ID: ${messageId}`);
        } catch (primaryError) {
            console.warn(`Failed to send to primary number (${primaryToNumber}) [Error: ${primaryError.response?.data?.error?.message || primaryError.message}]. Falling back to ${fallbackToNumber}...`);

            // Fallback
            const fallbackResponse = await sendMetaMessage(fallbackToNumber);
            messageId = fallbackResponse.data.messages[0].id;
            console.log(`Success! Sent to fallback number. Message ID: ${messageId}`);
        }

        res.json({ success: true, messageId });
    } catch (error) {
        console.error('Meta WhatsApp API Error:', error.response?.data || error);
        res.status(500).json({ error: 'Failed to send WhatsApp message.', details: error.response?.data?.error?.message || error.message });
    }
});

// --- WhatsApp Certificate Delivery ---
app.post('/api/reminders/whatsapp/certificate', async (req, res) => {
    try {
        const { topic, imageBase64 } = req.body;
        if (!topic || !imageBase64) return res.status(400).json({ error: 'Missing topic or imageBase64' });

        const metaAccessToken = process.env.META_ACCESS_TOKEN;
        const phoneNumberId = process.env.META_PHONE_NUMBER_ID || '985139691354987';

        // 1. Convert Base64 to Buffer and Upload to Meta Media API
        console.log("Uploading Certificate to Meta servers...");
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        const form = new FormData();
        form.append('file', buffer, { filename: 'certificate.png', contentType: 'image/png' });
        form.append('type', 'image/png');
        form.append('messaging_product', 'whatsapp');

        const uploadResponse = await axios.post(`https://graph.facebook.com/v25.0/${phoneNumberId}/media`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${metaAccessToken}`
            }
        });

        const mediaId = uploadResponse.data.id;
        console.log(`Successfully uploaded media. Media ID: ${mediaId}`);

        // 2. Dispatch Media Message
        const primaryToNumber = '918807715828';
        const fallbackToNumber = '919944445829';

        const sendMetaImageMessage = async (to) => {
            return axios.post(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "image",
                image: {
                    id: mediaId,
                    caption: `🏆 Congratulations! Here is your official NeuroBright Certificate for mastering ${topic}!`
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${metaAccessToken}`,
                    'Content-Type': 'application/json'
                }
            });
        };

        let messageId;
        try {
            console.log(`Sending certificate image to ${primaryToNumber}...`);
            const response = await sendMetaImageMessage(primaryToNumber);
            messageId = response.data.messages[0].id;
            console.log("Sent successfully to primary number.");
        } catch (primaryError) {
            console.warn(`Primary image send failed. Falling back. Error: ${primaryError.response?.data?.error?.message || primaryError.message}`);
            const fallbackResponse = await sendMetaImageMessage(fallbackToNumber);
            messageId = fallbackResponse.data.messages[0].id;
            console.log("Sent successfully to fallback number.");
        }

        res.json({ success: true, messageId, mediaId });
    } catch (error) {
        console.error('Meta Media API Error:', error.response?.data || error);
        res.status(500).json({ error: 'Failed to upload/send certificate.', details: error.response?.data?.error?.message || error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
