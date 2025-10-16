import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setRoom } from "../redux/room";
import ThreeBackground from "../Threejs/ThreeBackground"; // ✅ import your background
import { Loader, LoaderCircle } from "lucide-react";

const JoinRoom = () => {
  const [code, setCode] = useState(""); 
  const [isLoading, setisLoading] = useState(false); 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleJoin = async () => {
    if (!code.trim()) return alert("Please enter a room code.");
    setisLoading(true)

    try {
      const serverUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${serverUrl}/api/rooms/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      if (response.ok) {
        dispatch(setRoom(data.room));
        navigate(`/editor/${data.room.roomId}`);
      } else {
        alert(data.message || "Room join failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while joining the room.");
    } finally {
      setisLoading(false)
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleJoin();
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-black text-white px-4 overflow-hidden">
      {/* 3D background layer */}
      <ThreeBackground />

      {/* Foreground content */}
      <div className="z-10">
        <h1 className="text-4xl font-bold mb-6 text-cyan-400 cursor-default ">Join a Room</h1>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter Room Code"
          className="input input-accent mb-4 px-4 py-2 rounded-md text-white bg-gray-700 "
        />
        <button
          onClick={handleJoin}
          className={`bg-cyan-500 hover:bg-cyan-600 py-2 rounded-md font-semibold transition cursor-pointer ${isLoading ? "px-10" : "px-6"}`}
        >
          {isLoading ? <LoaderCircle className="animate-spin" /> : "Join Room"}
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;
