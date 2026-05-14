require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Routers
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://handscape-o.netlify.app",
  "https://s66-hand-pic.onrender.com"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Static uploads (only for local dev - in production use cloud storage)
app.use('/uploads', express.static('uploads'));

// Import DB connection
const connectDB = require('./db/dbConnection');
connectDB();

// Routes
app.use('/', userRouter);
app.use('/', postRouter);

// Health check
app.get('/ping', (req, res) => res.send('pong'));

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Handscape API',
    environment: process.env.NODE_ENV || 'development',
    cors: { allowedOrigins }
  });
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
