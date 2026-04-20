import AuditLog from "./auditLog.js";
import ProjectTeam from "../classes/projectTeam.js";

export const getProjectAuditLogs = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Audit logs not found!" });
  }

  try {
    const results = await AuditLog.selectByProjectId(projectId, req.query);
    res
      .status(200)
      .json({ message: "", data: results.rows, pagination: results.pagination });
  } catch (error) {
    console.error("Error getting audit logs:", error);
    res.status(500).json({ message: "Error getting audit logs" });
  }
};