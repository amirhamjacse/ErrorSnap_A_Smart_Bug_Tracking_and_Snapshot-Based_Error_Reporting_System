import Project from "../classes/project.js";
import ProjectTeam from "../classes/projectTeam.js";
import ProjectApiKey from "./projectApiKey.js";
import AuditLog from "../auditLogs/auditLog.js";

function maskApiKey(apiKey) {
  if (!apiKey) {
    return "";
  }

  const suffix = String(apiKey).slice(-6);
  return `esk_••••••${suffix}`;
}

export const getProjectApiKeys = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Project not found!" });
  }

  try {
    const results = await ProjectApiKey.getByProjectId(projectId);
    res.status(200).json({
      message: "",
      data: results.map((item) => ({
        id: item.id,
        project_id: item.project_id,
        label: item.label,
        key_suffix: item.key_suffix,
        masked_key: maskApiKey(item.key_suffix),
        rate_limit_per_minute: item.rate_limit_per_minute,
        is_active: item.is_active,
        requests_in_window: item.requests_in_window,
        window_started_at: item.window_started_at,
        last_used_at: item.last_used_at,
        created_at: item.created_at,
      })),
    });
  } catch (error) {
    console.error("Error getting api keys:", error);
    res.status(500).json({ message: "Error getting api keys" });
  }
};

export const createProjectApiKey = async (req, res) => {
  const { projectId, label = "Default key", rateLimitPerMinute = 60 } = req.body;

  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const project = await Project.getById(projectId);
  if (!project?.id) {
    return res.status(404).json({ message: "Project not found!" });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Project not found!" });
  }

  try {
    const { rawKey, apiKeyHash, keySuffix } = ProjectApiKey.generate();

    const insertResult = await ProjectApiKey.create({
      project_id: projectId,
      label,
      api_key_hash: apiKeyHash,
      key_suffix: keySuffix,
      rate_limit_per_minute: Math.max(Number(rateLimitPerMinute) || 60, 1),
      is_active: 1,
      requests_in_window: 0,
      window_started_at: null,
      created_at: new Date(),
    });

    void AuditLog.record({
      projectId,
      actorId: req.errorsnapUser?.id,
      actorName: req.errorsnapUser?.username || "System",
      action: "api_key.created",
      entityType: "project_api_key",
      entityId: String(insertResult?.insertId || keySuffix),
      summary: `API key ${label} was created`,
      metadata: {
        label,
        rateLimitPerMinute: Math.max(Number(rateLimitPerMinute) || 60, 1),
        keySuffix,
      },
    }).catch((error) => console.error("Audit log insert failed:", error));

    return res.status(201).json({
      message: "API key created successfully",
      data: {
        id: insertResult?.insertId,
        project_id: projectId,
        label,
        api_key: rawKey,
        key_suffix: keySuffix,
        masked_key: maskApiKey(keySuffix),
        rate_limit_per_minute: Math.max(Number(rateLimitPerMinute) || 60, 1),
        is_active: 1,
      },
    });
  } catch (error) {
    console.error("Error creating api key:", error);
    res.status(500).json({ message: "Error creating api key" });
  }
};

export const revokeProjectApiKey = async (req, res) => {
  const { keyId } = req.params;

  if (!keyId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const apiKey = await ProjectApiKey.getById(keyId);
    await ProjectApiKey.revoke(keyId);

    void AuditLog.record({
      projectId: apiKey?.project_id,
      actorId: req.errorsnapUser?.id,
      actorName: req.errorsnapUser?.username || "System",
      action: "api_key.revoked",
      entityType: "project_api_key",
      entityId: String(keyId),
      summary: `API key ${apiKey?.label || keyId} was revoked`,
      metadata: {
        label: apiKey?.label,
        keySuffix: apiKey?.key_suffix,
      },
    }).catch((error) => console.error("Audit log insert failed:", error));

    res.status(200).json({ message: "API key revoked successfully" });
  } catch (error) {
    console.error("Error revoking api key:", error);
    res.status(500).json({ message: "Error revoking api key" });
  }
};
