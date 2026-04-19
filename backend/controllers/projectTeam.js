import Project from "../classes/project.js";
import ProjectTeam from "../classes/projectTeam.js";
import User from "../classes/user.js";
import MailService from "../classes/MailService.js";
import { randomBytes } from "crypto";
import ProjectInvitationLink from "../classes/projectInvitationLink.js";

function toMySqlDateTime(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
}

export const sendTeamInvitation = async (req, res) => {
  const currentUser = req.errorsnapUser;
  const { email, projectId } = req.body;
  const normalizedEmail = email?.trim()?.toLowerCase();

  if (!normalizedEmail || !projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // check if sending invite to own self
  if (normalizedEmail === currentUser?.email?.toLowerCase()) {
    return res
      .status(400)
      .json({ message: "Cannot send invitation to own self!" });
  }

  const project = await Project.getById(projectId);
  if (!project?.id) {
    return res.status(400).json({
      message: "No project found with this id!",
    });
  }

  const user = await User.getUserWithEmail(normalizedEmail);

  if (user?.id) {
    // check for duplicate team member
    const duplicate = await ProjectTeam.checkForDuplicateTeamMember(
      projectId,
      user?.id
    );
    if (duplicate) {
      return res
        .status(400)
        .json({ message: "Member is already in the team!" });
    }

    // send invitation mail
    await MailService.sendMail({
      subject: "Invitation to join the team :)",
      to: user?.email,
      text: `Hi, ${currentUser?.username} has sent you a team invitation for project ${project?.name}. Sign in to your ErrorSnap dashboard to accept the invitation.`,
      html: `Hi, <b>${currentUser?.username}</b> has sent you a team invitation for project <b>${project?.name}</b>. Sign in to your ErrorSnap dashboard to accept the invitation.`,
    });

    try {
      await ProjectTeam.insert({
        project_id: projectId,
        user_id: user?.id,
        invited_by: currentUser?.id,
        is_approved: 0,
      });

      return res.status(201).json({ message: "Invitation sent successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Invitation sending failed!" });
    }
  }

  const existingLink = await ProjectInvitationLink.getActiveByProjectAndEmail(
    projectId,
    normalizedEmail
  );
  if (existingLink?.id) {
    return res.status(400).json({
      message:
        "An active invitation link was already sent to this email. Please wait for it to expire.",
    });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = toMySqlDateTime(new Date(Date.now() + 10 * 60 * 1000));
  const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:3001";
  const registerLink = `${frontendUrl}/register?invitationToken=${token}&email=${encodeURIComponent(
    normalizedEmail
  )}`;

  try {
    await ProjectInvitationLink.insert({
      project_id: projectId,
      email: normalizedEmail,
      invited_by: currentUser?.id,
      token,
      expires_at: expiresAt,
      is_used: 0,
    });

    await MailService.sendMail({
      subject: "Complete registration to join the team",
      to: normalizedEmail,
      text: `Hi, ${currentUser?.username} invited you to join project ${project?.name} on ErrorSnap. Complete your registration with this link (valid for 10 minutes): ${registerLink}`,
      html: `Hi, <b>${currentUser?.username}</b> invited you to join project <b>${project?.name}</b> on ErrorSnap.<br/><br/>Complete your registration using this link (valid for <b>10 minutes</b>):<br/><a href="${registerLink}">${registerLink}</a>`,
    });

    return res.status(201).json({
      message:
        "Invitation link sent successfully. The recipient can register within 10 minutes.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Invitation sending failed!" });
  }
};

export const getAllInvitation = async (req, res) => {
  try {
    const results = await ProjectTeam.allInvitations();
    res.status(201).json({ message: "", data: results });
  } catch (error) {
    res.status(500).json({ message: "Invitations fetch failed!" });
  }
};

export const hasProjectInvitations = async (req, res) => {
  try {
    const results = await ProjectTeam.hasProjectInvitations();
    res.status(201).json({ message: "", data: results });
  } catch (error) {
    res.status(500).json({ message: "Invitations check failed!" });
  }
};

export const getTeamMembers = async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Team members not found!" });
  }

  try {
    const members = await ProjectTeam.members(projectId);
    res.status(201).json({ message: "", data: members });
  } catch (error) {
    res.status(500).json({ message: "Team members fetch failed!" });
  }
};

export const getPendingMembers = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Pending members not found!" });
  }

  try {
    const pendingMembers = await ProjectTeam.members(projectId, true);
    const pendingLinks = await ProjectInvitationLink.pendingForProject(
      projectId
    );

    const pendingTeamMembers = (pendingMembers || []).map((item) => ({
      ...item,
      id: `team-${item.id}`,
      source: "team",
    }));

    const pendingRegistrationLinks = (pendingLinks || []).map((item) => ({
      id: `link-${item.id}`,
      user_id: null,
      project_id: item.project_id,
      invited_by: item.invited_by,
      is_approved: 0,
      username: "Pending registration",
      email: item.email,
      source: "link",
    }));

    const combined = [...pendingTeamMembers, ...pendingRegistrationLinks];
    res.status(201).json({ message: "", data: combined });
  } catch (error) {
    res.status(500).json({ message: "Team pending members fetch failed!" });
  }
};

export const approvePendingMember = async (req, res) => {
  const { memberId } = req.params;

  if (!memberId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await ProjectTeam.approveMember(memberId);
    res.status(201).json({ message: "Member approved successfully", data: [] });
  } catch (error) {
    res.status(500).json({ message: "Member approving failed!" });
  }
};

export const cancelPendingInvitation = async (req, res) => {
  const { memberId } = req.params;

  if (!memberId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [type, rawId] = String(memberId).split("-");

    if (type === "link") {
      await ProjectInvitationLink.deleteById(rawId);
      return res.status(201).json({ message: "Invitation deleted", data: [] });
    }

    if (type === "team") {
      await ProjectTeam.deleteMember(rawId);
      return res.status(201).json({ message: "Invitation deleted", data: [] });
    }

    await ProjectTeam.deleteMember(memberId);
    res.status(201).json({ message: "Invitation deleted", data: [] });
  } catch (error) {
    res.status(500).json({ message: "Invitation deleting failed!" });
  }
};

export const removeTeamMember = async (req, res) => {
  const { memberId } = req.params;

  if (!memberId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await ProjectTeam.deleteMember(memberId);
    res.status(201).json({ message: "Member removed from team", data: [] });
  } catch (error) {
    res.status(500).json({ message: "Member removing failed!" });
  }
};
