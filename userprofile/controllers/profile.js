const Profile = require("../models/profile");

exports.createProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    const existingProfile = await Profile.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const profile = await Profile.create({ name, email, userId });

    return res.status(201).json({ message: "Profile created", profile });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
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
    const { name, phone, email } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateData },
      { new: true } 
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};
