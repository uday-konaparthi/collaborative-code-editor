import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Merge } from "lucide-react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const socket = io(import.meta.env.VITE_API_URL); // e.g., http://localhost:3000

const ExampleVideoCall = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const peerSocketIdRef = useRef(null);

  const [peerSocketId, setPeerSocketId] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [userLeft, setUserLeft] = useState(false); // Show "User has left" message
  const [inCall, setInCall] = useState(false); // Track if user joined the call
  const [joinCall, showJoinCall] = useState(false);

  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteCameraOn, setRemoteCameraOn] = useState(true);

  const room = useSelector((state) => state.room.room);
  const roomId = room?._id;
  const participants = useSelector((state) => state.user.roomParticipants);

  useEffect(() => {
    if (participants?.length > 1) {
      showJoinCall(true);
    } else {
      showJoinCall(false);
    }
  }, [participants]);

  useEffect(() => {
    peerSocketIdRef.current = peerSocketId;
  }, [peerSocketId]);

  useEffect(() => {
    if (!roomId || !inCall) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:relay1.expressturn.com:3478" },
        {
          urls: "turn:relay1.expressturn.com:3478",
          username: "000000002070959025",
          credential: "g7TaZJiYfIdSS8LMKhxDYPXVMIg=",
        },
        {
          urls: "turn:relay1.expressturn.com:3478?transport=tcp",
          username: "000000002070959025",
          credential: "g7TaZJiYfIdSS8LMKhxDYPXVMIg=",
        },
      ],
    });

    peerConnectionRef.current = pc;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        socket.emit("join_room", roomId);
      })
      .catch((err) => {
        console.error("Failed to get user media", err);
        alert("Could not access camera and microphone.");
      });

    const handleUserJoined = async (otherSocketId) => {
      setUserLeft(false);
      setRemoteMicOn(true);
      setRemoteCameraOn(true);
      setPeerSocketId(otherSocketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { to: otherSocketId, offer });
    };

    const handleOffer = async ({ from, offer }) => {
      setUserLeft(false);
      setRemoteMicOn(true);
      setRemoteCameraOn(true);
      setPeerSocketId(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, answer });
    };

    const handleAnswer = async ({ from, answer }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleIceCandidate = async ({ from, candidate }) => {
      console.log("received ice candidates: ", candidate);
      if (candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    const handleUserLeft = (leftSocketId) => {
      if (leftSocketId === peerSocketIdRef.current) {
        setPeerSocketId(null);
        setUserLeft(true);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      }
    };

    const handleRemoteMicToggle = ({ micOn: newMicState }) => {
      setRemoteMicOn(newMicState);
    };

    const handleRemoteCameraToggle = ({ cameraOn: newCameraState }) => {
      setRemoteCameraOn(newCameraState);
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-left", handleUserLeft);
    socket.on("remote-mic-toggle", handleRemoteMicToggle);
    socket.on("remote-camera-toggle", handleRemoteCameraToggle);

    pc.onicecandidate = (event) => {
      if (event.candidate && peerSocketIdRef.current) {
        socket.emit("ice-candidate", {
          to: peerSocketIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      pc.close();

      socket.off("user-joined", handleUserJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-left", handleUserLeft);
      socket.off("remote-mic-toggle", handleRemoteMicToggle);
      socket.off("remote-camera-toggle", handleRemoteCameraToggle);
    };
  }, [roomId, inCall]);

  const toggleMic = () => {
    const newMicState = !micOn;

    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setMicOn(newMicState);

    if (peerSocketIdRef.current) {
      socket.emit("remote-mic-toggle", { to: peerSocketIdRef.current, micOn: newMicState });
    }
  };

  const toggleCamera = () => {
    const newCameraState = !cameraOn;

    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setCameraOn(newCameraState);
    
    if (peerSocketIdRef.current) {
      socket.emit("remote-camera-toggle", { to: peerSocketIdRef.current, cameraOn: newCameraState });
    }
  };

  const leaveCall = () => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnectionRef.current?.close();
    socket.emit("leave_room");
    setUserLeft(false);
    setPeerSocketId(null);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setInCall(false);
  };

  return (
    <div className="w-full h-full dark:bg-[#252526] bg-[#F3F4F6] p-1 relative">
      {/* Show Join Call button if not in call */}
      {!inCall && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-4">
          {userLeft && (
            <p className="text-white text-lg font-semibold">
              The other user left the call.
            </p>
          )}

          {joinCall ? (
            <button
              onClick={() => {
                setUserLeft(false);
                setInCall(true);
              }}
              className="bg-blue-600 text-white px-6 py-1.5 rounded-lg text-lg hover:bg-blue-700 transition flex gap-2 items-center"
            >
              <Merge className="size-4" />
              Join Call
            </button>
          ) : (
            <p className="text-white font-semibold">
              Waiting for another user to Join...
            </p>
          )}
        </div>
      )}

      {/* Main Video Container */}
      <div
        className={`w-full h-full bg-black/10 dark:bg-black rounded-md overflow-hidden shadow-lg relative ${!inCall ? "filter blur-lg" : ""
          }`}
      >
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />

        {/* 1. MAIN OVERLAY: Handles "User Left" or "Camera Off" */}
        {inCall && (userLeft || !remoteCameraOn) && (
          <div className="absolute inset-0 flex flex-col gap-4 items-center justify-center text-white bg-black bg-opacity-60 pointer-events-none">
            {/* Conditionally show "user left" message first, as it's the most important status */}
            {userLeft ? (
              <p className="text-lg font-semibold">The other user has left the call.</p>
            ) : (
              // Otherwise, show the camera off status
              <>
                <VideoOff size={52} />
                <p className="text-lg font-semibold">
                  Camera is off
                </p>
              </>
            )}
          </div>
        )}

        {/* 2. MIC STATUS INDICATOR: Small icon in the corner */}
        {inCall && !userLeft && !remoteMicOn && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 p-2 rounded-full text-white text-sm pointer-events-none">
            <MicOff size={16} />
            <span>Muted</span>
          </div>
        )}
      </div>

      {/* Controls & Local Video */}
      <div
        className={`absolute bottom-7 left-1 right-7 flex justify-between items-end z-10 ${!inCall ? "pointer-events-none opacity-50" : ""
          }`}
      >
        <div className="w-26 sm:w-36"></div>

        <div className="flex items-center gap-4 bg-transparent p-3 rounded-full">
          <button
            onClick={toggleMic}
            disabled={!inCall}
            className={`p-3 rounded-full text-white transition-colors ${micOn
              ? "bg-gray-600 hover:bg-gray-500"
              : "bg-red-600 hover:bg-red-500"
              } ${!inCall ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          <button
            onClick={toggleCamera}
            disabled={!inCall}
            className={`p-3 rounded-full text-white transition-colors ${cameraOn
              ? "bg-gray-600 hover:bg-gray-500"
              : "bg-red-600 hover:bg-red-500"
              } ${!inCall ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
          </button>
          <button
            onClick={leaveCall}
            disabled={!inCall}
            className="p-3 bg-red-600 hover:bg-red-500 rounded-full text-white transition-colors"
          >
            <PhoneOff size={18} />
          </button>
        </div>

        <div className="w-20 sm:w-30 h-auto rounded-xl overflow-hidden border-2 border-gray-400 dark:border-gray-700 shadow-md">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        </div>
      </div>
    </div>
  );
};

export default ExampleVideoCall;
