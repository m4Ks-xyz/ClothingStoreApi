const User = require("../models/user.model.js");
const Address = require("../models/address.model")
const bcrypt = require("bcrypt");
const jwtProvider = require("../config/jwtProvider");

const createUser = async (userData) => {
  try {
    let { firstName, lastName, email, password } = userData;

    const isUserExist = await User.findOne({ email: email });

    if (isUserExist) {
      throw new Error("This Email address is taken.");
    }

    password = await bcrypt.hash(password, 8);

    const user = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    });


    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const findUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password -createdAt -role -paymentInformation')
      .populate("address");
    if (!user) {
      throw new Error(`User not found with id: ${userId}`);
    }
    return user
  } catch (error) {
    throw new Error(error.message);
  }
};

const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email });

    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getUserProfileByToken = async (token) => {
  try {
    const userId = jwtProvider.getUserIdFromToken(token);

    const user = await findUserById(userId);

    if (!user) {
      throw new Error(`User not found with id: ${userId}`);
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    throw new Error(error.message);
  }
};



const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\//i;

const editUserByToken = async (token, payload) => {
  try {
    const userId = jwtProvider.getUserIdFromToken(token);
    const user = await User.findById(userId).populate('address');
    if (!user) throw new Error("User not found");

    const { email, newPassword, currentPassword, avatarImg, deleteAddressId } = payload;

    // Validate email
    if (email && !EMAIL_RE.test(email)) {
      throw new Error("Invalid email format");
    }
    if (email) {
      const existing = await User.findOne({ email });
      if (existing && existing._id.toString() !== userId) {
        throw new Error("This email address is taken.");
      }
      user.email = email;
    }

    // Validate avatar image URL
    if (avatarImg && !URL_RE.test(avatarImg)) {
      throw new Error("Invalid avatar image URL");
    }
    if (avatarImg) {
      user.avatarImg = avatarImg;
    }

    // Validate and change password if provided
    if (newPassword) {
      if (!currentPassword) {
        throw new Error("Current password is required to change password");
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }
      user.password = await bcrypt.hash(newPassword, 8);
    }


    if (deleteAddressId) {
      const addressIndex = user.address.findIndex(addr => addr._id.toString() === deleteAddressId);
      if (addressIndex === -1) {
        throw new Error("Address not found");
      }
      user.address.splice(addressIndex, 1);

      await Address.findByIdAndDelete(deleteAddressId, {});
    }

    await user.save();
    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;
    return sanitizedUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createUser,
  findUserById,
  getUserByEmail,
  getUserProfileByToken,
  getAllUsers,
  editUserByToken
};
