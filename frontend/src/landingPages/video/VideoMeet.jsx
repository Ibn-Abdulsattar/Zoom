import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { io } from "socket.io-client";
import VideocamIcon from "@mui/icons-material/Videocam";
import SpeakerNotesOffIcon from "@mui/icons-material/SpeakerNotesOff";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
const server_url = import.meta.env.VITE_Backend_URL;

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const connections = {};

export default function VideoMeet() {
  const navigate = useNavigate();
  const socketRef = useRef();
  const socketIdRef = useRef();

  const localVideoRef = useRef();

  const [videoAvailable, setVideoAvailable] = useState(true);

  const [audioAvailable, setAudioAvailable] = useState(true);

  const [video, setVideo] = useState(false);

  const [audio, setAudio] = useState(false);

  const [screen, setScreen] = useState();

  const [showModel, setShowModel] = useState();

  const [screenAvailable, setScreenAvailable] = useState();

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [newMessages, setNewMessages] = useState(0);

  const [askForUsername, setAskForUsername] = useState(true);

  const [username, setUsername] = useState("");

  const videoRef = useRef([]);

  const [videos, setVideos] = useState([]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // getPermissions
  const getPermissions = async () => {
    try {
      // video permission
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }
      // audio permoission
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }
      // Screen-share Permission
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          localVideoRef.current.srcObject = userMediaStream;
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  // getUserMediaSuccess
  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      window.localStream.getTracks().forEach((track) => {
        connections[id].addTrack(track, window.localStream);
      });

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, {
              sdp: connections[id].localDescription,
            });
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setAudio(false);
          setVideo(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          // BlackSilence
          const blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            window.localStream.getTracks().forEach((track) => {
              connections[id].addTrack(track, window.localStream);
            });

            connections[id]
              .createOffer()
              .then((description) => {
                connections[id]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      id,
                      JSON.stringify({ sdp: connections[id].localDescription }),
                    );
                  })
                  .catch((e) => console.log(e));
              })
              .catch((e) => console.log(e));
          }
        }),
    );
  };

  // silence
  const silence = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();

    const dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();

    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  // black /Fake video
  const black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"));
    canvas.width = width;
    canvas.height = height;

    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();

    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  // getUserMedia
  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video, audio })
        .then(getUserMediaSuccess)
        .catch((err) => console.log(err));
    } else {
      try {
        const tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  // gotMessageFromServer
  const gotMessageFromServer = (fromId, message) => {
    let signal = typeof message === "string" ? JSON.parse(message) : message;

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        }),
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }
      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  // TODO  addMessage
  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [...prevMessages, { sender, data }]);

    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1);
    }
  };

  // connectToSocketServer
  const connectToSocketServer = () => {
    socketRef.current = io(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);

      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((prev) => prev.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections,
          );

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }),
              );
            }
          };

          connections[socketListId].ontrack = (event) => {
            const remoteStream = event.streams[0];

            setVideos((prevVideos) => {
              const videoExist = prevVideos.find(
                (v) => v.socketId === socketListId,
              );

              if (videoExist) {
                const updated = prevVideos.map((v) =>
                  v.socketId === socketListId
                    ? { ...v, stream: remoteStream }
                    : v,
                );
                videoRef.current = updated;
                return updated;
              } else {
                const newVideo = {
                  socketId: socketListId,
                  stream: remoteStream,
                  autoplay: true,
                  playsinline: true,
                };
                const updated = [...prevVideos, newVideo];
                videoRef.current = updated;
                return updated;
              }
            });
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          } else {
            // Black silence TODO
            const blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            window.localStream.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              window.localStream.getTracks().forEach((track) => {
                const isAlreadyAdded = connections[id2]
                  .getSenders()
                  .some((sender) => sender.track === track);
                if (!isAlreadyAdded) {
                  connections[id2].addTrack(track, window.localStream);
                }
              });
            } catch (err) {
              console.log(err);
            }

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  // getMedia
  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

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

  // getDisplayMediaSuccess
  const getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      window.localStream
        .getTracks()
        .forEach((track) =>
          connections[id].addTrack(track, window.localStream),
        );

      connections[id]
        .createOffer()
        .then((description) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({ sdp: connections[id].localDescription }),
              );
            })
            .catch((e) => console.log(e));
        })
        .catch((e) => console.log(e));
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          // BlackSilence
          const blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          getUserMedia();
        }),
    );
  };

  const stopScreenSharing = async () => {
    if (!screenAvailable) return;
    setScreen(false);

    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    getUserMedia();
  };

  // getDisplayMedia
  const getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia)
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .catch((e) => {
            console.log(e);
            setScreen(false);
          });
    } else {
      stopScreenSharing();
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  // handleScreen
  const handleScreen = () => {
    setScreen(!screen);
  };

  const handleChatModule = () => {
    setShowModel(!showModel);
    setNewMessages(0);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim().length > 0) {
      socketRef.current.emit("chat-message", message, username);
      setMessage("");
    }
  };

  const endCall = (e) => {
    e.preventDefault();
    window.localStream.getTracks().forEach((track) => track.stop());
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
    }
    navigate("/home");
  };

  return (
    <Box>
      {askForUsername ? (
        <Box>
          <Typography variant="h4">Enter your username</Typography>
          <form onSubmit={connect}>
            <TextField
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button type="submit">Join</Button>
          </form>
          <br />
          <video ref={localVideoRef} autoPlay muted playsInline />
        </Box>
      ) : (
        <div className="meetVideoContainer !min-h-screen">
          <video
            className="meetUserVideo"
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
          />

          {showModel && (
            <Box
              sx={{
                position: "absolute",
                height: "90vh",
                width: "22rem",
                top: 12,
                right: 12,
                background:
                  "linear-gradient(145deg, rgba(15,15,25,0.97) 0%, rgba(25,20,40,0.97) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1.5rem",
                display: "flex",
                flexDirection: "column",
                overflow: "auto",
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  px: "1.25rem",
                  py: "1rem",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#4ade80",
                    boxShadow: "0 0 8px #4ade80",
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Live Chat
                </Typography>
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  px: "1.25rem",
                  py: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                {messages.length > 0 ? (
                  messages.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        animation: "fadeUp 0.25s ease forwards",
                        "@keyframes fadeUp": {
                          from: { opacity: 0, transform: "translateY(8px)" },
                          to: { opacity: 1, transform: "translateY(0)" },
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#a78bfa",
                          mb: 0.4,
                        }}
                      >
                        {item.sender}
                      </Typography>
                      <Box
                        sx={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "0 0.75rem 0.75rem 0.75rem",
                          px: "0.875rem",
                          py: "0.6rem",
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "0.875rem",
                            color: "rgba(255,255,255,0.82)",
                            lineHeight: 1.5,
                          }}
                        >
                          {item.data}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      opacity: 0.4,
                      mt: 6,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "2rem",
                        lineHeight: 1,
                      }}
                    >
                      💬
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.85rem",
                        color: "rgba(255,255,255,0.6)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      No messages yet
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Input Area */}
              <Box
                sx={{
                  px: "1rem",
                  py: "1rem",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  flexShrink: 0,
                }}
              >
                <form
                  onSubmit={sendMessage}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Say something..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.875rem",
                        color: "rgba(255,255,255,0.85)",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "0.75rem",
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      minWidth: "unset",
                      width: "2.5rem",
                      height: "2.5rem",
                      p: 0,
                      borderRadius: "0.75rem",
                      background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                      boxShadow: "0 4px 14px rgba(124,58,237,0.5)",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                      "&:hover": {
                        background: "linear-gradient(135deg, #6d28d9, #7c3aed)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 20px rgba(124,58,237,0.6)",
                      },
                      "&:active": { transform: "scale(0.95)" },
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </form>
              </Box>
            </Box>
          )}

          <div className="buttonContainer">
            <IconButton onClick={handleVideo}>
              {video ? <VideocamOffIcon /> : <VideocamIcon />}
            </IconButton>
            <IconButton onClick={endCall}>
              <CallEndIcon className="callEnd" />
            </IconButton>
            <IconButton onClick={handleAudio}>
              {audio ? <MicOffIcon /> : <MicIcon />}
            </IconButton>
            <IconButton onClick={handleScreen}>
              {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
            </IconButton>
            <Badge badgeContent={newMessages} color="secondary">
              <IconButton onClick={handleChatModule}>
                {showModel ? <SpeakerNotesOffIcon /> : <ChatIcon />}
              </IconButton>
            </Badge>
          </div>

          <div className="conferenceView">
            {videos.map((video) => (
              <div className="" key={video.socketId}>
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Box>
  );
}
