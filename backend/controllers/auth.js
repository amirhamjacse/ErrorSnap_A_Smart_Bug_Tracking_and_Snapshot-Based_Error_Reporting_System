import User from "../classes/user.js";
import bcrypt from "bcrypt";
import Token from "../classes/Token.js";
import { getTokenFromReq } from "../utils/token.js";
import ProjectInvitationLink from "../classes/projectInvitationLink.js";
import ProjectTeam from "../classes/projectTeam.js";

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
  const { username, email, password, invitationToken } = req.body;
  const normalizedEmail = email?.trim()?.toLowerCase();

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  let invitation = null;
  if (invitationToken) {
    invitation = await ProjectInvitationLink.getValidByToken(invitationToken);
    if (!invitation?.id) {
      return res
        .status(400)
        .json({ message: "Invitation link is invalid or expired." });
    }

    if (invitation.email?.toLowerCase() !== normalizedEmail) {
      return res.status(400).json({
        message: "The invitation email does not match this registration email.",
      });
    }
  }

  const prevUser = await User.getUserWithEmail(normalizedEmail);
  if (prevUser) {
    return res.status(400).json({ message: "User is already registered!" });
  }

  const values = {
    username,
    email: normalizedEmail,
    password,
  };
  try {
    const newUser = await User.register(values);

    if (invitation?.id) {
      const duplicate = await ProjectTeam.checkForDuplicateTeamMember(
        invitation.project_id,
        newUser.id
      );

      if (!duplicate) {
        await ProjectTeam.insert({
          project_id: invitation.project_id,
          user_id: newUser.id,
          invited_by: invitation.invited_by,
          is_approved: 0,
        });
      }

      await ProjectInvitationLink.markUsed(invitation.id);
    }

    if (newUser) {
      res
        .status(201)
        .json({ message: "User registered successfully", data: newUser });
    }
  } catch (error) {
    res.status(500).json({ message: "User registration failed!" });
  }
};

export const getInvitationData = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ message: "Missing invitation token" });
  }

  try {
    const invitation = await ProjectInvitationLink.getValidByToken(token);
    if (!invitation?.id) {
      return res
        .status(400)
        .json({ message: "Invitation link is invalid or expired." });
    }

    return res.status(200).json({
      message: "",
      data: {
        email: invitation.email,
        projectId: invitation.project_id,
        projectName: invitation.project_name,
        invitedByUsername: invitation.invited_by_username,
        expiresAt: invitation.expires_at,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load invitation." });
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
    console.error("Token verification error:", tokenVerified);
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
