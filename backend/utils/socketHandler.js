const { roomSchema } = require('../models/roomSchema'); // Placeholder for future use

module.exports = (io) => {
  const onlineUsers = new Map(); // userId => socketId
  const userToRoom = new Map();  // userId => roomId
  const roomCodeMap = new Map(); // roomId => latest code snapshot
  const roomLocks = {};

  // Helper to get userIds of participants in a room
  const getParticipants = (io, roomId) => {
    const socketsInRoom = io.sockets.adapter.rooms.get(roomId) || new Set();
    const participants = [];

    for (const socketId of socketsInRoom) {
      const sock = io.sockets.sockets.get(socketId);
      if (sock?.userId) participants.push(sock.userId);
    }

    return participants;
  };

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // Register userId with socket
    socket.on("register-user", (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
      }
    });

    // Join a room
    socket.on("join_room", (roomId) => {
      if (socket.roomId) {
        socket.leave(socket.roomId);
      }

      socket.join(roomId);
      socket.roomId = roomId;
      userToRoom.set(socket.userId, roomId);

      // Inform this user about existing others in the room (only first for signaling)
      const otherSockets = [...(io.sockets.adapter.rooms.get(roomId) || [])].filter(id => id !== socket.id);

      const participants = getParticipants(io, roomId);
      io.to(roomId).emit("room_participants", participants);

      if (otherSockets.length > 0) {
        socket.emit("user-joined", otherSockets[0]);
      }

      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Leave a room
    socket.on("leave_room", () => {
      if (socket.roomId) {
        const roomId = socket.roomId;
        socket.leave(roomId);

        // Notify others in room user left
        socket.to(roomId).emit("user-left", socket.id);

        socket.roomId = null;
        userToRoom.delete(socket.userId);

        const participants = getParticipants(io, roomId);
        io.to(roomId).emit("room_participants", participants);

        console.log(`User ${socket.id} left room ${roomId}`);
      }
    });

    // WebRTC signaling events
    socket.on("offer", ({ to, offer }) => {
      console.log(`📨 Offer from ${socket.id} to ${to}`);
      io.to(to).emit("offer", { from: socket.id, offer });
    });

    socket.on("answer", ({ to, answer }) => {
      console.log(`📨 Answer from ${socket.id} to ${to}`);
      io.to(to).emit("answer", { from: socket.id, answer });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
      console.log(`📨 ICE candidate from ${socket.id} to ${to}`);
      io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    // Chat feature
    socket.on("send_message", ({ roomId, message, sender }) => {
      if (roomId) socket.to(roomId).emit("receive_message", { message, sender });
    });

    // Collaborative code features
    socket.on("handle-code", ({ roomId, code }) => {
      if (!roomId) return;
      roomCodeMap.set(roomId, code);
      socket.to(roomId).emit("receive-code", code);
    });

    socket.on("save-code", async ({ roomId, code }) => {
      // Implement DB save logic here later if needed
    });

    socket.on("code-result", async ({ roomId, result }) => {
      socket.to(roomId).emit("receive-result", result);
    });

    socket.on("language-change", ({ roomId, languageId }) => {
      io.to(roomId).emit("receive-language", languageId);
    });

    socket.on("running-code", ({ roomId, username, status }) => {
      console.log(`Running code in room ${roomId} by ${username}: ${status}`);
      socket.to(roomId).emit("running-code", { username, status });
    })

    // Lock requests
    socket.on("request-lock", (roomId) => {
      if (!roomLocks[roomId]) {
        roomLocks[roomId] = socket.id;
        socket.emit("lock-granted");
        socket.to(roomId).emit("lock-update", { locked: true, by: socket.id });
      } else {
        socket.emit("lock-denied");
      }
    });

    socket.on("release-lock", (roomId) => {
      if (roomLocks[roomId] === socket.id) {
        roomLocks[roomId] = null;
        socket.to(roomId).emit("lock-update", { locked: false });
      }
    });

    socket.on("remote-mic-toggle", (payload) => {
      console.log(`Relaying mic toggle from ${socket.id} to ${payload.to}`);
      io.to(payload.to).emit("remote-mic-toggle", { micOn: payload.micOn });
    });

    // Relay camera status change
    socket.on("remote-camera-toggle", (payload) => {
      console.log(`Relaying camera toggle from ${socket.id} to ${payload.to}`);
      io.to(payload.to).emit("remote-camera-toggle", { cameraOn: payload.cameraOn });
    });

    //socket.emit("lock-denied", { by: roomLocks[roomId] });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);

      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        userToRoom.delete(socket.userId);
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
      }

      if (socket.roomId) {
        const roomId = socket.roomId;
        socket.leave(roomId);
        socket.roomId = null;

        // Notify others in the room user left
        socket.to(roomId).emit("user-left", socket.id);

        const participants = getParticipants(io, roomId);
        io.to(roomId).emit("room_participants", participants);
      }
    });
  });
};
