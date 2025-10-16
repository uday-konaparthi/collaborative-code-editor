const jwt = require("jsonwebtoken");

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(400).json({ message: "Token is missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(400).json({ message: "Invalid Token" });
    }

    req.userId = decoded.id;
    next();

  } catch (error) {
    console.error("Error in protectRoute:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {protectRoute};