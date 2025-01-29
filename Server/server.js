const express = require('express');
const app = express();
const mongoose = require('mongoose');
const UserModel = require('./model/user.model');
require('dotenv').config();

app.use(express.json());

mongoose.connect(process.env.mongoURI)
    .then(() => {
        console.log("Successfully connected to MongoDB");
    })
    .catch((error) => {
        console.log(error);
    });



app.get('/ping', (req, res) => {
    res.send('pong');
});

app.post('/create', async(req,res)=>{
    const{username,password} = req.body;
    payload={username,password};
    
    try {
        let new_user = new UserModel(payload);
        await new_user.save();
        res.send({ "message": "Hurray! Successfully saved the user to the database" });
    } catch (error) {
        console.log(error);
        res.send({ "error": error });
    }
});


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
