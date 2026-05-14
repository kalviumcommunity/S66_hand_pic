const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.log("❌ Atlas connection failed, trying local MongoDB...");
    try {
      await mongoose.connect('mongodb://localhost:27017/handscape');
      console.log("✅ Connected to Local MongoDB");
    } catch (localErr) {
      console.error("❌ Both MongoDB Atlas and Local MongoDB failed");
      console.error(localErr.message);
    }
  }
};

module.exports = connectDB;
