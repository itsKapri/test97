const express = require('express');
const connectDB = require("./config/dbConnection");
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors')
app.use(cors())
require('dotenv').config();
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/auth", require("./routes/auth.js"));
app.use("/notes", require("./routes/notes.js"));

app.get('/start', (req, res) => {
    res.send("note api is working");
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
});
