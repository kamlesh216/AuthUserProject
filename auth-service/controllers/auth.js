const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require("../models/user");
require('dotenv').config();

// SIGNUP
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existUser = await User.findOne({ email });
        if (existUser) return res.status(400).json({ success: false, message: 'User already exists' });

        const hashpassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashpassword });

        return res.status(200).json({
            success: true,
            message: 'User created successfully',
            user: newUser
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'User could not be registered' });
    }
};

// LOGIN
exports.login = async (req, res) => {
    
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ success: true, token, user: { name: user.name, email: user.email } });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Login failed' });
    }
};

// GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
    const { token } = req.body;
  
    try {
      // 1. Verify token with Google
      const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
      const { email } = response.data;
  
      // 2. Use fallback name if not available (because /userinfo needs access_token)
      const name = "Google User";
  
      // 3. Create user if not exists
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name,
          email,
          password: "" // dummy password
        });
      }
  
      // 4. Generate JWT
      const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.status(200).json({
        success: true,
        token: jwtToken,
        user: {
          name: user.name,
          email: user.email
        }
      });
    } catch (err) {
      console.error("Google validation failed:", err.response?.data || err.message);
      res.status(400).json({ success: false, message: "Invalid Google token or missing data" });
    }
  };

// FACEBOOK LOGIN
exports.facebookLogin = async (req, res) => {
    const { accessToken, userID } = req.body;
    try {
        const fbURL = `https://graph.facebook.com/${userID}?fields=id,name,email&access_token=${accessToken}`;
        const response = await axios.get(fbURL);
        const { email, name } = response.data;

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ name, email, password: "" });
        }

        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token: jwtToken, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Invalid Facebook token' });
    }
};
