const express = require('express');
const connectDB = require('./db/db.js');
const app = express();
const router = express.Router()
const User = require('./models/userModel.js');
const userRoute = require('./routes/userRoute..js');
const cookieParser = require("cookie-parser");


app.use(cookieParser());
app.use(express.json()); // Middleware to parse JSON request body
require('dotenv').config();

app.use(router);
app.listen(process.env.LOCAL_PORT, () => {
    console.log(`server is running on port ${process.env.LOCAL_PORT}`);
});
connectDB();

app.use('/user', userRoute)
