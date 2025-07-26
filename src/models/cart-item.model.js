const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cart",
    required: true,
  },
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
    category: { type: mongoose.Schema.Types.ObjectId, ref: "categories" },
    topLevelCategory: { type: String },
    secondLevelCategory: { type: String },
    thirdLevelCategory: { type: String },
  },
  size: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountedPrice: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const CartItem = mongoose.model("cartItems", CartItemSchema);

module.exports = CartItem;
