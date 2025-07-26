const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const OrderItemsSchema = new Schema({
  product: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    discountedPrice: { type: Number },
    discount: { type: Number },
    brand: { type: String },
    color: { type: String },
    imageUrl: { type: String },
    sizes: [
      {
        name: { type: String },
        quantity: { type: Number }
      }
    ],
  },
  size: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 0,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
    required: true,
  },
  discountedPrice: {
    type: Number,
    default: 0,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  deliveryDate: {
    type: Date,
  },
});

const OrderItems = mongoose.model("orderItems", OrderItemsSchema);

module.exports = OrderItems;
