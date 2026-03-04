import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import crypto from "node:crypto";

class Otp extends Model {
  static async generateOTP(email) {
    const code = crypto.randomInt(100000, 999999).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    return await Otp.create({ email, code, expiresAt });
  }
}

(async () => {
  Otp.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
        validate: {
          is: {
            args: /^(?=.*[@])(?=.*[0-9])/,
            msg: "Must be a valid email address",
          },
        },
      },
      code: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Otp",
      tableName: "otps",
      timestamps: true,
    },
  );
})();

export default Otp;
