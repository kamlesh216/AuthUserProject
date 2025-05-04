const express = require("express");
const router = express.Router();
const { getProfile, updateProfile,createProfile} = require("../controllers/profile");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/profile", authMiddleware, createProfile);

module.exports = router;
