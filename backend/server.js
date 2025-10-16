const express = require('express')
require("dotenv").config();
const cookieparser = require("cookie-parser")
const cors = require("cors")
const http = require("http");
const { Server } = require("socket.io");

const authRoute = require("./routes/auth");
const connectDB = require('./config/db');
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express()
const port = 3000

app.use(cookieparser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // your frontend URLs
    methods: ["GET", "POST"],
    credentials: true
  }
});

connectDB()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

require('./utils/socketHandler')(io);

app.use("/api/auth", authRoute);

app.use("/api/rooms", roomRoutes);

app.use("/api/user", userRoutes);

server.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening on port ${port}`)
})