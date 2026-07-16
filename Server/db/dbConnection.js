const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.mongoURI);
        console.log('✅ Connected to MongoDB Atlas');
    } catch (err) {
        console.error('❌ Atlas connection failed, trying local MongoDB...');
        try {
            await mongoose.connect('mongodb://localhost:27017/handscape');
            console.log('✅ Connected to Local MongoDB');
        } catch (localErr) {
            console.error('❌ Both MongoDB Atlas and Local MongoDB failed:', localErr.message);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
