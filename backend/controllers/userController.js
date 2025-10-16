const Room = require("../models/roomSchema");
const User = require("../models/userSchema");

const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if(!user) {
      return res.status(404).json({message: "User not found"});
    }

    res.status(200).json({username: user.username, email: user.email, userId: user._id})
  } catch (error) {
    res.status(500).json({message: error.message || "Error fetching user"});
  }
}

module.exports = { getUserById};