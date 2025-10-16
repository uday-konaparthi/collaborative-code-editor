const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");

const authRoute = require("./routes/auth");
const connectDB = require("./config/db");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

connectDB();

app.get("/", (req, res) => {
  res.send("API running successfully 🚀");
});

require("./utils/socketHandler")(io);

app.use("/api/auth", authRoute);
app.use("/api/rooms", roomRoutes);
app.use("/api/user", userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
