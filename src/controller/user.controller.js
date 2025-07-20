const userService = require("../services/user.service");

const getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(404).send({ error: "No token provided" });
    }

    const user = await userService.getUserProfileByToken(token);

    return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).send(users);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const editUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ error: "No token provided" });
    }

    const payload = req.body || {};
    try {
      const updatedUser = await userService.editUserByToken(token, payload);
      return res.status(200).send(updatedUser);
    } catch (validationError) {
      return res.status(400).send({ error: validationError.message });
    }
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

module.exports = { getUserProfile, getAllUsers, editUser };
