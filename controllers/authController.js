const User = require("../models/user-model");
const jwt = require("jsonwebtoken");

// CREATE JWT TOKEN
const createJWTToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// CREATE AND SEND JWT TOKEN
const createSendToken = (user, statusCode, res) => {
  const token = createJWTToken(user.id);
  user.password = undefined;
  return res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = async (req, res, next) => {
  try {
    // check if user exists
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist) {
      return res.status(400).json({
        status: "failed",
        message: "user with this email exists",
      });
    }
    // create user
    const user = await User.create(req.body);

    // send response data
    createSendToken(user, 201, res);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      error: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // find user
    const user = await User.findOne({ email }).populate("teams").populate({
      path: "invitations",
      select: "name",
    });
    console.log(user);

    // check if user exist
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "user not found",
      });
    }

    //check if password match
    if (user.password !== password) {
      return res.status(401).json({
        status: "failed",
        message: "invalid login credentials",
      });
    }

    // send response
    createSendToken(user, 201, res);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      error: error.message,
    });
  }
};
