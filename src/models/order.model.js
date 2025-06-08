const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  orderItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "orderItems",
  }],
  orderDate: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  deliveryDate: {
    type: Date,
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "addresses",
  },
  paymentDetails: {
    paymentMethod: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    paymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      default: "pending",
    },
  },
  totalPrice: {
    type: Number,
    default: 0,
    required: true,
  },
  totalDiscountedPrice: {
    type: Number,
    default: 0,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
    required: true,
  },
  orderStatus: {
    type: String,
    default: "placed",
    required: true,
  },
  totalItems: {
    type: Number,
    default: 0,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Order = mongoose.model("orders", OrderSchema);

module.exports = Order;
