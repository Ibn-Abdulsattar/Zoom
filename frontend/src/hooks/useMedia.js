import { useCallback, useState } from "react";
import {
  audioPermission,
  screenPermission,
  videoPermission,
} from "../utils/mediaUtils";
import { blackSilence } from "../utils/streamUtils";

export default function useMedia(
  connections,
  socketIdRef,
  socketRef,
  connectToSocketServer,
  isJoined,
  isGetMediaCalled,
  localStreamRef,
  localVideoRef
) {
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [video, setVideo] = useState(false);
  const [audio, setAudio] = useState(false);


  // getPermissions
  const getPermissions = async () => {
    try {
      let hasVideo = await videoPermission();
      let hasAudio = await audioPermission();
      let hasScreen = await screenPermission();

      setAudioAvailable(hasAudio);
      setVideoAvailable(hasVideo);
      setScreenAvailable(hasScreen);

      if (hasVideo || hasAudio) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: hasVideo,
          audio: hasAudio,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          localVideoRef.current.srcObject = userMediaStream;
          localStreamRef.current = userMediaStream;
          setVideo(hasVideo);
          setAudio(hasAudio);
        }
      }
    } catch (err) {
      console.log(err);
      setVideoAvailable(false);
      setAudioAvailable(false);
    }
  };

  // getUserMediaSuccess
  const getUserMediaSuccess = useCallback((stream) => {
    try {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    localStreamRef.current = stream;
    localVideoRef.current.srcObject = stream;
    window.localStream = stream;

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

      if (!hasNewTrack) {
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
          localStreamRef.current = blackSilence();
          localVideoRef.current.srcObject = localStreamRef.current;

          for (let id in connections) {
            localStreamRef.current.getTracks().forEach((track) => {
              const sender = connections[id]
                .getSenders()
                .find((s) => s.track?.kind === track.kind);
              if (sender) {
                sender.replaceTrack(track).catch((e) => console.log(e));
              } else {
                connections[id].addTrack(track, localStreamRef.current);
              }
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
  },[]);

  // getUserMedia
  const getUserMedia = useCallback(() => {
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

      localStreamRef.current = blackSilence();
      localVideoRef.current.srcObject = localStreamRef.current;

      for (let id in connections) {
        localStreamRef.current.getTracks().forEach((track) => {
          const sender = connections[id]
            .getSenders()
            .find((s) => s.track?.kind === track.kind);
          if (sender) sender.replaceTrack(track).catch((e) => console.log(e));
          else connections[id].addTrack(track, localStreamRef.current);
        });
      }
    }
  }, [video, audio, videoAvailable, audioAvailable, getUserMediaSuccess]);

  // getMedia
  const getMedia = async () => {
    try {
      // eslint-disable-next-line react-hooks/immutability
      isJoined.current = true;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoAvailable,
        audio: audioAvailable,
      });

      // eslint-disable-next-line react-hooks/immutability
      isGetMediaCalled.current = true;
      setVideo(videoAvailable);
      setAudio(audioAvailable);
      getUserMediaSuccess(stream);
      connectToSocketServer();
    } catch (e) {
      console.log(e);
    }
  };

  return {
    getPermissions,
    screenAvailable,
    video,
    setVideo,
    audio,
    setAudio,
    getUserMedia,
    getMedia,
  };
}
