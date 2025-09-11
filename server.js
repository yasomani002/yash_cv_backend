const express = require('express');
const connectDB = require('./db/db.js');
const app = express();
const router = express.Router()
const userRoute = require('./routes/userRoute..js');
const cookieParser = require("cookie-parser");
const cors = require('cors');


app.use(cookieParser());
app.use(express.json()); // Middleware to parse JSON request body
require('dotenv').config();

app.use(cors({
    origin: ['http://localhost:3000', 'https://yash-cv-frontend.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(router);
app.listen(process.env.LOCAL_PORT, () => {
    console.log(`server is running on port ${process.env.LOCAL_PORT}`);
});
connectDB();

app.use('/user', userRoute)
