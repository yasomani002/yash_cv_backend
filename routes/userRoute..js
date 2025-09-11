const mongoose = require('mongoose')
const express = require('express');
const User = require('../models/userModel');
const { sendEmail } = require('../helpers/sendEmail');
const { verifyToken, generateToken } = require('../jwt');
const CvData = require('../models/cvDataModel');
const router = express.Router()

router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ msg: 'email is required.' });
        }
        if (!password) {
            return res.status(400).json({ msg: 'password is required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists with this email.' });
        }
        const newUser = new User({ email, password });
        await newUser.save(); //  most important line

        res.status(200).json({ msg: 'User registered successfully', data: newUser });

    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
})

router.post('/verify-email', async (req, res) => {
    try {
        // generate otp
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" })
        }
        const userData = await User.findOne({ _id: userId });


        if (!userData) {
            return res.status(400).json({ message: "User not found" })
        }

        // set userOtp
        userData.otp = otp;
        await userData.save();

        // send otp to email
        const isSendEmail = await sendEmail(otp, userData.email)
        if (!isSendEmail.success) {
            return res.status(500).json({ message: "Failed to send email" })
        }
        return res.status(200).json({ message: "OTP sent to your email" })
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }

})

router.post('/verify-otp', async (req, res) => {
    try {
        const { userId, otp } = req.body;
        if (!userId || !otp) {
            return res.status(400).json({ message: "userId and otp is required" })
        }
        const userData = await User.findOne({ _id: userId });
        if (!userData) {
            return res.status(400).json({ message: "User not found" })
        }
        if (userData.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" })
        }
        userData.isVerified = true;
        userData.otp = "";
        await userData.save();
        return res.status(200).json({ message: "Email verified successfully" })
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ msg: 'email is required.' });
        }
        if (!password) {
            return res.status(400).json({ msg: 'password is required.' });
        }

        const userData = await User.findOne({ email: email });
        if (!userData) {
            return res.status(400).json({ msg: 'User not found with this email.' });
        }
        if (!userData.isVerified) {
            return res.status(400).json({ msg: 'Please verify your email to login.' });
        }

        const isMatch = await userData.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid password.' });
        }

        const payload = {
            userId: userData._id,
            email: userData.email
        }
        // generate token
        const token = generateToken(payload);

        // set cookie
        res.cookie("token", token, {
            httpOnly: true,   // prevents JS access
            // secure: process.env.NODE_ENV === "production", // only https in prod
            sameSite: "strict", // CSRF protection
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        userData.isLoggedIn = true;
        await userData.save();
        res.status(200).json({ msg: 'Login successful', data: userData, token: token });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
})

router.get('/profile', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ msg: 'Token is not valid' });
        }
        const userData = await User.findById(decoded.userId).select('-password');
        if (!userData) {
            return res.status(400).json({ msg: 'User not found' });
        }
        res.status(200).json({ msg: 'User profile fetched successfully', data: userData });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
})

router.post('/cv-data', async (req, res) => {
    try {

        const data = req.body;
        if (!data) {
            return res.status(400).json({ msg: 'No data provided' });
        }

        // Pass full data directly (not wrapped inside { data })
        const cvData = new CvData(data);


        await cvData.save();
        res.status(200).json({
            msg: 'Data saved successfully',
            data: cvData
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
})

router.get('/cv-data/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const cvData = await CvData.findOne({ userId: id });
        if (!cvData) {
            return res.status(404).json({ msg: 'No CV data found for this user' });
        }
        res.status(200).json({ msg: 'CV data fetched successfully', data: cvData });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
})

router.post('/logout', async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(400).json({ msg: 'No token found' });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(400).json({ msg: 'Invalid token' });
        }

        // Update isLoggedIn status
        const userId = decoded.userId;
        const userData = await User.findById(userId);

        if (userData) {
            userData.isLoggedIn = false;
        }

        await userData.save();
        res.clearCookie("token", {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({ msg: 'Logout successful' });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
})

module.exports = router
