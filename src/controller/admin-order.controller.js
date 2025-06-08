const orderService = require("../services/order.service.js");

const getAllOrders = async(req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    return res.status(200).send(orders);
  } catch (error) {
    return res.status(500).send({error: error.message});
  }
};

const confirmedOrders = async(req, res) => {

  const orderId = req.params.orderId

  try {
    const orders = await orderService.confirmOrder(orderId);
    return res.status(200).send(orders);
  } catch (error) {
    return res.status(500).send({error: error.message});
  }
};

const prepareOrders = async(req, res) => {

  const orderId = req.params.orderId

  try {
    const orders = await orderService.prepareOrder(orderId);
    return res.status(200).send(orders);
  } catch (error) {
    return res.status(500).send({error: error.message});
  }
};

const sendOrders = async(req, res) => {

  const orderId = req.params.orderId

  try {
    const orders = await orderService.sendOrder(orderId);
    return res.status(200).send(orders);
  } catch (error) {
    return res.status(500).send({error: error.message});
  }
};

const deliverOrders = async(req, res) => {

  const orderId = req.params.orderId

  try {
    const orders = await orderService.deliverOrder(orderId);
    return res.status(200).send(orders);
  } catch (error) {
    return res.status(500).send({error: error.message});
  }
};

const cancelOrders = async(req, res) => {

  const orderId = req.params.orderId

  try {
    const orders = await orderService.cancelOrder(orderId);
    return res.status(200).send(orders);
  } catch (error) {
    return res.status(500).send({error: error.message});
  }
};

const deletedOrders = async(req, res) => {

  const orderId = req.params.orderId

  try {
    const orders = await orderService.deleteOrder(orderId);
    return res.status(200).send(orders);
  } catch (error) {
    return res.status(500).send({error: error.message});
  }
};

module.exports = {
  getAllOrders,
  confirmedOrders,
  deliverOrders,
  cancelOrders,
  prepareOrders,
  sendOrders,
  deletedOrders
};