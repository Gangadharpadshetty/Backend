require('dotenv').config();
const mongoose = require('mongoose');


// Retrieve the MongoDB connection URI from the environment variable
const URI = "mongodb+srv://gangadhar:Gjp%402002@cluster0.cilh6mh.mongodb.net/gang?retryWrites=true&w=majority&appName=Cluster0";

const connectdb = async () => {
    try {
        // Check if the URI is defined
        if (!URI) {
            throw new Error("MongoDb_URI environment variable is not set.");
        }

        await mongoose.connect(URI);

        console.log("Connection established");
    } catch (error) {
        console.error("Connection error:", error.message);
        process.exit(1);
    }
};

module.exports = connectdb;
