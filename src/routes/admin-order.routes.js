const express = require("express");
const router = express.Router();

const orderController = require("../controller/admin-order.controller");
const authenticate = require("../middle-ware/authenticate.js");

router.get("/", authenticate, orderController.getAllOrders);
router.put('/:orderId/confirmed', authenticate, orderController.confirmedOrders);
router.put('/:orderId/prepare', authenticate, orderController.prepareOrders);
router.put('/:orderId/send', authenticate, orderController.sendOrders);
router.put('/:orderId/deliver', authenticate, orderController.deliverOrders);
router.put('/:orderId/cancel', authenticate, orderController.cancelOrders);
router.put('/:orderId/delete', authenticate, orderController.deletedOrders);

module.exports = router;