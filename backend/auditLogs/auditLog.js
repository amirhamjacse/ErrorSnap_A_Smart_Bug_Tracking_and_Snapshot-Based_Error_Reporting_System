import { nanoid } from "nanoid";
import { con } from "../database/connection.js";
import { getCurrentDateTime } from "../utils/date.js";

export default class AuditLog {
  static table = "audit_logs";

  static record(values) {
    const payload = {
      id: nanoid(12),
      project_id: values.projectId,
      actor_id: values.actorId ?? null,
      actor_name: values.actorName || "System",
      action: values.action,
      entity_type: values.entityType || "",
      entity_id: values.entityId || "",
      summary: values.summary || "",
      metadata: JSON.stringify(values.metadata || {}),
      created_at: values.createdAt || getCurrentDateTime(),
    };

    const columns = Object.keys(payload).join(", ");
    const placeholders = Object.keys(payload)
      .map(() => "?")
      .join(", ");
    const sql = `INSERT INTO ${AuditLog.table} (${columns}) VALUES (${placeholders})`;
    const params = Object.values(payload);

    return new Promise((resolve, reject) => {
      con.query(sql, params, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results);
      });
    });
  }

  static normalizeRow(row) {
    if (!row) {
      return row;
    }

    try {
      return {
        ...row,
        metadata: row.metadata ? JSON.parse(row.metadata) : {},
      };
    } catch (error) {
      return {
        ...row,
        metadata: row.metadata,
      };
    }
  }

  static selectByProjectId(projectId, filters = {}) {
    const { page = 1, limit = 25, orderBy = "DESC" } = filters;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 25, 1);
    const offset = (pageNumber - 1) * pageSize;
    const sortOrder = String(orderBy).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const countSql = `SELECT COUNT(*) AS total FROM ${AuditLog.table} WHERE project_id = ?`;
    const sql = `SELECT * FROM ${AuditLog.table} WHERE project_id = ? ORDER BY created_at ${sortOrder} LIMIT ? OFFSET ?`;

    return new Promise((resolve, reject) => {
      con.query(countSql, [projectId], (countErr, countResults) => {
        if (countErr) {
          console.error("Error executing query:", countErr);
          return reject(countErr);
        }

        const total = countResults?.[0]?.total || 0;

        con.query(sql, [projectId, pageSize, offset], (err, results) => {
          if (err) {
            console.error("Error executing query:", err);
            return reject(err);
          }

          resolve({
            rows: results.map((row) => AuditLog.normalizeRow(row)),
            pagination: {
              total,
              page: pageNumber,
              limit: pageSize,
              totalPages: Math.ceil(total / pageSize),
            },
          });
        });
      });
    });
  }
}