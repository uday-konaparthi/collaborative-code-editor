import React, { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import { socket } from "../utils/socket";
import { useSelector } from "react-redux";

const ChatBox = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messageEndRef = useRef(null);

  const currentUser = useSelector((state) => state.user.userInfo);
  const userId = currentUser?._id;
  const participants = useSelector((state) => state.user.roomParticipants);
  const dark = useSelector((state) => state.theme.dark)

  const fetchUsername = async (userId) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/user/${userId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
      }
    );

    const data = await response.json();
    return data.username;
  };

  useEffect(() => {
    const fetchAndLog = async () => {
      if (participants?.length === 1 || participants?.length === 2) {
        if (participants[participants.length - 1] == userId) return;
        const username = await fetchUsername(
          participants[participants.length - 1]
        );
        
        setMessages((prev) => [
          ...prev,
          {
            sender: { _id: "system" },
            message: `${username} joined the room`,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } else if (participants?.length === 0 || participants?.length === 1) {
        
        setMessages((prev) => [
          ...prev,
          {
            sender: { _id: "system" },
            message: `User left the room`,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      }
    };

    fetchAndLog();
  }, [participants, userId]);

  const handleSend = () => {
    if (!input.trim() || !userId) return;

    const msgData = {
      roomId,
      message: input,
      sender: {
        _id: currentUser._id,
        username: currentUser.username,
      },
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("send_message", msgData);
    setMessages((prev) => [...prev, msgData]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: messages.length > 1 ? "smooth" : "auto",
    });
  }, [messages]);

  return (
    <div
      className={`flex flex-col gap-1 h-full w-full px-2 py-1 transition-colors duration-300 dark:bg-[#1E1E1E] bg-[#F3F4F6] ${
        dark ? " text-gray-200" : "text-gray-800"
      }`}
    >
      {/* Messages area */}
      <div
        className={`flex-1 overflow-y-auto space-y-4 rounded-sm dark:bg-[#1E1E1E] bg-[#F3F4F6] custom-scrollbar`}
      >
        {messages.map((msg, idx) => {
          if (msg.sender._id === "system") {
            return (
              <div key={idx} className="flex justify-center my-2">
                <span
                  className={`px-4 py-1 rounded-full text-xs font-medium ${
                    dark ? "bg-slate-800 text-gray-300" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {msg.message}
                </span>
              </div>
            );
          }

          const isCurrentUser = msg.sender._id === userId;

          return (
            <div
              key={idx}
              className={`flex flex-col max-w-[80%] md:max-w-[70%] ${
                isCurrentUser ? "items-end ml-auto" : "items-start mr-auto"
              }`}
            >
              <div
                className={`text-xs font-semibold mb-1 ${
                  isCurrentUser ? "text-indigo-400" : "text-gray-500"
                }`}
              >
                {isCurrentUser ? "You" : msg.sender.username}
              </div>

              <div
                className={`px-4 py-2.5 text-sm rounded-2xl shadow-md whitespace-pre-wrap break-words transition-all duration-200 ${
                  isCurrentUser
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-none"
                    : dark
                    ? "bg-slate-800 text-gray-100 rounded-bl-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.message}
              </div>

              <time className="text-[0.65rem] text-gray-500 mt-1">{msg.time}</time>
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>

      {/* Input area */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className={`flex-1 px-4 py-3 rounded-full text-sm outline-none transition-all duration-300 border relative ${
            dark
              ? "bg-black/30 border-slate-700 text-gray-200 placeholder-gray-500 focus:border-slate-500 focus:ring-slate-600/40"
              : "bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-slate-400 focus:ring-slate-400/30"
          }`}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={`absolute right-7 items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${
            !input.trim()
              ? "opacity-50 cursor-not-allowed hidden"
              : "dark:text-white text-slate-700 flex"
          }`}
        >
          <SendHorizontal size={25} />
        </button>
      </div>

      <footer className="text-xs flex place-self-center py-0.5 font-mono">
        *chats get vanished after exit :{')'}
      </footer>
    </div>
  );
};

export default ChatBox;
