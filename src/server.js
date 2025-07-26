require('dotenv').config()

const app = require("./index.js");
const mongoose = require("mongoose");


const mongoDbUrl = process.env.MONGO_URI_DEV

// const mongoDbUrl = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=${process.env.MONGO_DATABASE}`;


mongoose.connect(mongoDbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
})
    .then(() => {
      console.log("Polaczono z baza MongoDB");
      app.listen(process.env.MONGO_PORT, () => {
        console.log(`Serwer nasluchuje na porcie ${process.env.MONGO_PORT}}`);
        console.log(`Polaczono z baza "mongodb://${process.env.MONGO_USER}:password@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE}?authSource=${process.env.MONGO_DATABASE}"`)
      });
    })
    .catch((err) => {
      console.error("Blad polaczenia z MongoDB:", err);
      process.exit(1);
    });