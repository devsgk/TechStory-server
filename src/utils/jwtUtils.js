const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.generateAccessToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
};

exports.generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "2w",
  });
};

exports.verifyAccessToken = (token) => {
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET_KEY);

    return {
      isValidate: true,
      userId: user.userId,
    };
  } catch (error) {
    return {
      isValidate: false,
      message: error.message,
    };
  }
};

exports.verifyRefreshToken = async (token, userId) => {
  try {
    const user = await User.findById(userId);

    if (token === user.refreshToken) {
      try {
        jwt.verify(token, process.env.JWT_SECRET_KEY);

        return true;
      } catch (error) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
};
