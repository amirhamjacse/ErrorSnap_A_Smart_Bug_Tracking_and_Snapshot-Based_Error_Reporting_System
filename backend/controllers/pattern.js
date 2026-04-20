import Errorlog from "../classes/errorlog.js";
import Project from "../classes/project.js";
import ProjectTeam from "../classes/projectTeam.js";

/**
 * Extract pattern from error message
 * Groups similar errors by removing dynamic parts
 */
function extractErrorPattern(message) {
  // Remove IDs, numbers, and timestamps
  let pattern = message
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "[UUID]")
    .replace(/\b\d+\b/g, "[NUM]")
    .replace(/\b\d{1,2}:\d{2}:\d{2}\b/g, "[TIME]")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, "[DATE]");

  return pattern;
}

export const getErrorPatterns = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { environment = "production", days = 30 } = req.query;
    const daysWindow = Math.max(parseInt(days, 10) || 30, 1);

    // Verify project exists
    const project = await Project.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Verify user has access
    const userId = req.userId;
    const team = await ProjectTeam.selectByProjectIdUserId(projectId, userId);
    if (!team) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get all errors for the project
    const result = await Errorlog.selectByProjectId(projectId, {
      limit: 10000,
      environment,
    });
    const errors = result?.rows || [];

    if (!errors || errors.length === 0) {
      return res.json({
        patterns: [],
        total_errors: 0,
        total_patterns: 0,
      });
    }

    // Filter by days if specified
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysWindow);

    const recentErrors = errors.filter((error) => {
      const errorDate = new Date(error.created_at);
      return errorDate >= cutoffDate;
    });

    // Group errors by pattern
    const patternMap = new Map();

    recentErrors.forEach((error) => {
      const pattern = extractErrorPattern(error.message);

      if (!patternMap.has(pattern)) {
        patternMap.set(pattern, {
          pattern,
          original_message: error.message, // Store one original message as example
          count: 0,
          errors: [],
          browsers: new Set(),
          os_list: new Set(),
          environments: new Set(),
          first_seen: error.created_at,
          last_seen: error.created_at,
          statuses: { 0: 0, 1: 0, 2: 0 }, // unresolved, pending, resolved
        });
      }

      const patternData = patternMap.get(pattern);
      patternData.count++;
      patternData.errors.push({
        id: error.id,
        message: error.message,
        created_at: error.created_at,
        status: error.status,
      });
      patternData.browsers.add(error.browser);
      patternData.os_list.add(error.os);
      patternData.environments.add(error.environment);
      patternData.statuses[error.status]++;

      // Update first and last seen
      const errorDate = new Date(error.created_at);
      if (errorDate < new Date(patternData.first_seen)) {
        patternData.first_seen = error.created_at;
      }
      if (errorDate > new Date(patternData.last_seen)) {
        patternData.last_seen = error.created_at;
      }
    });

    // Convert to array and sort by frequency
    const patterns = Array.from(patternMap.values())
      .map((p) => ({
        pattern: p.pattern,
        example_message: p.original_message,
        occurrence_count: p.count,
        percentage: ((p.count / recentErrors.length) * 100).toFixed(1),
        affected_browsers: Array.from(p.browsers),
        affected_os: Array.from(p.os_list),
        affected_environments: Array.from(p.environments),
        resolution_status: {
          unresolved: p.statuses[0],
          pending: p.statuses[1],
          resolved: p.statuses[2],
        },
        first_occurrence: p.first_seen,
        last_occurrence: p.last_seen,
        error_samples: p.errors.slice(0, 5), // Top 5 error examples
      }))
      .sort((a, b) => b.occurrence_count - a.occurrence_count);

    res.json({
      patterns,
      total_errors: recentErrors.length,
      total_patterns: patterns.length,
      period_days: String(daysWindow),
      environment,
    });
  } catch (error) {
    console.error("Error fetching patterns:", error);
    res.status(500).json({ error: "Failed to fetch error patterns" });
  }
};

export const getPatternDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { pattern: patternQuery, environment = "production" } = req.query;

    // Verify project exists
    const project = await Project.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Verify user has access
    const userId = req.userId;
    const team = await ProjectTeam.selectByProjectIdUserId(projectId, userId);
    if (!team) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get all errors for the project
    const result = await Errorlog.selectByProjectId(projectId, {
      limit: 10000,
      environment,
    });
    const errors = result?.rows || [];

    if (!errors || errors.length === 0) {
      return res.status(404).json({ error: "No errors found" });
    }

    // Find all errors matching this pattern
    const patternErrors = errors.filter((error) => {
      const errorPattern = extractErrorPattern(error.message);
      return errorPattern === patternQuery;
    });

    if (patternErrors.length === 0) {
      return res.status(404).json({ error: "Pattern not found" });
    }

    // Group by date for trend
    const trendMap = new Map();
    patternErrors.forEach((error) => {
      const date = new Date(error.created_at).toLocaleDateString("en-US");
      trendMap.set(date, (trendMap.get(date) || 0) + 1);
    });

    const trend = Array.from(trendMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      pattern: patternQuery,
      total_occurrences: patternErrors.length,
      errors: patternErrors,
      trend,
      top_browsers: Object.entries(
        patternErrors.reduce((acc, e) => {
          acc[e.browser] = (acc[e.browser] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count),
      top_os: Object.entries(
        patternErrors.reduce((acc, e) => {
          acc[e.os] = (acc[e.os] || 0) + 1;
          return acc;
        }, {})
      )
        .map(([os, count]) => ({ os, count }))
        .sort((a, b) => b.count - a.count),
    });
  } catch (error) {
    console.error("Error fetching pattern details:", error);
    res.status(500).json({ error: "Failed to fetch pattern details" });
  }
};
