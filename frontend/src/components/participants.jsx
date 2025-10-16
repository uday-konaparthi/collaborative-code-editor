import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Participants = () => {
  const userIds = useSelector((state) => state.user.roomParticipants);
  const room = useSelector((state) => state.room.room);
  const roomId = room?._id;

  const [participantsList, setParticipantsList] = useState([]);

  const fetchOnlineParticipants = async () => {
    try {
      const serverUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${serverUrl}/api/rooms/participants`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId, userIds }),
      });

      const data = await response.json();
      setParticipantsList(data.participants || []);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  useEffect(() => {
    if (roomId && userIds?.length > 0) {
      fetchOnlineParticipants();
    }
  }, [userIds, roomId]);

  return (
    <div className="w-1/5 h-full bg-[#1a1a28] rounded-xl border border-gray-700 px-4 py-2 text-white overflow-y-auto">
      <h3 className="text-lg font-semibold mb-2">Participants</h3>
      <ul className="space-y-2 text-sm">
        {participantsList.map((client, index) => (
          <li
            key={client._id}
            className="bg-[#252537] px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#2f2f42] transition"
          >
            <span>{client.username || client.email || client._id}</span>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Participants;
