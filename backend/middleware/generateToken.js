const jwt = require("jsonwebtoken");

const generateToken = (userId, email) => {
  return jwt.sign({ id: userId, email: email }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

module.exports = generateToken;