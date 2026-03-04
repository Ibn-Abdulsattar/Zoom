import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import bcrypt from "bcrypt";

class User extends Model {
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
}

(async () => {
  User.init(
    {
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true,
        trim: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
        trim: true,
      },
      avatar_url: {
        type: DataTypes.STRING,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      googleId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      token_updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["email"],
          name: "user_email_unique",
        },
        {
          fields: ["reset_password_token"],
          name: "user_reset_token_idx",
        },
        {
          unique: true,
          fields: ["google_id"],
          name: "user_google_unique",
        },
      ],
      hooks: {
        
        beforeValidate: (user) => {
          if (user.email) {
            user.email = user.email.toLowerCase().trim();
          }
          if (user.username) {
            user.username = user.username.trim();
          }
          if (user.password) {
            user.password = user.password.trim();
          }
        },
        beforeSave: async (user) => {
          if (user.username === "") {
            user.username = null;
          }
          if (user.password && user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );
})();

export { User };
