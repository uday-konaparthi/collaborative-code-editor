import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../utils/socket";
import { clearRoom } from "../redux/room";
import toast from "react-hot-toast";
import { setResult, setRunningStatus } from "../redux/codeSlice";
import { CircleStop, EllipsisIcon, LogOut, Moon, PlayIcon, Sun } from "lucide-react";
import { toggleTheme } from "@/redux/themeSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const room = useSelector((state) => state.room.room);
  const code = useSelector((state) => state.code.code);
  const stdin = useSelector((state) => state.code.stdin);
  const userInfo = useSelector((state) => state.user.userInfo);
  const dark = useSelector((state) => state.theme.dark);

  const { username: runningUser, status: isRunning } = useSelector(
    (state) => state.code.runningStatus
  );

  const [languageId, setLanguageId] = useState(71); // Python

  const handleExitRoom = () => {
    socket.emit("leave_room");
    dispatch(clearRoom());
    navigate("/");
  };

  useEffect(() => {
    socket.on("receive-language", (langId) => {
      setLanguageId(langId);
    });

    socket.on("running-code", ({ username, status }) => {
      dispatch(setRunningStatus({ username, status }));
    });

    return () => {
      socket.off("receive-language");
      socket.off("running-code");
    };
  }, [dispatch]);

  const handleRun = async () => {
    if (!room?.roomId || !userInfo?.username) return;

    dispatch(setRunningStatus({ username: userInfo.username, status: true }));
    socket.emit("running-code", {
      roomId: room.roomId,
      username: userInfo.username,
      status: true,
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms/code/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.roomId,
          username: userInfo.username,
          code,
          languageId,
          stdin,
        }),
        credentials: "include",
      });

      const result = await response.json();
      console.log(result)
      toast.dismiss();

      dispatch(setResult(result.result));
      socket.emit("save-code", { roomId: room.roomId, code });
      socket.emit("code-result", {
        roomId: room.roomId,
        result: result.result,
      });
    } catch (error) {
      toast.dismiss();
      toast.error(error.message);
      console.error(error);
    } finally {
      dispatch(setRunningStatus({ username: null, status: false }));
      socket.emit("running-code", {
        roomId: room.roomId,
        username: userInfo.username,
        status: false,
      });
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);


  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <nav
      className={`w-full px-6 pt-4 flex justify-between items-center transition-colors duration-300 ${dark
        ? "bg-black/70 border-slate-800 text-gray-200"
        : "bg-white border-slate-200 text-gray-800"
        }`}
    >
      {/* Left */}
      <div className="flex items-center gap-2">
        <div
          className={`text-xs font-mono px-3 py-1.5 rounded-md border ${dark
              ? "bg-slate-900/80 border-slate-700 text-slate-200"
              : "bg-gray-100 border-gray-200 text-gray-700"
            }`}
        >
          <span className="font-semibold text-gray-500">Room ID:</span> {room?.code || "N/A"}
        </div>

      </div>

      {/* Center */}
      <div className="flex items-center gap-3">
        {!isRunning && (
          <select
            value={languageId}
            onChange={(e) => {
              const lang = Number(e.target.value);
              socket.emit("language-change", {
                roomId: room.roomId,
                languageId: lang,
              });
            }}
            className={`rounded-md px-4 py-2 border text-sm focus:outline-none focus:ring-2 transition-all ${dark
              ? "bg-slate-800 border-slate-700 text-gray-300 focus:ring-slate-500"
              : "bg-white border-slate-300 text-gray-700 focus:ring-slate-400"
              }`}
          >
            <option value={71}>Python (3.x)</option>
            <option value={50}>C</option>
            <option value={54}>C++ (GCC 9.2)</option>
            <option value={62}>Java (OpenJDK)</option>
            <option value={63}>JavaScript</option>
          </select>
        )}

        <button
          onClick={handleRun}
          disabled={isRunning}
          className={`flex items-center gap-2 text-white font-medium py-1.5 px-4 hover:scale-105 cursor-pointer rounded-sm ${isRunning
            ? "bg-gradient-to-r from-slate-500 to-slate-700 cursor-not-allowed"
            : "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700"
            }`}
        >
          {isRunning ? (
            <>
              <CircleStop className="w-4 h-4 animate-spin" />
              Judging...
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4" />
              Run Code
            </>
          )}
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div
          className={`p-2 rounded-md cursor-pointer transition-colors ${dark
            ? "hover:bg-slate-800 text-yellow-400"
            : "hover:bg-gray-100 text-indigo-600"
            }`}
          onClick={handleToggleTheme}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </div>

        <button
          variant="outline"
          onClick={handleExitRoom}
          className={`border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-1 cursor-pointer transition-colors delay-1 rounded-md border border-2 flex items-center gap-2`}
        >
          <LogOut className="size-4" />
          Leave
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
