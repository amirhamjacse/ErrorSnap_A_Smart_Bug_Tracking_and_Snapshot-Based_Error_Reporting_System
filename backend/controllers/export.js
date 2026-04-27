import Errorlog from "../classes/errorlog.js";
import Project from "../classes/project.js";
import ProjectTeam from "../classes/projectTeam.js";

/**
 * Format error data for CSV
 */
function formatCsvRow(error) {
  return [
    error.id,
    `"${error.message.replace(/"/g, '""')}"`,
    error.source || "N/A",
    error.lineno || "",
    error.colno || "",
    error.browser || "Unknown",
    error.os || "Unknown",
    error.environment || "production",
    getStatusLabel(error.status),
    new Date(error.created_at).toLocaleString(),
    error.assignee ? `Assigned` : "Unassigned",
  ].join(",");
}

/**
 * Convert error status number to label
 */
function getStatusLabel(status) {
  switch (status) {
    case 0:
      return "Unresolved";
    case 1:
      return "Pending";
    case 2:
      return "Resolved";
    default:
      return "Unknown";
  }
}

/**
 * Build CSV content with headers
 */
function generateCsv(errors) {
  const headers = [
    "ID",
    "Message",
    "Source",
    "Line",
    "Column",
    "Browser",
    "OS",
    "Environment",
    "Status",
    "Created At",
    "Assignment",
  ].join(",");

  const rows = errors.map(formatCsvRow);
  return [headers, ...rows].join("\n");
}

/**
 * Build JSON content
 */
function generateJson(errors) {
  const formatted = errors.map((error) => ({
    id: error.id,
    message: error.message,
    source: error.source,
    line: error.lineno,
    column: error.colno,
    browser: error.browser,
    os: error.os,
    environment: error.environment,
    status: getStatusLabel(error.status),
    createdAt: new Date(error.created_at).toISOString(),
    assignment: error.assignee ? "Assigned" : "Unassigned",
    stackTrace: error.stack,
  }));

  return JSON.stringify(formatted, null, 2);
}

/**
 * Apply filters to errors
 */
function applyFilters(errors, filters) {
  const safeFilters = filters || {};

  return errors.filter((error) => {
    // Date range filter
    if (safeFilters.startDate) {
      const errorDate = new Date(error.created_at);
      const startDate = new Date(safeFilters.startDate);
      if (errorDate < startDate) return false;
    }

    if (safeFilters.endDate) {
      const errorDate = new Date(error.created_at);
      const endDate = new Date(safeFilters.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (errorDate > endDate) return false;
    }

    // Status filter
    if (safeFilters.status !== undefined && safeFilters.status !== "") {
      if (error.status !== parseInt(safeFilters.status)) return false;
    }

    // Browser filter
    if (safeFilters.browser && error.browser) {
      if (
        !error.browser.toLowerCase().includes(safeFilters.browser.toLowerCase())
      )
        return false;
    }

    // OS filter
    if (safeFilters.os && error.os) {
      if (!error.os.toLowerCase().includes(safeFilters.os.toLowerCase()))
        return false;
    }

    // Environment filter
    if (safeFilters.environment && error.environment) {
      if (
        !error.environment
          .toLowerCase()
          .includes(safeFilters.environment.toLowerCase())
      )
        return false;
    }

    // Message/search filter
    if (safeFilters.search && error.message) {
      if (
        !error.message.toLowerCase().includes(safeFilters.search.toLowerCase())
      )
        return false;
    }

    return true;
  });
}

/**
 * Controller: Export errors as CSV
 */
export async function exportErrorsCsv(req, res) {
  try {
    const { projectId } = req.params;
    const userId = req.errorsnapUser?.id;
    const filters = req.body || {};

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify user has access to this project
    const teamMember = await ProjectTeam.selectByProjectIdUserId(
      projectId,
      userId,
    );
    if (!teamMember) {
      return res.status(403).json({ error: "Access denied to this project" });
    }

    // Fetch all errors for the project
    const errorsResult = await Errorlog.selectByProjectId(projectId);
    const errors = Array.isArray(errorsResult)
      ? errorsResult
      : errorsResult?.rows || [];

    // Apply filters
    const filteredErrors = applyFilters(errors, filters);

    // Generate CSV
    const csvContent = generateCsv(filteredErrors);

    // Set response headers for file download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="errors_${projectId}_${new Date().getTime()}.csv"`,
    );

    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("CSV export error:", error);
    return res.status(500).json({
      error: "Failed to export errors as CSV",
      details: error.message,
    });
  }
}

/**
 * Controller: Export errors as JSON
 */
export async function exportErrorsJson(req, res) {
  try {
    const { projectId } = req.params;
    const userId = req.errorsnapUser?.id;
    const filters = req.body || {};

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify user has access to this project
    const teamMember = await ProjectTeam.selectByProjectIdUserId(
      projectId,
      userId,
    );
    if (!teamMember) {
      return res.status(403).json({ error: "Access denied to this project" });
    }

    // Fetch all errors for the project
    const errorsResult = await Errorlog.selectByProjectId(projectId);
    const errors = Array.isArray(errorsResult)
      ? errorsResult
      : errorsResult?.rows || [];

    // Apply filters
    const filteredErrors = applyFilters(errors, filters);

    // Generate JSON
    const jsonContent = generateJson(filteredErrors);

    // Set response headers for file download
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="errors_${projectId}_${new Date().getTime()}.json"`,
    );

    return res.status(200).send(jsonContent);
  } catch (error) {
    console.error("JSON export error:", error);
    return res.status(500).json({
      error: "Failed to export errors as JSON",
      details: error.message,
    });
  }
}

/**
 * Controller: Get export preview (sample data)
 */
export async function getExportPreview(req, res) {
  try {
    const { projectId } = req.params;
    const userId = req.errorsnapUser?.id;
    const filters = req.body || {};

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify user has access to this project
    const teamMember = await ProjectTeam.selectByProjectIdUserId(
      projectId,
      userId,
    );
    if (!teamMember) {
      return res.status(403).json({ error: "Access denied to this project" });
    }

    // Fetch all errors for the project
    const errorsResult = await Errorlog.selectByProjectId(projectId);
    const errors = Array.isArray(errorsResult)
      ? errorsResult
      : errorsResult?.rows || [];

    // Apply filters
    const filteredErrors = applyFilters(errors, filters);

    return res.status(200).json({
      success: true,
      data: {
        totalErrors: errors.length,
        filteredErrors: filteredErrors.length,
        sample: filteredErrors.slice(0, 5).map((error) => ({
          id: error.id,
          message: error.message,
          browser: error.browser,
          status: getStatusLabel(error.status),
          createdAt: new Date(error.created_at).toLocaleString(),
        })),
      },
    });
  } catch (error) {
    console.error("Export preview error:", error);
    return res.status(500).json({
      error: "Failed to generate export preview",
      details: error.message,
    });
  }
}
