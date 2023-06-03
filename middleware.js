const jwt = require("jsonwebtoken");
const User = require("./models/user-model");

// PROTECT ROUTE
exports.protect = async (req, res, next) => {
  // check if token is available on authorization header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // if not, restrict access
  if (!token) {
    return res.status(401).json({
      status: "failed",
      message: "unauthenticated",
    });
  }

  // decode the token to extract the user identifier
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      status: "failed",
      message: error.message || "your login token is invalid",
    });
  }

  // use identifier to find user in database
  try {
    const user = await User.findById(decoded.id);

    // if user does not exist, throw an error and abort operation
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "user no longer exists",
      });
    }

    // if user is available, store the user data on the request object

    req.user = user;

    // call the next() middleware
    next();
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      message: error.message,
    });
  }
};
