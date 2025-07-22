const express = require("express");
const router = express.Router();

const orderController = require("../controller/order.controller.js");
const authenticate = require("../middle-ware/authenticate.js");

router.post("/", authenticate, orderController.createOrder);
router.get("/user", authenticate, orderController.orderHistory);
router.get("/:id", authenticate, orderController.findOrderById);
router.post("/:orderId/pay", authenticate, orderController.payOrder);
router.patch("/:orderId/status", authenticate, orderController.changeOrderStatus);


module.exports = router;