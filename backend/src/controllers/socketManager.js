import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-call", (path) => {
      if (!connections[path]) {
        connections[path] = [];
      }

      connections[path].push(socket.id);

      timeOnline[socket.id] = new Date();

      connections[path].forEach((element) => {
        io.to(element).emit("user-joined", socket.id, connections[path]);
      });

      if (messages[path] !== undefined) {
        messages[path].forEach((msg) => {
          io.to(socket.id).emit(
            "chat-message",
            msg["data"],
            msg["sender"],
            msg["socket-id-sender"],
          );
        });
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
          }

          return [room, isFound];
        },
        ["", false],
      );

      if (found) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
          messages[matchingRoom].push({
            data: data,
            sender: sender,
            "socket-id-sender": socket.id,
          });
        }
      }

      connections[matchingRoom].forEach((element) => {
        io.to(element).emit("chat-message", data, sender, socket.id);
      });
    });

    socket.on("disconnect", () => {
      var diffTime = Math.abs(timeOnline[socket.id] - new Date());

      var key;

      for (const [k, v] of JSON.parse(
        JSON.stringify(Object.entries(connections)),
      )) {
        for (let a = 0; a < v.length; ++a) {
          if (v[a] === socket.id) {
            key = k;

            for (let a = 0; a < connections[key].length; ++a) {
              io.to(connections[key][a]).emit("user-left", socket.id, diffTime);
            }

            var index = connections[key].indexOf(socket.id);

            connections[key].splice(index, 1);

            if (connections[key].length === 0) {
              delete connections[key];
            }
          }
        }
      }
    });
  });

  return io;
};
