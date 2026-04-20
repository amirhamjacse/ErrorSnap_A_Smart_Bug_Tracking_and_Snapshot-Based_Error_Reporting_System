import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";
import { __dirname } from "../utils/global.js";
import sourceMap from "source-map";
import Errorlog from "../classes/errorlog.js";
import Project from "../classes/project.js";
import Slack from "../classes/slack.js";
import { getCurrentDateTime } from "../utils/date.js";
import ProjectTeam from "../classes/projectTeam.js";
import AuditLog from "../auditLogs/auditLog.js";
import { normalizeEnvironment } from "../utils/environment.js";
import ProjectApiKey from "../apiKeys/projectApiKey.js";
import UsageMeter from "../billing/usageMeter.js";

async function resolveOriginalPosition({
  source,
  lineno,
  colno,
  projectId,
  userId,
}) {
  if (!source || !lineno || typeof colno === "undefined" || colno === null) {
    return {
      source,
      lineno,
      colno,
    };
  }

  const fileName = path.basename(source);
  const mapPath = path.join(
    __dirname,
    "..",
    "source-maps",
    String(userId),
    projectId,
    `${fileName}.map`
  );

  if (!fs.existsSync(mapPath)) {
    return {
      source,
      lineno,
      colno,
    };
  }

  const rawMap = fs.readFileSync(mapPath, "utf8");
  const consumer = await new sourceMap.SourceMapConsumer(rawMap);

  const originalPosition = consumer.originalPositionFor({
    line: lineno,
    column: colno,
  });

  consumer.destroy();

  return {
    source: originalPosition.source,
    lineno: originalPosition.line,
    colno: originalPosition.column,
  };
}

export const sendProjectError = async (req, res) => {
  const {
    message,
    projectId,
    apiKey,
    source,
    lineno,
    colno,
    stack,
    os,
    browser,
    image,
    type,
    environment,
  } = req.body;

  if (type === "unhandledrejection") {
    if (!projectId && !apiKey) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  } else if (!message || (!projectId && !apiKey) || !source || !stack) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // check if project exists
  let project = null;

  if (apiKey) {
    const apiKeyResult = await ProjectApiKey.consume(apiKey);
    if (!apiKeyResult.ok) {
      return res.status(apiKeyResult.status).json({ message: apiKeyResult.message });
    }

    project = await Project.getById(apiKeyResult.projectId);
  } else {
    project = await Project.getById(projectId);
  }

  if (!project) {
    return res.status(400).json({ message: "Project not exists!" });
  }

  const effectiveProjectId = project?.id || projectId;

  const errorId = nanoid(8);

  if (image) {
    Errorlog.uploadImage(image, errorId);
  }

  const currentDate = getCurrentDateTime();
  const result = await resolveOriginalPosition({
    source,
    lineno,
    colno,
    projectId: effectiveProjectId,
    userId: project?.user_id,
  });

  const values = {
    id: errorId,
    message: message || "",
    project_id: effectiveProjectId,
    source: result.source,
    lineno: result.lineno,
    colno: result.colno,
    os,
    browser,
    environment: normalizeEnvironment(environment),
    stack,
    status: 0,
    created_at: currentDate,
  };

  const duplicateError = await Errorlog.duplicateError(values);
  if (duplicateError) {
    await Errorlog.updateErrorTime(duplicateError?.id);
    await UsageMeter.incrementMetric(effectiveProjectId, "api_calls");
    await UsageMeter.incrementMetric(effectiveProjectId, "errors_logged");
    return res.status(201).json({ message: "Error updated successfully" });
  }

  try {
    const results = await Errorlog.insert(values);
    const responseId = results.insertId ? results.insertId : errorId;

    await Project.update(effectiveProjectId, {
      last_error_at: currentDate,
    });

    await UsageMeter.incrementMetric(effectiveProjectId, "api_calls");
    await UsageMeter.incrementMetric(effectiveProjectId, "errors_logged");

    res
      .status(201)
      .json({ message: "Error logged successfully", id: responseId });

    Slack.sendMessage(values, effectiveProjectId);
  } catch (error) {
    console.error("Error logging error:", error);
    res.status(500).json({ message: "Error logging error" });
  }
};

export const getProjectErrors = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const results = await Errorlog.selectByProjectId(projectId, req.query);
    res
      .status(200)
      .json({ message: "", data: results.rows, pagination: results.pagination });
  } catch (error) {
    console.error("Error getting error logs:", error);
    res.status(500).json({ message: "Error getting error logs" });
  }
};

const csvEscape = (value) => {
  const plainValue = value === null || typeof value === "undefined" ? "" : String(value);
  const escaped = plainValue.replace(/"/g, '""');
  return `"${escaped}"`;
};

const errorStatusLabel = {
  0: "Unresolved",
  1: "Pending",
  2: "Resolved",
};

export const exportProjectErrorsCsv = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const isProjectMember = await ProjectTeam.isProjectMember(projectId);
    if (!isProjectMember.length) {
      return res.status(404).json({ message: "Project not found!" });
    }

    const rows = await Errorlog.selectByProjectIdForExport(projectId, req.query);
    const header = [
      "id",
      "message",
      "project_id",
      "source",
      "lineno",
      "colno",
      "os",
      "environment",
      "browser",
      "status",
      "assignee_id",
      "created_at",
    ];

    const bodyRows = rows.map((row) =>
      [
        row.id,
        row.message,
        row.project_id,
        row.source,
        row.lineno,
        row.colno,
        row.os,
        row.environment,
        row.browser,
        errorStatusLabel[row.status] || "Unknown",
        row.assignee_id,
        row.created_at,
      ]
        .map(csvEscape)
        .join(",")
    );

    const csv = [header.map(csvEscape).join(","), ...bodyRows].join("\n");
    const fileName = `errors-${projectId}-${Date.now()}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting error logs:", error);
    return res.status(500).json({ message: "Error exporting error logs" });
  }
};

export const getError = async (req, res) => {
  const { errorId } = req.params;

  if (!errorId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const results = await Errorlog.selectById(errorId);

    const isProjectMember = await ProjectTeam.isProjectMember(
      results?.project_id
    );
    if (!isProjectMember.length) {
      return res.status(404).json({ message: "Error not found!" });
    }

    res.status(200).json({ message: "", data: results });
  } catch (error) {
    console.error("Error getting error logs:", error);
    res.status(500).json({ message: "Error getting error logs" });
  }
};

export const assignUserToError = async (req, res) => {
  const { userId, errorId } = req.body;

  if (!errorId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const errorLog = await Errorlog.selectById(errorId);
    await Errorlog.assignUser(userId, errorId);

    void AuditLog.record({
      projectId: errorLog?.project_id,
      actorId: req.errorsnapUser?.id,
      actorName: req.errorsnapUser?.username || "System",
      action: "error.assigned",
      entityType: "error",
      entityId: errorId,
      summary: `Error ${errorId} was assigned`,
      metadata: {
        assigneeId: userId,
      },
    }).catch((error) => console.error("Audit log insert failed:", error));

    res.status(201).json({ message: "Assign successfull" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error assigning user failed!" });
  }
};

export const resolveError = async (req, res) => {
  const { errorId } = req.body;

  if (!errorId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const errorLog = await Errorlog.selectById(errorId);
    await Errorlog.resolve(errorId);

    void AuditLog.record({
      projectId: errorLog?.project_id,
      actorId: req.errorsnapUser?.id,
      actorName: req.errorsnapUser?.username || "System",
      action: "error.resolved",
      entityType: "error",
      entityId: errorId,
      summary: `Error ${errorId} was resolved`,
      metadata: {},
    }).catch((error) => console.error("Audit log insert failed:", error));

    res.status(201).json({ message: "Error resolved successfull" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error resolving failed!" });
  }
};

export const getAssignedErrors = async (req, res) => {
  try {
    const results = await Errorlog.assigned({
      environment: req.query?.environment,
    });
    res.status(201).json({ message: "", data: results });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Fetching assigned errors failed!" });
  }
};
