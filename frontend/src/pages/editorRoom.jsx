import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../utils/socket";
import Navbar from "../components/Navbar";
import CodeBox from "../components/codeblock/codeBox.jsx";
import OutputPanel from "../components/OutputPanel";
import VideoGrid from "../components/videoGrid";
import ChatBox from "../components/chatBox";
import { useDispatch, useSelector } from "react-redux";
import { setRoomParticipants } from "../redux/user";
import CollapsibleControl from "../components/CollapsibleControl";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { Home } from "lucide-react";

const EditorRoom = () => {
  const { roomId } = useParams();
  const user = useSelector((state) => state.user.userInfo);
  const dispatch = useDispatch();
  const userId = user?._id;

  const [isTopPanelOpen, setIsTopPanelOpen] = useState(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const [leftWidth, setLeftWidth] = useState(window.innerWidth * 0.67); // Default 2/3 width

  const handleResize = (e, { size }) => setLeftWidth(size.width);
  const handleToggleTop = () => setIsTopPanelOpen(!isTopPanelOpen);
  const handleToggleBottom = () => setIsBottomPanelOpen(!isBottomPanelOpen);

  useEffect(() => {
    if (!userId || !roomId) return;

    socket.connect();
    socket.on("connect", () => {
      socket.emit("register-user", userId);
      socket.emit("join_room", roomId);
      socket.emit("online-participants", roomId, (participants) => {
        dispatch(setRoomParticipants(participants));
      });
    });

    socket.on("room_participants", (participants) => {
      dispatch(setRoomParticipants(participants));
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userId, dispatch]);


  return (
    <div>
      <div className="xl:flex flex-col h-screen dark:bg-black bg-white text-gray-200 font-sans hidden">
        <div className="flex-none">
          <Navbar />
        </div>

        <div className="w-[98.5%] mx-auto flex flex-1 gap-3 mt-3 mb-4 max-h-[calc(100vh-5rem)] overflow-hidden">
          {/* Left Column (Resizable) */}
          <ResizableBox
            width={leftWidth}
            height={Infinity}
            axis="x"
            minConstraints={[window.innerWidth * 0.25]} // Min 30% width
            maxConstraints={[window.innerWidth * 0.75]} // Max 80% width
            onResize={handleResize}
            resizeHandles={["e"]}
            handle={
              <span
                className="absolute -right-2 top-0 h-full w-1 cursor-col-resize rounded-full bg-gray-100 dark:bg-[#252526] hover:bg-blue-500 transition-all duration-200"
              />
            }
          >
            <div className="flex flex-col gap-2 h-full overflow-hidden">
              <CodeBox className="flex-[3]" />
              <OutputPanel className="flex-[1]" />
            </div>
          </ResizableBox>

          {/* Right Column (Auto Adjusts) */}
          <div
            className="flex flex-col flex-1 overflow-hidden transition-all duration-300"
          >
            {/* Top Panel (VideoGrid) */}
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 ${isTopPanelOpen ? "flex-1" : "flex-none h-0 border-none"
                }`}
            >
              <VideoGrid roomId={roomId} />
            </div>

            <CollapsibleControl
              isTopOpen={isTopPanelOpen}
              onToggleTop={handleToggleTop}
              isBottomOpen={isBottomPanelOpen}
              onToggleBottom={handleToggleBottom}
            />

            {/* Bottom Panel (ChatBox) */}
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 ${isBottomPanelOpen ? "flex-1" : "flex-none h-0 border-none"
                }`}
            >
              <ChatBox roomId={roomId} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / Small Screen Fallback */}
      <div className="xl:hidden flex flex-col items-center justify-center h-screen text-center px-6 dark:bg-black bg-white text-gray-800 dark:text-gray-200">
        <h1 className="text-2xl font-semibold mb-4">⚠️ Not Supported on Small Screens</h1>
        <p className="text-sm max-w-md leading-relaxed">
          The collaborative coding environment works best on larger screens.
          Please switch to a laptop or desktop device for the full experience. 💻
        </p>

        <div className="mt-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3211/3211140.png"
            alt="Desktop required"
            className="w-40 opacity-80"
          />
        </div>

        <button
          onClick={() => window.location.href = '/'}
          className="mt-5 text-white px-4 py-2 rounded-sm transition-colors cursor-pointer
          bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 flex
          items-center gap-3"
        >
          <Home className="size-5" />
          Back To Home
        </button>
      </div>

    </div>
  );
};

export default EditorRoom;
