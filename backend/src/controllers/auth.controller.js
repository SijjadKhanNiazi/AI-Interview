const userModel = require("../models/user.model");
const tokenBlackList = require("../models/tokenBlackList.model");
const authUser = require("../middlewares/auth.middleware");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
    }
    const isUserAlreadyRegistered = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserAlreadyRegistered) {
      res.status(400).json({
        message: "User already registered with given userName or email",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.error("resgistration error", error);
  }
};

const loggedInUser = async (req, res) => {
  try {
    const { username, email, password } = await req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "please fill email and password fields! ",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found!",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "invalid email or password!",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token);

    return res.status(200).json({
      message: "User loggedIn successfully!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("logingIn error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logoutUser = async (req, res) => {
  const token = await req.cookies.token;

  if (token) {
    await tokenBlackList.create({ token });
  }
  res.clearCookie("token");

  res.status(200).json({
    message: "User loggedOut successfully",
  });
};

const getMe = async (req, res) => {
  const user = await userModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    message: "user fetched successfully.",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
};

module.exports = {
  registerUser,
  loggedInUser,
  logoutUser,
  getMe,
};
