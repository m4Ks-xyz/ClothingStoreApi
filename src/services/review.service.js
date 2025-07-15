const Review = require('../models/review.model.js');
const productService = require('../services/product.service.js');
const userService = require("../services/user.service")


async function createReview(data, user) {
  const foundUser = await userService.findUserById(user._id);
  const result = await productService.findProductById(data.data.productId);
  const product = result.details;

  if (!product) throw new Error("Product not found");

  // ✅ Check if user has already reviewed this product
  const existingReview = await Review.findOne({
    user: user._id,
    product: product._id,
  });

  if (existingReview) {
    throw new Error("You have already reviewed this product");
  }

  if (!Array.isArray(product.reviews)) product.reviews = [];

  const review = new Review({
    user,
    product: product._id,
    review: data.data.review,
    createdAt: new Date(),
  });

  const savedReview = await review.save();

  product.reviews.push(savedReview._id);
  product.numRatings = product.reviews.length;

  foundUser.reviews.push(savedReview._id);

  await Promise.all([product.save(), foundUser.save()]);

  return getAllReview(product._id);
}

async function getAllReview(productId) {

  const product = await productService.findProductById( productId);
  return await Review.find({ product: productId }).populate('user', 'firstName lastName imageURL -_id') ;
}

module.exports = {
  createReview,
  getAllReview
}