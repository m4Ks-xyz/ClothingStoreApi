const Review = require('../models/review.model.js');
const Rating = require('../models/rating.model.js');
const productService = require('../services/product.service.js');
const userService = require("../services/user.service")


async function createReview(req, user) {
  const foundUser = await userService.findUserById(user._id);
  const result = await productService.findProductById(req.productId);
  const product = result.details;

  if (!product) throw new Error("Product not found");

  let newReview = null;
  let newRating = null;

  // Check for existing rating
  if (req.rating !== undefined) {
    const existingRating = await Rating.findOne({
      user: user._id,
      product: product._id,
    });
    if (existingRating) {
      throw new Error("You have already rated this product");
    }
  }

  // Check for existing review
  if (req.review) {
    const existingReview = await Review.findOne({
      user: user._id,
      product: product._id,
    });
    if (existingReview) {
      throw new Error("You have already reviewed this product");
    }
  }

  // Create rating if provided
  if (req.rating !== undefined) {
    const rating = new Rating({
      user,
      product: req.productId,
      rating: req.rating,
      createdAt: new Date(),
    });
    newRating = await rating.save();
    product.ratings.push(newRating._id);
    product.numRatings[req.rating.toString()] =
        (product.numRatings[req.rating.toString()] || 0) + 1;
    foundUser.ratings.push(newRating._id);
  }

  // Create review if provided
  if (req.review) {
    const review = new Review({
      user,
      product: product._id,
      review: req.review,
      createdAt: new Date(),
    });
    newReview = await review.save();
    // Populate user fields on the review
    newReview = await Review.findById(newReview._id)
        .populate('user', 'firstName lastName imageURL');
    product.reviews.push(newReview._id);
    foundUser.reviews.push(newReview._id);
  }

  await Promise.all([product.save(), foundUser.save()]);

  return {
    review: newReview,
    rating: newRating,
  };
}

async function getAllReview(productId) {

    const rating = await Rating.find({product: productId}) ;
  const review=  await Review.find({ product: productId }).populate('user', 'firstName lastName avatarImg ') ;

  return{
    rating,
    review
  }
}

module.exports = {
  createReview,
  getAllReview
}