const mongoose = require("mongoose");
const env = require('dotenv')
env.config()

const db = process.env.db
 

async function connectToDb() {
  try {
    await mongoose.connect(db);
    console.log("MongoDB Connected to database");
  } catch (error) {
    console.log(error);
  }
}
module.exports = connectToDb;
