const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const createToken = (_id) => {
  const jwtKey = process.env.JWT_SECRET;
  return jwt.sign({ _id }, jwtKey, { expiresIn: "1d" });
};

const registerUser = async (request, response) => {
  try {
    const { name, email, password } = request.body;

    let user = await userModel.findOne({ email });

    if (user) return response.status(400).json("user email already exists...");

    if (!name || !email || !password)
      return response.status(400).json("All fields required...");

    if (!validator.isEmail(email))
      return response.status(400).json("Email must be valid...");

    if (!validator.isStrongPassword(password))
      return response.status(400).json("Password must be strong...");

    user = new userModel({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const token = createToken(user._id);

    response.status(200).json({ _id: user._id, name, email, token });
  } catch (error) {
    console.log(error);
    response.status(500).json(error);
  }
};

const loginUser = async (request, response) => {
  try {
    const { email, password } = request.body;

    let user = await userModel.findOne({ email });

    if (!user)
      return response.status(400).json("Incorrect email or password...");

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return response.status(400).json("Incorrect email or password...");

    const token = createToken(user._id);
    response.status(200).json({ _id: user._id, name: user.name, email, token });
  } catch (error) {
    console.log(error);
    response.status(500).json(error);
  }
};

const findUser = async (request, response) => {
  try {
    const { userId } = request.params;
    const user = await userModel.findById(userId);
    if (!user) return response.status(400).json("User not found...");

    const token = createToken(user._id);
    response
      .status(200)
      .json({ _id: user._id, name: user.name, email: user.email, token });
  } catch (error) {
    response.status(500).json(error);
  }
};

const getUsers = async (request, response) => {
  try {
    const users = await userModel.find();
    if (!users) return response.status(400).json("Users not found...");
    response.status(200).json(users);
  } catch (error) {
    response.status(500).json(error);
  }
};

module.exports = { registerUser, loginUser, findUser, getUsers };
