const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = async () => {
  console.log('connecting to database');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('mongodb connection success!');
  } catch (err) {
    console.log('mongodb connection failed!', err.message);
  }
};

module.exports = connectDB;
