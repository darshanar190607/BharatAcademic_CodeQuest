import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_for_neurobright_2026');
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ error: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        console.error('Auth verification error:', error);
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};
