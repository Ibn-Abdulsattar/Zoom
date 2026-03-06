import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import {
  forgot,
  login,
  logout,
  register,
  resetPassword,
  verifyOtp,
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";
import { addToHistory, getUserHistory } from "../controllers/meeting.controller.js";
const router = Router();

router.route("/login").post(wrapAsync(login));
router.route("/register").post(wrapAsync(register));
router.route("/logout").post(auth("user"), wrapAsync(logout));
router.route("/forgot").post(wrapAsync(forgot));
router.route("/reset-password").post(wrapAsync(resetPassword));
router.post("/verify-otp", wrapAsync(verifyOtp));
router.route("/add_to_activity").post( auth("user"), wrapAsync(addToHistory)) ;
router.route("/get_all_activity").get(auth("user"), wrapAsync(getUserHistory));

export default router;
