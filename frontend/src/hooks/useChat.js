import React, { useRef, useState } from "react";

export default function useChat(
  connections,
  socketIdRef,
  socketRef,
  showModelRef,
  showModel,
  setShowModel,
  message,
  setMessage,
username,
) {
  const pendingCandidates = useRef({});
  const [messages, setMessages] = useState([]);
  const [newMessages, setNewMessages] = useState(0);

  // gotMessageFromServer
  const gotMessageFromServer = (fromId, message) => {
    let signal = typeof message === "string" ? JSON.parse(message) : message;

    if (fromId !== socketIdRef.current) {
      if (!connections[fromId]) return;
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            const queued = pendingCandidates.current[fromId] || [];
            queued.forEach((candidate) => {
              connections[fromId]
                .addIceCandidate(new RTCIceCandidate(candidate))
                .catch((e) => console.log(e));
            });
            delete pendingCandidates.current[fromId];

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
        if (!connections[fromId].remoteDescription) {
          if (!pendingCandidates.current[fromId]) {
            pendingCandidates.current[fromId] = [];
          }
          pendingCandidates.current[fromId].push(signal.ice);
        } else {
          connections[fromId]
            .addIceCandidate(new RTCIceCandidate(signal.ice))
            .catch((e) => console.log(e));
        }
      }
    }
  };

  //  addMessage
  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [...prevMessages, { sender, data }]);

    if (socketIdSender !== socketIdRef.current) {
      if (showModelRef.current) {
        setNewMessages(0);
      } else {
        setNewMessages((prevMessages) => prevMessages + 1);
      }
    }
  };

    const handleChatModule = () => {
    const next = !showModel;
    setShowModel(next);
    showModelRef.current = next;
    setNewMessages(0);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim().length > 0) {
      socketRef.current.emit("chat-message", message, username);
      setMessage("");
    }
  };

  return {
    gotMessageFromServer,
    addMessage,
    messages,
    newMessages,
    handleChatModule,
    sendMessage
  };
}
