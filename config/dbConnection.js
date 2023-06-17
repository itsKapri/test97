const mongoose = require('mongoose');
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.dburl);
        console.log("---mongodb-connect------");
    } catch (error) {
        console.log(error);
        throw error;
    }
};

module.exports = connectDB;
