const { User } = require("../models/index.js");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/tokenHelper.js");
const validator = require("validator");



// Register User
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, msg: "Invalid email format" });
    }
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, msg: "Missing required fields" });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ success: false, msg: "This email is already registered" });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        await User.create({ username, email, password: hashPassword });

        return res.status(201).json({ success: true, msg: "User registered successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, msg: "Server error during registration", error: err.message });
    }
};

// Login User
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, msg: "Missing required fields" });
    }

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ success: false, msg: "User doesn't exist" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ success: false, msg: "Incorrect password" });
        }
        const token = generateToken(user);

        return res.json({ success: true, msg: "Login successful", token });
    } catch (err) {
        return res.status(500).json({ success: false, msg: "Server error during login", error: err.message });
    }
};

// Logout User
exports.logout = async (req, res) => {
    return res.status(200).json({ success: true, msg: "Logout successful. Token discarded on the client side." });
};
