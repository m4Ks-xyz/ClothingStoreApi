const Cart = require("../models/cart.model");
const CartItem = require("../models/cart-item.model");
const Product = require("../models/product.model");

async function createCart(user) {
  try {
    const cart = new Cart({ user });
    const createdCart = await cart.save();
    return createdCart;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function findUserCart(userId) {
  try {
    const cart = await Cart.findOne({ user: userId })
        .populate({
          path: 'cartItems',
          populate: {
            path: 'product'  // usunięto model i select
          }
        });

    if (!cart) {
      throw new Error("Koszyk nie znaleziony");
    }

    return cart;

  } catch (error) {
    throw new Error(error.message);
  }
}

async function addCartItem(userId, req) {
  try {
    let cart = await Cart.findOne({ user: userId });
    const product = await Product.findById(req.productId);

    if (!cart || !product) {
      throw new Error("Koszyk lub produkt nie istnieje");
    }

    const isPresent = await CartItem.findOne({
      cart: cart._id,
      product: product._id,
      size: product.size,
      userId
    });

    if (!isPresent) {
      const cartItem = new CartItem({
        product: product._id,
        cart: cart._id,
        quantity: req.quantity,
        userId,
        price: product.price,
        size: req.size,
        discountedPrice: product.discountedPrice,

      });

      const createdCartItem = await cartItem.save();

      cart = await Cart.findOneAndUpdate(
          { _id: cart._id },
          {
            $push: { cartItems: createdCartItem._id },
            $inc: {
              totalPrice: product.price  * req.quantity,
              totalItem: 1,
              totalDiscountedPrice: product.discountedPrice === 0 ? product.price * req.quantity :  product.discountedPrice * req.quantity,
              discount: product.discountedPrice === 0 ? 0 : product.price - product.discountedPrice
            }
          },
          { new: true }
      )
          .populate({
            path: 'cartItems',
            populate: {
              path: 'product'
            }
          });

      return cart;
    }

    return "Item is already in cart";

  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = { createCart, findUserCart, addCartItem };
