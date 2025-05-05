const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  googleOAuthHandler,
  facebookOAuthHandler,
} = require("../controllers/auth");

router.post("/signup", signup);
router.post("/login", login);
router.post("/google-auth", googleOAuthHandler);
router.post("/facebook-auth", facebookOAuthHandler);

module.exports = router;
