const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  mongoose
    .connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("✅ UserProfile DB connected"))
    .catch((err) => {
      console.error("❌ DB connection error:", err);
      process.exit(1);
    });
};
