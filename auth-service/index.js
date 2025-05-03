const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 4000;

app.use(express.json());

require("./config/database").connect();

const userRoutes = require('./routes/user');
app.use('/api/v1', userRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});
