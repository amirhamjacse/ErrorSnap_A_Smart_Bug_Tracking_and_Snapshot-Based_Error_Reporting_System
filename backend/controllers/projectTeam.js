import Project from "../classes/project.js";
import ProjectTeam from "../classes/projectTeam.js";
import User from "../classes/user.js";
import MailService from "../classes/MailService.js";

export const sendTeamInvitation = async (req, res) => {
  const currentUser = req.errorsnapUser;
  const { email, projectId } = req.body;

  if (!email || !projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // check if sending invite to own self
  if (email === currentUser?.email) {
    return res
      .status(400)
      .json({ message: "Cannot send invitation to own self!" });
  }

  const user = await User.getUserWithEmail(email);
  if (!user?.id) {
    return res.status(400).json({
      message: "No user found with this email!",
    });
  }

  const project = await Project.getById(projectId);
  if (!project?.id) {
    return res.status(400).json({
      message: "No project found with this id!",
    });
  }

  // check for duplicate team member
  const duplicate = await ProjectTeam.checkForDuplicateTeamMember(
    projectId,
    user?.id
  );
  if (duplicate) {
    return res.status(400).json({ message: "Member is already in the team!" });
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

    res.status(201).json({ message: "Invitation sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Invitation sending failed!" });
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
    res.status(201).json({ message: "", data: pendingMembers });
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
