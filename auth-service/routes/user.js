const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  googleLogin,
  facebookLogin,
} = require("../controllers/auth");

router.post("/signup", signup);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/facebook-login", facebookLogin);

module.exports = router;
