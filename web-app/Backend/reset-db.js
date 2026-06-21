import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/neurobright')
    .then(async () => {
        try {
            console.log('Connected');
            await mongoose.connection.db.dropCollection('users');
            console.log('Successfully dropped legacy users collection.');
        } catch (err) {
            if (err.message.includes('ns not found')) {
                console.log('Collection already dropped or does not exist.');
            } else {
                console.error('Error dropping collection:', err);
            }
        }
        mongoose.disconnect();
    });
