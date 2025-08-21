require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./routes/user')
const postRouter = require('./routes/post')

app.use(express.json());

app.use(cors({ 
    origin: "http://localhost:5173", // Allow only your frontend
    methods: "GET, POST, PUT, DELETE, OPTIONS", // Allow these HTTP methods
    allowedHeaders: "Content-Type, Authorization", // Allow these headers
    credentials: true // Explicitly allow credentials
}));

app.options("*", (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true"); // Add this
    res.sendStatus(200);
});

app.use('/uploads', express.static('uploads'));


let dbConnectionStatus = 'Disconnected'; 

mongoose.connect(process.env.mongoURI)
    .then(() => {
        dbConnectionStatus = 'Connected';
        console.log("Successfully connected to MongoDB");
    })
    .catch((error) => {
        console.log(error);
        dbConnectionStatus = `Error: ${error.message}`;
    });

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
