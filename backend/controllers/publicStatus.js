import { con } from "../database/connection.js";
import Project from "../classes/project.js";
import { normalizeEnvironment } from "../utils/environment.js";

function getServiceStatus(summary) {
  const unresolved = summary.unresolved || 0;
  const recent24h = summary.errors_last_24h || 0;

  if (unresolved >= 10) {
    return {
      level: "outage",
      label: "Major Outage",
      message: "Critical issues are affecting service reliability.",
    };
  }

  if (unresolved > 0 || recent24h >= 25) {
    return {
      level: "degraded",
      label: "Degraded Performance",
      message: "Some issues are being investigated.",
    };
  }

  return {
    level: "operational",
    label: "All Systems Operational",
    message: "No active incidents detected.",
  };
}

function toNumber(value) {
  return Number(value || 0);
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (error, results) => {
      if (error) {
        return reject(error);
      }

      resolve(results);
    });
  });
}

export const getPublicProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const environment = normalizeEnvironment(req.query.environment);

    if (!projectId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const project = await Project.getById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const summarySql = `
      SELECT
        COUNT(*) AS total_errors,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS unresolved,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) AS errors_last_24h,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS errors_last_7d
      FROM errorlogs
      WHERE project_id = ? AND environment = ?
    `;

    const incidentsSql = `
      SELECT id, message, status, environment, browser, os, created_at
      FROM errorlogs
      WHERE project_id = ? AND environment = ? AND status IN (0, 1)
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const summaryRows = await runQuery(summarySql, [projectId, environment]);
    const incidentRows = await runQuery(incidentsSql, [projectId, environment]);

    const row = summaryRows?.[0] || {};
    const summary = {
      total_errors: toNumber(row.total_errors),
      unresolved: toNumber(row.unresolved),
      pending: toNumber(row.pending),
      resolved: toNumber(row.resolved),
      errors_last_24h: toNumber(row.errors_last_24h),
      errors_last_7d: toNumber(row.errors_last_7d),
    };

    const status = getServiceStatus(summary);

    return res.status(200).json({
      message: "",
      project: {
        id: project.id,
        name: project.name,
      },
      environment,
      generated_at: new Date().toISOString(),
      status,
      summary,
      incidents: incidentRows || [],
    });
  } catch (error) {
    console.error("Error fetching public project status:", error);
    return res.status(500).json({ message: "Failed to fetch project status" });
  }
};
