// import mongoose from "mongoose";
//
// const mongoDbUrl = "mongodb+srv://maksymilian907:9VRqdrG48JDtYEeC@cluster0.91gkazc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
//
// const connectDb= ()=>{
//   return mongoose.connect(mongoDbUrl)
// }
//
// module.exports = {connectDb}

const mongoose = require("mongoose");

const mongoDbUrl = "mongodb+srv://maksymilian907:9VRqdrG48JDtYEeC@cluster0.91gkazc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

module.exports = connectDB;