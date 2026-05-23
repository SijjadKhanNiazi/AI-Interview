const jwt = require("jsonwebtoken");
const tokenBlackList = require("../models/tokenBlackList.model");

const authUser = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Token not found",
    });
  }

  const isBlackListedToken = await tokenBlackList.findOne({ token });
  if (isBlackListedToken) {
    return res.status(401).json({
      message: "Invalid token. please login again",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = { authUser };
