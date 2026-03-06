import jwt from "jsonwebtoken";
import ExpressError from "../utils/expressError.js";

const auth =
  (role = "user") =>
  (req, res, next) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    let token =
      role === "user" ? req.cookies?.userToken : req.cookies?.adminToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1]; // .split used to break string into smaller pieces of array based on seprator
      }
    }

    if (!token) {
      return next(
        new ExpressError(
          "Authentication failed: No token provided",
          401
        )
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = decoded.payload;

      // RBAC Check
      if (role === "admin" && user.role !== "admin") {
        return next(
          new ExpressError("Admin access only", 403)
        );
      }

      req.user = user;
      next();
    } catch (error) {
      const message =
        error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
      return next(new ExpressError(message, 401));
    }
  };

export default auth;
