const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await UserModel.findOne();
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await UserModel.create({ name, email, password });
        res.status(201).json({ message: 'User registered successfully', userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.PROD === 'true' ? true : false,
            sameSite: process.env.PROD === 'true' ? "none" : 'Lax',
            maxAge: 3600000,
            path: "/", // 👈 add if used when setting cookie
        });
        res.status(200).json({ message: 'Login successful', userId: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.logoutUser = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.PROD === 'true',
        sameSite: process.env.PROD === 'true' ? 'none' : 'Lax',
        path: '/',
    });
    res.status(200).json({ message: 'Logout successful' });
};

exports.checkAuth = async (req, res) => {
    try {
        const userId = req.user
        const user = await UserModel.findById(userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.PROD === 'true' ? true : false,
            sameSite: process.env.PROD === 'true' ? "none" : 'Lax',
            maxAge: 3600000,
            path: "/", // 👈 add if used when setting cookie
        });

        res.status(200).json({ message: 'User authenticated', user });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}