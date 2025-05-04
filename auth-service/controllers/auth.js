const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require("../models/user");
require('dotenv').config();

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existUser = await User.findOne({ email });
    if (existUser)
      return res.status(400).json({ success: false, message: 'User already exists' });

    const hashpassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashpassword });

    // generate token to send to profile service
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Send data to profile service
    try {
      await axios.post(process.env.PROFILE_SERVICE_URL, {
        userId: newUser._id,
        name,
        email,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
    } catch (profileError) {
      console.error("Failed to create profile:", profileError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'User created successfully',
      user: {
        name: newUser.name,
        email: newUser.email,
      },
      token
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'User could not be registered' });
  }
};
//login
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
exports.googleOAuthHandler = async (req, res) => {
  const { code } = req.body;

  try {
    // 1. Exchange code for access and id tokens
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const { access_token } = tokenRes.data;

    // 2. Get user info from Google
    const userInfoRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { name, email } = userInfoRes.data;
    if (!email) return res.status(400).json({ success: false, message: "Email not found" });

    // 3. Check if user exists in auth db
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      user = await User.create({ name, email, password: "" });
      isNewUser = true;
    }

    // 4. Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // 5. Sync with profile service if new
    if (isNewUser) {
      try {
        await axios.post(
          process.env.PROFILE_SERVICE_URL,
          {
            userId: user._id,
            name,
            email,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (err) {
        console.error("Profile sync failed:", err.response?.data || err.message);
      }
    }

    // 6. Send success response
    return res.status(200).json({
      success: true,
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Google OAuth failed:", err.response?.data || err.message);
    return res.status(400).json({ success: false, message: "Google OAuth failed" });
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
