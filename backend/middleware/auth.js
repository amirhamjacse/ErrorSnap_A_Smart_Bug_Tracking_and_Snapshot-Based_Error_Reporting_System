import Token from "../classes/Token.js";
import User from "../classes/user.js";
import { getTokenFromReq } from "../utils/token.js";

const authMiddleware = async (req, res, next) => {
  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/error-logs",
    "/slack/callback",
    "/auth/get-loggedIn-user",
    "/upload",
  ];

  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const token = getTokenFromReq(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized user!" });
  }

  const tokenVerified = await Token.verify(token);
  if (!tokenVerified) {
    console.error("Token verification error:", err);
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized user!" });
  }

  const userResult = await User.getUserWithEmail(tokenVerified?.email);
  User.setCurrentUser(userResult);
  req.errorsnapUser = userResult || null;
  next();
  return;
};

export default authMiddleware;
