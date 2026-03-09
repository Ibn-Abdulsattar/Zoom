import Meeting from "../models/meeting.model.js";
import ExpressError from "../utils/expressError.js";
import { User } from "../models/user.model.js";


export const getUserHistory = async (req, res, next) => {
  const { user_id } = req.user;

  const {rows, count} = await Meeting.findAndCountAll({
    where: { user_id },
    include: [{ model: User, as: "user" }],
    limit: 12,
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).json({ total: count, meetings: rows });
};

export const addToHistory = async (req, res, next) => {
  const { user_id } = req.user;
  const { meetingCode } = req.body;

  if (!meetingCode) {
    return next(new ExpressError("Meetind code required", 400));
  }

  const user = await User.findByPk(user_id);

  const newMeeting = await Meeting.create({
    user_id: user.user_id,
    meeting_code: meetingCode,
  });

  return res
    .status(200)
    .json({ message: "Meeting created successfuly!", data: newMeeting });
};