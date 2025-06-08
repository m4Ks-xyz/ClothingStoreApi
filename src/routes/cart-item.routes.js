const express = require("express");
const router = express.Router();

const cartItemController = require("../controller/cart-item.controller.js");
const authenticate = require("../middle-ware/authenticate.js");

router.put("/:id", authenticate, cartItemController.updateCartItem);
router.delete("/:id", authenticate, cartItemController.removeCartItem);

module.exports = router;