import User from "../classes/user.js";
import bcrypt from "bcrypt";
import Token from "../classes/Token.js";
import { getTokenFromReq } from "../utils/token.js";

export const login = async function (req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing required fields!" });
  }

  try {
    const userData = await User.getUserWithEmail(email);
    if (userData) {
      bcrypt.compare(password, userData?.password).then((result) => {
        if (!result) {
          res.status(401).json({ message: "Invalid email or password!" });
        } else {
          // create token
          const token = Token.create({ email: userData?.email });

          const { password, ...rest } = userData;
          res.json({
            message: "Login successful",
            data: {
              ...rest,
              token,
            },
          });
        }
      });
    } else {
      res.status(401).json({ message: "Invalid email or password!" });
    }
  } catch (error) {
    if (error) throw error;
  }
};

export const register = async function (req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const prevUser = await User.getUserWithEmail(email);
  if (prevUser) {
    return res.status(400).json({ message: "User is already registered!" });
  }

  const values = {
    username,
    email,
    password,
  };
  try {
    const newUser = await User.register(values);
    if (newUser) {
      res
        .status(201)
        .json({ message: "User registered successfully", data: newUser });
    }
  } catch (error) {
    res.status(500).json({ message: "User registration failed!" });
  }
};

export const getLoggedInUser = async (req, res) => {
  const token = getTokenFromReq(req);
  if (!token) {
    console.error("Token not found!");

    return res
      .status(401)
      .json({ success: false, message: "Unauthorized user!" });
  }

  const tokenVerified = await Token.verify(token);
  if (!tokenVerified) {
    console.error("Token verification error:", err);
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized user!" });
  }

  try {
    const { password, ...rest } = await User.getUserWithEmail(
      tokenVerified?.email
    );

    if (!rest) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    User.setCurrentUser(rest);
    res.json({
      message: "",
      data: rest,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user!",
    });
  }
};
