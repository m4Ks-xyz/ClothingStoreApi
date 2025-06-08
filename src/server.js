// const app = require(".");
// const connectDb = require("./config/db.js");
//
// const PORT = 5454;
// app.listen(PORT, async () => {
//   await connectDb;
//
//   console.log("API listening to port :", PORT);
// });

const app = require("./index.js");
const mongoose = require("mongoose");

const mongoDbUrl = "mongodb+srv://maksymilian907:9VRqdrG48JDtYEeC@cluster0.91gkazc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoDbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
})
    .then(() => {
      console.log("Połączono z bazą MongoDB");
      app.listen(5454, () => {
        console.log("Serwer nasłuchuje na porcie 5454");
      });
    })
    .catch((err) => {
      console.error("Błąd połączenia z MongoDB:", err);
      process.exit(1);
    });