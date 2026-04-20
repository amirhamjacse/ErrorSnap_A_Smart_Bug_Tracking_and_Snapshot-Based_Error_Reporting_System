import { con } from "../database/connection.js";

const METRIC_COLUMNS = {
  errors_logged: "errors_logged",
  sessions_recorded: "sessions_recorded",
  api_calls: "api_calls",
};

export default class UsageMeter {
  static monthlyTable = "usage_meter_monthly";

  static sessionsTable = "usage_sessions_monthly";

  static getPeriodKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  static ensureMonthlyRow(projectId, periodKey) {
    const sql = `INSERT IGNORE INTO ${UsageMeter.monthlyTable} (project_id, period_key, errors_logged, sessions_recorded, api_calls) VALUES (?, ?, 0, 0, 0)`;

    return new Promise((resolve, reject) => {
      con.query(sql, [projectId, periodKey], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results);
      });
    });
  }

  static async incrementMetric(projectId, metric, amount = 1, periodKey) {
    const metricColumn = METRIC_COLUMNS[metric];
    if (!metricColumn || !projectId) {
      return;
    }

    const effectivePeriodKey = periodKey || UsageMeter.getPeriodKey();
    await UsageMeter.ensureMonthlyRow(projectId, effectivePeriodKey);

    const sql = `UPDATE ${UsageMeter.monthlyTable} SET ${metricColumn} = ${metricColumn} + ?, updated_at = NOW() WHERE project_id = ? AND period_key = ?`;

    return new Promise((resolve, reject) => {
      con.query(sql, [amount, projectId, effectivePeriodKey], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results);
      });
    });
  }

  static async registerSession(projectId, sessionId, periodKey) {
    if (!projectId || !sessionId) {
      return false;
    }

    const effectivePeriodKey = periodKey || UsageMeter.getPeriodKey();
    const insertSql = `INSERT IGNORE INTO ${UsageMeter.sessionsTable} (project_id, period_key, session_id) VALUES (?, ?, ?)`;

    const insertResult = await new Promise((resolve, reject) => {
      con.query(
        insertSql,
        [projectId, effectivePeriodKey, String(sessionId)],
        (err, results) => {
          if (err) {
            console.error("Error executing query:", err);
            return reject(err);
          }

          resolve(results);
        }
      );
    });

    if (insertResult?.affectedRows) {
      await UsageMeter.incrementMetric(
        projectId,
        "sessions_recorded",
        1,
        effectivePeriodKey
      );
      return true;
    }

    return false;
  }

  static getSummary(projectId, periodKey) {
    const sql = `SELECT * FROM ${UsageMeter.monthlyTable} WHERE project_id = ? AND period_key = ? LIMIT 1`;

    return new Promise((resolve, reject) => {
      con.query(sql, [projectId, periodKey], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        const summary = results?.[0] || {
          project_id: projectId,
          period_key: periodKey,
          errors_logged: 0,
          sessions_recorded: 0,
          api_calls: 0,
        };

        resolve(summary);
      });
    });
  }

  static getHistory(projectId, periodKey, limit) {
    const hasPeriodKey = Boolean(periodKey);
    const hasLimit = Number.isFinite(Number(limit)) && Number(limit) > 0;
    let sql = hasPeriodKey
      ? `SELECT * FROM ${UsageMeter.monthlyTable} WHERE project_id = ? AND period_key = ? ORDER BY period_key DESC`
      : `SELECT * FROM ${UsageMeter.monthlyTable} WHERE project_id = ? ORDER BY period_key DESC`;

    if (hasLimit) {
      sql += ` LIMIT ${Math.trunc(Number(limit))}`;
    }

    const params = hasPeriodKey ? [projectId, periodKey] : [projectId];

    return new Promise((resolve, reject) => {
      con.query(sql, params, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results || []);
      });
    });
  }
}
