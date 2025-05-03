const Profile = require("../models/profile");

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.status(200).json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { name, phone } },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
};
