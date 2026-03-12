export const server_url = import.meta.env.VITE_Backend_URL;

export const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};