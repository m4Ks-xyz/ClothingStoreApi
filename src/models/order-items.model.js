const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const OrderItemsSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
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
