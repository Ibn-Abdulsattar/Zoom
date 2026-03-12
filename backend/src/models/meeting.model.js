import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

class Meeting extends Model {}

(async () =>
  Meeting.init(
    {
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: "users",
          key: "user_id",
        },
        allowNull: false,
      },
      meeting_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Meeting",
      tableName: "meetings",
      underscored: true,
    },
  ))();

export default Meeting;
