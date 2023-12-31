const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
});
const Users=mongoose.model("User", userSchema);
// Users.ensureIndexes()
module.exports = Users
