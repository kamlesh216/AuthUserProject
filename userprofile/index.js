const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.USER_PROFILE_PORT || 5000;

app.use(express.json());

require("./config/database").connect();

const profileRoutes = require("./routes/profile");
app.use("/api/v1", profileRoutes);

app.listen(PORT, () => {
  console.log(` User Profile Service running on port ${PORT}`);
});
