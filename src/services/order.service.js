const cartService = require('../services/cart.service.js');
const Address = require("../models/address.model");
const Order = require("../models/order.model");
const OrderItems = require("../models/order-items.model");

async function createOrder(user, { shippingAddress }) {
  let address;

  if (shippingAddress._id) {
    address = await Address.findById(shippingAddress._id);
  } else {
    address = new Address({
      ...shippingAddress,
      user: user._id,
    });
    await address.save();

    user.address.push(address._id);
    await user.save();
  }

  const cart = await cartService.findUserCart(user._id);
  const orderItems = [];

  for (const item of cart.cartItems) {
    const orderItem = new OrderItems({
      price: item.price,
      product: item.product,
      quantity: item.quantity,
      size: item.size,
      userId: item.userId,
      discountedPrice: item.discountedPrice,
    });

    const createdOrderItem = await orderItem.save();
    orderItems.push(createdOrderItem);
  }

  const createdOrder = new Order({
    user: user._id,
    orderItems,
    totalPrice: cart.totalPrice,
    totalDiscountedPrice: cart.totalDiscountedPrice,
    discount: cart.discount,
    totalItems: cart.totalItem,
    shippingAddress: address,
  });

  const savedOrder = await createdOrder.save();

  cart.cartItems = [];
  cart.discount = 0;
  cart.totalDiscountedPrice = 0;
  cart.totalItem = 0;
  cart.totalPrice = 0;
  await cart.save();

  return savedOrder;
}

async function payOrder(orderId){
  const order = await findOrderById(orderId);

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  order.paymentDetails = {paymentStatus: 'completed' , paymentMethod: 'paypal'};
  order.orderStatus = 'confirmed'
  order.deliveryDate = deliveryDate

  order.populate()

  await order.save();
  return order
}

async function changeOrderStatus(orderId, status){
  const order = await findOrderById(orderId);

  order.orderStatus = status;

  await order.save();
}

const mongoose = require('mongoose');

async function findOrderById(orderId){
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('Nieprawidłowy identyfikator zamówienia');
  }
  const order = await Order.findById(orderId)
      .populate({path: "orderItems", populate:{path:'product'}})
      .populate('shippingAddress');

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
}

async function userOrderHistory(userId){

  try{
    const orders = await Order.find({user: userId })
        .populate({path:"orderItems", populate:{path:"product"}})
        .lean();

    return orders;
  } catch(error){
    throw new Error(error.message);
  }
}


async function getAllOrders(){
  return await  Order.find()
      .populate({path:"orderItems", populate:{path:"product"}}).lean()
}

async function deleteOrder(orderId){
  const order= await findOrderById(orderId);
  await Order.findByIdAndDelete(order._id)
}

module.exports = {
  createOrder,
  userOrderHistory,
  getAllOrders,
  deleteOrder,
  findOrderById,
  changeOrderStatus,
  payOrder
}