const express = require('express');
const mongoose = require('mongoose');
const bodyParser =  require('body-parser')
const cors = require('cors');
const dotenv = require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 8000; 

app.use(cors());
app.use(bodyParser.json());

const URL = process.env.MONGODB_URL;

mongoose.connect(URL);

//Create a connection to database
const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB Connection Success!")
})

//Router
const userRouter = require('./Routes/users.js');

app.use("/user", userRouter);

//Create a server on Port
app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`)
})

