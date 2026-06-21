import mongoose from 'mongoose';
import User from './models/User.js';
import fs from 'fs';

mongoose.connect('mongodb://localhost:27017/neurobright')
    .then(async () => {
        try {
            console.log('Connected');
            // wipe all users for clean test
            await User.deleteMany({});
            await User.create({ name: 'Test', email: 'test@example.com', password: 'password' });
            console.log('Success creating user');
        } catch (err) {
            fs.writeFileSync('node-err.txt', err.stack || err.toString());
            console.error('ERROR WRITTEN');
        }
        mongoose.disconnect();
    });
