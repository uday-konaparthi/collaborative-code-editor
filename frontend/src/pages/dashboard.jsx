import React, { useState } from "react";
import { motion } from "framer-motion";
import ThreeBackground from "../Threejs/ThreeBackground";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/user";
import { setRoom } from "../redux/room";
import { LoaderCircleIcon, LogOut } from "lucide-react";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);
  const [loading, setLoading] = useState({
    create: false,
    join: false,
    logout: false,
  });
  const dispatch = useDispatch();

  // ✅ Create a new room
  const handleCreate = async () => {
    setLoading((prev) => ({ ...prev, create: true }));

    try {
      const roomId = uuidv4();
      const serverUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${serverUrl}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, username: userInfo.username }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(setRoom(data.room));
        navigate(`/editor/${roomId}`);
      } else {
        toast.error(data.message || "Failed to create room");
      }
    } catch (err) {
      toast.error("Server error while creating room");
    } finally {
      setLoading((prev) => ({ ...prev, create: false }));
    }
  };

  // ✅ Join an existing room
  const handleJoinRoom = () => {
    setLoading((prev) => ({ ...prev, join: true }));
    try {
      navigate("/join");
    } catch (error) {
      toast.error("Error joining room");
    } finally {
      setLoading((prev) => ({ ...prev, join: false }));
    }
  };

  // ✅ Logout user
  const handleLogout = () => {
    setLoading((prev) => ({ ...prev, logout: true }));
    try {
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    } finally {
      setLoading((prev) => ({ ...prev, logout: false }));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <ThreeBackground />

      {userInfo && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleLogout}
            className={`flex items-center justify-center gap-2 bg-red-400 hover:bg-red-500 px-4 py-2 rounded-lg shadow-md transition 
            ${loading.logout ? "opacity-70 cursor-not-allowed" : ""}`}
            disabled={loading.logout}
          >
            {loading.logout ? (
              <LoaderCircleIcon className="animate-spin w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2">
                <LogOut className="size-4" />
                <span>Logout</span>
              </div>
            )}
          </button>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-4">
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-4 text-white/80 cursor-default"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Welcome to Collaborative Code Editor
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl mb-8 max-w-xl text-slate-400 cursor-default"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Join a room or create a new one to start real-time collaborative coding.
        </motion.p>

        <motion.div
          className="flex gap-6 flex-wrap justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {userInfo ? (
            <>
              {/* Create Room */}
              <button
                onClick={handleCreate}
                disabled={loading.create}
                className={`flex items-center justify-center gap-2 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-lg 
                hover:bg-cyan-700 active:scale-95 
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500
                transition-all duration-200 ease-in-out cursor-pointer disabled:opacity-70 ${loading.create ? "px-13" : "px-6"}`}
              >
                {loading.create ? (
                  <LoaderCircleIcon className="animate-spin " />
                ) : (
                  "Create Room"
                )}
              </button>

              {/* Join Room */}
              <button
                onClick={handleJoinRoom}
                disabled={loading.join}
                className={`flex items-center justify-center gap-2 px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg transition cursor-pointer disabled:opacity-70`}
              >
                {loading.join ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  "Join Room"
                )}
              </button>
            </>
          ) : (
            // If user not logged in
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg transition cursor-pointer"
            >
              Get Started
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
