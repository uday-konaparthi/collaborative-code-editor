const express = require("express");
const { getUserById } = require("../controllers/userController");
const router = express.Router();

router.get("/:userId", getUserById);

module.exports = router;
