import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "node:http"; // is used to initialize the underlying web server that listens for network requests
import { connectToSocket } from "./controllers/socketManager.js";
import userRoute from "./routes/user.route.js";
import { User } from "./models/user.model.js";
import Meeting from "./models/meeting.model.js";

dotenv.config();
const app = express();

const server = createServer(app);
connectToSocket(server);

app.set("PORT", process.env.PORT || 5000);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Zoom API",
  });
});

app.use("/api/auth", userRoute);

User.hasMany(Meeting, { foreignKey: "user_id", as: "meetings"});
Meeting.belongsTo(User, { foreignKey: "user_id", as: "user"});

app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ message });
});

export { app, server };
