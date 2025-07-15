const express = require("express");
const router = express.Router();

const productController = require("../controller/product.controller.js");
const authenticate = require("../middle-ware/authenticate.js");

router.get("/", productController.getAllProducts);
router.get("/id/:id", productController.findProductById);

module.exports = router;