const Users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            // Check if user already exists
            const user = await Users.findOne({ email });
            if (user) return res.status(400).json({ msg: "Email already registered" });

            // Password length validation
            if (password.length < 6) {
                return res.status(400).json({ msg: "Password must be at least 6 characters long" });
            }

            // Password encryption
            const passwordHash = await bcrypt.hash(password, 10);

            // Create new user
            const newUser = new Users({
                name,
                email,
                password: passwordHash
            });

            await newUser.save();

            // Create JWT tokens
            const accessToken = createAccessToken({ id: newUser._id });
            const refreshToken = createRefreshToken({ id: newUser._id });

            // Set refresh token as an HTTP-only cookie
            res.cookie('refreshtoken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token',
                secure: true, // Set to true in production for HTTPS
                sameSite: 'Strict', // Helps prevent CSRF attacks
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Return access token
            return res.json({ accessToken });

        } catch (error) {
            return res.status(500).json({ msg: error.message });
        }
    },

    refreshtoken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken; // Get refresh token from cookies

            // If no refresh token, ask user to login or register
            if (!rf_token) return res.status(400).json({ msg: "Please login or register" });

            // Verify the refresh token
            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) return res.status(400).json({ msg: "Please login or register" });

                // Create a new access token
                const accessToken = createAccessToken({ id: user.id });

                // Optionally, create a new refresh token if needed (not strictly necessary)
                const newRefreshToken = createRefreshToken({ id: user.id });
                
                // Set the new refresh token in the cookie (optional)
                res.cookie('refreshtoken', newRefreshToken, {
                    httpOnly: true,
                    path: '/user/refresh_token',
                   
                });

                // Return the new access token
                res.json({ accessToken });
            });

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

// Token creation functions
const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' }); // 1 day validity
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // 7 days validity
};

module.exports = userController;
