import React from 'react'
import { blackSilence } from '../utils/streamUtils';

export default function useDisplayMedia(localStreamRef, localVideoRef, connections, socketIdRef, socketRef, getUserMedia, setScreen, screenAvailable) {
      // getDisplayMediaSuccess
  const getDisplayMediaSuccess = (stream) => {
    try {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    localStreamRef.current = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      const senders = connections[id].getSenders();

      stream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track).catch((e) => console.log(e));
        } else {
          connections[id].addTrack(track, localStreamRef.current);
        }
      });

      const hasNewTrack = stream
        .getTracks()
        .some((track) => !senders.find((s) => s.track?.kind === track.kind));
      if (hasNewTrack) {
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
          localStreamRef.current = blackSilence();
          localVideoRef.current.srcObject = localStreamRef.current;

          getUserMedia();
        }),
    );
  };

  // getDisplayMedia
  const getDisplayMedia = () => {
    if (navigator.mediaDevices.getDisplayMedia)
      navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true })
        .then(getDisplayMediaSuccess)
        .catch((e) => {
          console.log(e);
          setScreen(false);
        });
  };

    const stopScreenSharing = async () => {
    if (!screenAvailable || !localStreamRef.current) return;
    setScreen(false);

    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.stop();
    });

    getUserMedia();
  };

  return {getDisplayMedia, stopScreenSharing};
}
