const express = require("express");
const { createRoom, getRoomById, getRoomParticipants, joinRoomByCode } = require("../controllers/roomController");
const {protectRoute} = require("../middleware/protectRoute");
const { runCodeOnJudge0 } = require("../utils/runCode");

const router = express.Router();

router.post("/", protectRoute, createRoom); 
router.post("/join", protectRoute, joinRoomByCode);   

router.post("/participants",protectRoute, getRoomParticipants);  
router.get("/:roomId",protectRoute, getRoomById);      // GET /api/rooms/:roomId

router.post("/code/run", runCodeOnJudge0)

module.exports = router;
