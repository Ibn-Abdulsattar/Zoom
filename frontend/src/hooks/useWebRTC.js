import React from "react";
import { peerConfigConnections, server_url } from "../constants/webrtcConfig";
import { blackSilence } from "../utils/streamUtils";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";


export default function useWebrtc(
  socketRef,
  socketIdRef,
  connections,
  setVideos,
  videoRef,
  localStreamRef,
  localVideoRef,
  gotMessageFromServer,
  addMessage,
) {

const navigate = useNavigate();

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

          if (
            localStreamRef.current !== undefined &&
            localStreamRef.current !== null
          ) {
            localStreamRef.current.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, localStreamRef.current);
            });
          } else {
            // Black silence TODO
            localStreamRef.current = blackSilence();
            localStreamRef.current.getTracks().forEach((track) => {
              connections[socketListId].addTrack(track, localStreamRef.current);
            });
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try {
              localStreamRef.current.getTracks().forEach((track) => {
                const isAlreadyAdded = connections[id2]
                  .getSenders()
                  .some((sender) => sender.track === track);
                if (!isAlreadyAdded) {
                  connections[id2].addTrack(track, localStreamRef.current);
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

  //   End Call
  const endCall = (e) => {
    e?.preventDefault();

    Object.keys(connections).forEach((k) => {
      connections[k].close();
      delete connections[k];
    });

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const activeStream =
      localStreamRef.current || localVideoRef.current?.srcObject;

    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    localStreamRef.current = null;

    setVideos([]);
    navigate("/home");
  };

  return { connectToSocketServer, endCall };
}
