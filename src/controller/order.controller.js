const orderService = require("../services/order.service.js");
const Order = require ('../models/order.model')

const createOrder = async(req, res) => {
  const user = await req.user;
  try {
    let createdOrder = await orderService.createOrder(user, req.body);
    return res.status(201).send(createdOrder);
  } catch (error) {
    return res.status(500).send({error: error.message});
  }
};

const findOrderById = async(req, res) => {
  const user = await req.user;
  try {
    let createdOrder = await orderService.findOrderById(req.params.id);
    return res.status(201).send(createdOrder);
  } catch (error) {
    return res.status(500).send({error: error.message});
  }
};

const orderHistory = async(req, res) => {
  const user = await req.user;
  try {
    let createdOrder = await orderService.userOrderHistory(user._id);
    return res.status(201).send(createdOrder);
  } catch (error) {
    return res.status(500).send({error: error.message});
  }
};

const payOrder = async (req, res) => {
  const { orderId } = req.params
  console.log(orderId);
  try {
   let payedOrder = await orderService.payOrder(orderId);
    return res.status(201).send(payedOrder);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const changeOrderStatus  = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  try {
    await orderService.changeOrderStatus(orderId, status);
    return res.status(200).send({ message: `Order ${orderId} status changed to ${status}.` });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = {
  findOrderById,
  orderHistory,
  createOrder,
  payOrder,
  changeOrderStatus
};