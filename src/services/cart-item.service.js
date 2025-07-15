const userService = require('../services/user.service');
const User = require("../models/user.model");
const CartItem = require("../models/cart-item.model");
const Cart = require("../models/cart.model"); // dodaj na górze pliku


async function updateCartItem(userId, cartItemId, cartItemData) {
  try {
    const item = await CartItem.findById(cartItemId).populate("product");

    if (!item) {
      throw new Error(`Cart item not found: ${cartItemId}`);
    }

    if (item.userId.toString() === userId.toString()) {
      // Aktualizuj dane elementu
      item.quantity = cartItemData.quantity;
      item.price = item.quantity * item.product.price;
      item.discountedPrice = item.quantity * (item.product.discountedPrice || item.product.price);

      const updatedCartItem = await item.save();

      // Aktualizuj koszyk
      const cart = await Cart.findOne({ user: userId });
      if (cart) {
        const cartItems = await CartItem.find({
          _id: { $in: cart.cartItems }
        }).populate("product");

        cart.totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
        cart.totalDiscountedPrice = cartItems.reduce((sum, item) =>
            sum + (item.discountedPrice || item.price), 0);
        cart.totalItem = cartItems.length;
        cart.discount = cart.totalPrice - cart.totalDiscountedPrice;

        await cart.save();
      }

      return updatedCartItem;
    }
    throw new Error("Nie możesz zaktualizować tego elementu");
  } catch (error) {
    throw new Error(error.message);
  }
}

async function removeCartItem(userId, cartItemId) {
  const cartItem = await CartItem.findById(cartItemId).populate("product");
  const user = await userService.findUserById(userId);

  if (user._id.toString() === cartItem.userId.toString()) {
    // Znajdź i zaktualizuj koszyk
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      throw new Error("Nie znaleziono koszyka");
    }

    // Usuń element z CartItem
    await CartItem.findByIdAndDelete(cartItemId);

    // Usuń referencję z koszyka używając filter
    cart.cartItems = cart.cartItems.filter(itemId =>
        itemId.toString() !== cartItemId.toString()
    );

    // Pobierz pozostałe elementy koszyka
    const remainingItems = await CartItem.find({
      _id: { $in: cart.cartItems }
    });

    // Przelicz wartości koszyka
    cart.totalPrice = remainingItems.reduce((sum, item) => sum + item.price, 0);
    cart.totalDiscountedPrice = remainingItems.reduce((sum, item) =>
        sum + ( item.discountedPrice || item.price), 0);
    cart.totalItem = remainingItems.length;
    cart.discount = cart.totalPrice - cart.totalDiscountedPrice;

    await cart.save();
    return cartItem;
  } else {
    throw new Error("Nie możesz usunąć elementu innego użytkownika");
  }
}async function findCartItemById(cartItemId) {
  const cartItem = await CartItem.findById(cartItemId);
  if (cartItem) {
    return cartItem;
  }else{
    throw new Error(`Cart Item not found with id: ${cartItemId}`);
  }
}

module.exports = { updateCartItem, removeCartItem, findCartItemById  };