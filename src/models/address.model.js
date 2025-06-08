const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  street: {
    type: String,
  },
  city: {
    type: String,
  },
  zipCode: {
    type: String,
  },
  number: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
  },
});

const Address = mongoose.model("addresses", AddressSchema);

module.exports = Address;
