const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to database");
  } catch (error) {
    console.error(error);
  }
}

module.exports = connectToDb;
