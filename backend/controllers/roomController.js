const Room = require("../models/roomSchema");
const User = require("../models/userSchema");

const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase(); // e.g., "4F9XZL"
};

const createRoom = async (req, res) => {
  const { roomId, username } = req.body;

  if (!roomId || !username) {
    return res.status(400).json({ message: "roomId and username are required" });
  }

  try {
    // Create or find user
    let user = await User.findOne({ username });
    const roomCode = await generateRoomCode();

    if (!user) {
      user = await User.create({ username });
    }

    // Create or find room
    let room = await Room.findOne({ roomId });

    if (!room) {
      room = await Room.create({ roomId, users: [user._id], code: roomCode });
    } else {
      // Add user if not already in the room
      if (!room.users.includes(user._id)) {
        room.users.push(user._id);
        await room.save();
      }
    }

    res.status(201).json({ room, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create/join room" });
  }
};

const getRoomById = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await Room.findOne({ roomId }).populate("users");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ message: "Error fetching room", error: err.message });
  }
};

const getRoomParticipants = async (req, res) => {
  try {
    const { roomId, userIds } = req.body

    const room = await Room.findById(roomId)

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    let participantsIds = room.users;

    if (userIds && userIds.length > 0) {
      participantsIds = participantsIds.filter((user) =>
        userIds.includes(user._id.toString())
      );
    }

    const participants = await User.find({ _id: { $in: participantsIds } }).select("username email _id");

    return res.status(200).json({ participants });
  } catch (error) {
    res.status(500).json({ message: "Error fetching room", error: err.message });
  }
}


const joinRoomByCode = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.userId

    if (!code) {
      return res.status(400).json({ message: "Room code is required" });
    }

    // Find room by code
    const room = await Room.findOne({ code });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Add user to room if not already in users array
    if (!room.users.includes(userId)) {
      room.users.push(userId);
      await room.save();
    }

    return res.status(200).json({ room });
  } catch (error) {
    console.error("joinRoomByCode error:", error);
    res.status(500).json({ message: "Failed to join room", error: error.message });
  }
};

module.exports = {
  createRoom,
  getRoomById,
  getRoomParticipants,
  joinRoomByCode,
};
