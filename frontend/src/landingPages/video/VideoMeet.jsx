import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import JoinCall from "./JoinCall";
import ChatModel from "./ChatModel";
import ControlBar from "./ControlBar";
import ShowVideo from "./ShowVideo";
import TopBar from "./TopBar";
import useMedia from "../../hooks/useMedia";
import useChat from "../../hooks/useChat";
import useDisplayMedia from "../../hooks/useDisplayMedia";
import useWebrtc from "../../hooks/useWebrtc";
const connections = {};

export default function VideoMeet() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const isFirstRender = useRef(true);
  const isJoined = useRef(false);
  const showModelRef = useRef(false);
  const isGetMediaCalled = useRef(false);
  const localStreamRef = useRef();
  const localVideoRef = useRef();

  const [screen, setScreen] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [message, setMessage] = useState("");
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const videoRef = useRef([]);
  const [videos, setVideos] = useState([]);

  const {
    gotMessageFromServer,
    addMessage,
    messages,
    newMessages,
    handleChatModule,
    sendMessage,
  } = useChat(
    connections,
    socketIdRef,
    socketRef,
    showModelRef,
    showModel,
    setShowModel,
    message,
    setMessage,
    username,
  );

  const { connectToSocketServer, endCall } = useWebrtc(
    socketRef,
    socketIdRef,
    connections,
    setVideos,
    videoRef,
    localStreamRef,
    localVideoRef,
    gotMessageFromServer,
    addMessage,
  );

  const {
    getPermissions,
    screenAvailable,
    video,
    setVideo,
    audio,
    setAudio,
    getUserMedia,
    getMedia,
  } = useMedia(
    connections,
    socketIdRef,
    socketRef,
    connectToSocketServer,
    isJoined,
    isGetMediaCalled,
    localStreamRef,
    localVideoRef,
  );

  const { getDisplayMedia, stopScreenSharing } = useDisplayMedia(
    localStreamRef,
    localVideoRef,
    connections,
    socketIdRef,
    socketRef,
    getUserMedia,
    setScreen,
    screenAvailable,
  );

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      await getPermissions();
    };
    init();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isJoined.current) return;
    // if (isGetMediaCalled.current) {
    //   isGetMediaCalled.current = false;
    //   return;
    // }
    getUserMedia();
  }, [audio, video, getUserMedia]);

  // connect
  const connect = (e) => {
    e.preventDefault();
    setAskForUsername(false);
    getMedia();
  };

  // handleVideo
  const handleVideo = () => {
    setVideo(!video);
  };

  // handleAudio
  const handleAudio = () => {
    setAudio(!audio);
  };

  // handleScreen
  const handleScreen = () => {
    const nextScreenState = !screen;
    setScreen(nextScreenState);

    if (nextScreenState) {
      getDisplayMedia();
    } else {
      stopScreenSharing();
    }
  };

  return (
    <Box>
      {askForUsername ? (
        // JoinCall
        <JoinCall
          username={username}
          setUsername={setUsername}
          localVideoRef={localVideoRef}
          connect={connect}
        />
      ) : (
        <Box
          sx={{
            minHeight: "100vh",
            height: "100vh",
            background: "#0d1117",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Top bar */}
          <TopBar videos={videos} />

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              overflow: "hidden",
              p: "10px",
              gap: "10px",
              minHeight: 0,
            }}
          >
            {/* Video grid */}
            <ShowVideo localVideoRef={localVideoRef} videos={videos} />

            {/* Chat panel */}
            {showModel && (
              <Box
                sx={{
                  width: {sm: 200, md: 250, lg:300},
                  flexShrink: 0,
                  background: "#111827",
                  border: "1px solid #1e3a5f",
                  borderRadius: "12px",
                  overflow: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <ChatModel
                  messages={messages}
                  sendMessage={sendMessage}
                  message={message}
                  setMessage={setMessage}
                />
              </Box>
            )}
          </Box>

          {/* Control bar */}
          <ControlBar
            handleVideo={handleVideo}
            video={video}
            handleAudio={handleAudio}
            audio={audio}
            endCall={endCall}
            handleScreen={handleScreen}
            screen={screen}
            newMessages={newMessages}
            handleChatModule={handleChatModule}
            showModel={showModel}
          />
        </Box>
      )}
    </Box>
  );
}
