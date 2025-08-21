require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user')
const postRouter = require('./routes/post')

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow both frontend ports
    methods: "GET, POST, PUT, DELETE, OPTIONS", // Allow these HTTP methods
    allowedHeaders: "Content-Type, Authorization", // Allow these headers
    credentials: true // Explicitly allow credentials
}));

app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true"); // Add this
    res.sendStatus(200);
});

app.use('/uploads', express.static('uploads'));


let dbConnectionStatus = 'Disconnected';

// Try MongoDB Atlas first, fallback to local MongoDB
const connectDB = async () => {
    try {
        // Try MongoDB Atlas first
        await mongoose.connect(process.env.mongoURI);
        dbConnectionStatus = 'Connected to MongoDB Atlas';
        console.log("✅ Successfully connected to MongoDB Atlas");
    } catch (atlasError) {
        console.log("❌ MongoDB Atlas connection failed, trying local MongoDB...");
        try {
            // Fallback to local MongoDB
            await mongoose.connect('mongodb://localhost:27017/handscape');
            dbConnectionStatus = 'Connected to Local MongoDB';
            console.log("✅ Successfully connected to Local MongoDB");
        } catch (localError) {
            dbConnectionStatus = `Error: Both connections failed`;
            console.log("❌ Both MongoDB Atlas and Local MongoDB failed:");
            console.log("Atlas Error:", atlasError.message);
            console.log("Local Error:", localError.message);
            console.log("\n🔧 Solutions:");
            console.log("1. Check your internet connection");
            console.log("2. Install MongoDB locally: brew install mongodb-community");
            console.log("3. Start MongoDB: brew services start mongodb-community");
            console.log("4. Or check your MongoDB Atlas cluster status");
        }
    }
};

connectDB();

app.get('/',(req,res)=>{
    res.json({
        message: 'Welcome to the ASAP Project',
        dbStatus: dbConnectionStatus,
    });
})


app.use('/',postRouter);
app.use('/',userRouter);

app.get('/ping', (req, res) => {
    res.send('pong');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});
