const mongoose = require("mongoose");
require("dotenv").config({ path: [".env", ".env.example"] });
const databaseURI = `${process.env.DB_URI_SCHEME}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE}`;

const databaseConnection = async () => {
  try {
    await mongoose.connect(databaseURI);
    console.log("Connected to MongoDB database");
  } catch (error) {
    console.log("Error connecting to MongoDB database ", error.message);
  }
};

module.exports = databaseConnection;
