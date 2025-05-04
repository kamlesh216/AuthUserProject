const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  googleOAuthHandler,
  facebookLogin,
} = require("../controllers/auth");

router.post("/signup", signup);
router.post("/login", login);
router.post("/google-auth", googleOAuthHandler);
router.post("/facebook-login", facebookLogin);

module.exports = router;
