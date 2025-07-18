const Rating = require("../models/rating.model");
const productService = require("../services/product.service.js");
const userService = require("./user.service");


async function createRating(req, user) {

  const foundUser = await userService.findUserById(user._id);
  const result = await productService.findProductById(req.productId);
  const product = result.details



  if (!product) throw new Error("Product not found");

  const existingRating = await Rating.findOne({
    user: user._id,
    product: product._id,
  });

  if (existingRating) {
    throw new Error("You have already rated this product");
  }

  if (!Array.isArray(product.ratings)) {
    product.ratings = [];
  }
  if (!Array.isArray(foundUser.ratings)) {
    foundUser.ratings = [];
  }

  const rating = new Rating({
    user,
    product: req.productId,
    rating: req.rating,
    createdAt: new Date()
  });
  const savedRating = await rating.save();

  product.ratings.push(savedRating._id)

  foundUser.ratings.push(savedRating._id)

  await Promise.all([product.save(), foundUser.save()])

  return getProductRating(req.productId)
}

async function getProductRating(productId) {
  return await Rating.find({product: productId}) ;
}

module.exports = {
  createRating,
  getProductRating
}