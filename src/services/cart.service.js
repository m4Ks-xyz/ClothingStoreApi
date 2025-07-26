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
      'product._id': product._id,
      size: req.size,
      userId
    });

    if (!isPresent) {
      // Convert the product to a plain object
      const productData = product.toObject();

      // Calculate prices
      const basePrice = productData.price;
      const discountPrice = productData.discountedPrice ?? productData.price;
      const totalPrice = basePrice * req.quantity;
      const totalDiscounted = discountPrice * req.quantity;
      const discountAmount = totalPrice - totalDiscounted;

      // Create cart item with full product snapshot
      const  cartItem = new CartItem({
        product: {
          _id: productData._id,
          title: productData.title,
          description: productData.description,
          price: productData.price,
          discountedPrice: productData.discountedPrice,
          discount: productData.discount,
          brand: productData.brand,
          color: productData.color,
          imageUrl: productData.imageUrl,
          size: productData.sizes, // picked by user from product.sizes
          category: productData.category,
          topLevelCategory: productData.topLevelCategory,
          secondLevelCategory: productData.secondLevelCategory,
          thirdLevelCategory: productData.thirdLevelCategory,
        },
        cart: cart._id,
        quantity: req.quantity,
        userId,
        price: productData.price * req.quantity,
        discountedPrice: (productData.discountedPrice ?? productData.price) * req.quantity,
        size: req.size,
      });

      const createdCartItem = await cartItem.save();

      // Update the cart totals
      cart = await Cart.findOneAndUpdate(
          { _id: cart._id },
          {
            $push: { cartItems: createdCartItem._id },
            $inc: {
              totalPrice: totalPrice,
              totalItem: 1,
              totalDiscountedPrice: totalDiscounted,
              discount: discountAmount
            }
          },
          { new: true }
      ).populate({
        path: 'cartItems',
        populate: { path: 'product' }
      });

      return cart;
    }

    return "Item is already in cart";

  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = { createCart, findUserCart, addCartItem };
