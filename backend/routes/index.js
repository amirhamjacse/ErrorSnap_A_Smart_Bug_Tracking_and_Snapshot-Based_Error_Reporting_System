import express from "express";
import { getLoggedInUser, login, register } from "../controllers/auth.js";
import {
  sendProjectError,
  getProjectErrors,
  getError,
  assignUserToError,
  resolveError,
  getAssignedErrors,
} from "../controllers/log.js";
import {
  addProject,
  getUserProjects,
  getProjectById,
  getUserProjectById,
  deleteProject,
} from "../controllers/project.js";
import {
  approvePendingMember,
  cancelPendingInvitation,
  getAllInvitation,
  getPendingMembers,
  getTeamMembers,
  hasProjectInvitations,
  removeTeamMember,
  sendTeamInvitation,
} from "../controllers/projectTeam.js";
import {
  addChannelId,
  getConnectedSlackDetails,
  slackConnectFinalize,
  slackConnectInit,
} from "../controllers/slack.js";
import { upload, uploadSourceMaps } from "../controllers/sourcemaps.js";
import { getAllHistory } from "../controllers/sourcemapHistory.js";

const router = express.Router();

// auth routes
router.post("/auth/login", login);
router.get("/auth/get-loggedIn-user", getLoggedInUser);
router.post("/auth/register", register);

router.post("/error-logs", sendProjectError);
router.post("/assign-error", assignUserToError);
router.post("/resolve-error", resolveError);
router.get("/error-logs/:projectId", getProjectErrors);
router.get("/errors/:errorId", getError);
router.get("/assigned-errors", getAssignedErrors);

router.post("/project", addProject);
router.post("/delete-project/:projectId", deleteProject);
router.get("/user-projects", getUserProjects);
router.get("/project/:projectId", getProjectById);
router.get("/user-project/:projectId", getUserProjectById);

// team members
router.post("/invite-member", sendTeamInvitation);
router.post("/approve-member/:memberId", approvePendingMember);
router.post("/cancel-invitation/:memberId", cancelPendingInvitation);
router.post("/remove-member/:memberId", removeTeamMember);
router.get("/pending-members/:projectId", getPendingMembers);
router.get("/all-invitation", getAllInvitation);
router.get("/team-members/:projectId", getTeamMembers);
router.get("/has-invitations", hasProjectInvitations);

router.get("/slack/oauth/start", slackConnectInit);
router.get("/slack/callback", slackConnectFinalize);
router.get("/slack/details/:projectId", getConnectedSlackDetails);
router.post("/slack/add-channel", addChannelId);

//source maps
router.post("/upload", upload.array("source-maps"), uploadSourceMaps);
router.get("/sourcemap-history/:projectId", getAllHistory);

export default router;
