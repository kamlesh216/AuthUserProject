const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: String,
  email: String,
  phone: String,
});

module.exports = mongoose.model("profile", profileSchema);
