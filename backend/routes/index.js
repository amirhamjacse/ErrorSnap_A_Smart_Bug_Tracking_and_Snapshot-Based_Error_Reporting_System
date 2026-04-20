import express from "express";
import {
  getInvitationData,
  getLoggedInUser,
  login,
  register,
} from "../controllers/auth.js";
import {
  sendProjectError,
  exportProjectErrorsCsv,
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
import { getProjectAuditLogs } from "../auditLogs/controller.js";
import {
  createProjectApiKey,
  getProjectApiKeys,
  revokeProjectApiKey,
} from "../apiKeys/controller.js";
import {
  createCheckoutSession,
  exportBillingUsageCsv,
  getBillingHistory,
  getBillingSummary,
  recordSessionStart,
} from "../billing/controller.js";
import {
  getErrorPatterns,
  getPatternDetails,
} from "../controllers/pattern.js";
import { getPublicProjectStatus } from "../controllers/publicStatus.js";
import { getErrorExplanation } from "../controllers/ai.js";
import { getFixSuggestions } from "../controllers/fix.js";
import {
  exportErrorsCsv,
  exportErrorsJson,
  getExportPreview,
} from "../controllers/export.js";

const router = express.Router();

// auth routes
router.post("/auth/login", login);
router.get("/auth/get-loggedIn-user", getLoggedInUser);
router.post("/auth/register", register);
router.get("/auth/invitation/:token", getInvitationData);

router.post("/error-logs", sendProjectError);
router.get("/error-logs/:projectId/export", exportProjectErrorsCsv);
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
router.get("/audit-logs/:projectId", getProjectAuditLogs);
router.get("/project-api-keys/:projectId", getProjectApiKeys);
router.post("/project-api-keys", createProjectApiKey);
router.post("/project-api-keys/:keyId/revoke", revokeProjectApiKey);
router.post("/usage/session-start", recordSessionStart);
router.get("/billing/summary/:projectId", getBillingSummary);
router.get("/billing/history/:projectId", getBillingHistory);
router.get("/billing/summary/:projectId/export", exportBillingUsageCsv);
router.post("/billing/checkout-session", createCheckoutSession);

// pattern detection
router.get("/patterns/:projectId", getErrorPatterns);
router.get("/patterns/:projectId/details", getPatternDetails);
router.get("/public/status/:projectId", getPublicProjectStatus);
router.post("/ai/error-explanation/:errorId", getErrorExplanation);
router.post("/fix/suggest/:errorId", getFixSuggestions);

// export
router.post("/export/:projectId/csv", exportErrorsCsv);
router.post("/export/:projectId/json", exportErrorsJson);
router.post("/export/:projectId/preview", getExportPreview);

//source maps
router.post("/upload", upload.array("source-maps"), uploadSourceMaps);
router.get("/sourcemap-history/:projectId", getAllHistory);

export default router;
