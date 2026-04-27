import { con } from "../database/connection.js";
import { getCurrentDateTime } from "../utils/date.js";
import User from "./user.js";
import { v2 as cloudinary } from "cloudinary";
import { normalizeEnvironment } from "../utils/environment.js";

export default class Errorlog {
  static table = "errorlogs";

  static formatAssignee(error) {
    if (!error) {
      return error;
    }

    const { assignee_id, assignee_username, assignee_email, ...rest } = error;

    const hasAssignee =
      assignee_id || assignee_username || assignee_email;

    return {
      ...rest,
      assignee: hasAssignee
        ? {
            id: assignee_id ?? null,
            username: assignee_username ?? null,
            email: assignee_email ?? null,
          }
        : null,
    };
  }

  static getFilterQuery(projectId, filters = {}, tableAlias = "") {
    const { query, status, environment } = filters;
    const prefix = tableAlias ? `${tableAlias}.` : "";
    let whereSql = `WHERE ${prefix}project_id = ?`;
    const whereParams = [projectId];

    if (query) {
      whereSql += ` AND (${prefix}message LIKE ? OR ${prefix}id = ?)`;
      whereParams.push(`%${query}%`, `${query}`);
    }

    if (typeof status !== "undefined" && status !== "") {
      const statusValue = String(status);

      if (statusValue === "open" || statusValue === "active") {
        whereSql += ` AND ${prefix}status IN (?, ?)`;
        whereParams.push(0, 1);
      } else {
        whereSql += ` AND ${prefix}status = ?`;
        whereParams.push(Number(status));
      }
    }

    if (environment) {
      whereSql += ` AND ${prefix}environment = ?`;
      whereParams.push(normalizeEnvironment(environment));
    }

    return {
      whereSql,
      whereParams,
    };
  }

  static insert(values) {
    const columns = Object.keys(values).join(", ");
    const placeholders = Object.keys(values)
      .map(() => "?")
      .join(", ");
    const sql = `INSERT INTO ${Errorlog.table} (${columns}) VALUES (${placeholders})`;
    const params = Object.values(values);

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

  static duplicateError(values) {
    const {
      message,
      project_id,
      source,
      lineno,
      colno,
      os,
      browser,
      status,
      environment,
    } =
      values;
    let sql = `SELECT * FROM ${Errorlog.table} WHERE source = ? AND lineno = ? AND colno = ? AND project_id = ? AND browser = ? AND message = ? AND status = ? AND os = ? AND environment = ?`;
    const params = [
      source,
      lineno,
      colno,
      project_id,
      browser,
      message,
      status,
      os,
      normalizeEnvironment(environment),
    ];

    return new Promise((resolve, reject) => {
      con.query(sql, params, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results[0]);
      });
    });
  }

  static updateErrorTime(id) {
    const currentDateTime = getCurrentDateTime();
    const sql = `UPDATE ${Errorlog.table} SET created_at = ? WHERE id = ?`;

    return new Promise((resolve, reject) => {
      con.query(sql, [currentDateTime, id], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results);
      });
    });
  }

  static uploadImage(imageData, errorId) {
    cloudinary.uploader
      .upload(imageData, {
        folder: "errorsnap",
      })
      .then((result) => {
        const sql = `UPDATE ${Errorlog.table} SET image= ? WHERE id = ?`;
        con.query(sql, [result?.secure_url, errorId], (err) => {
          if (err) {
            console.error("Error adding image:", err);
          }
        });
      });
  }

  static selectByProjectId(projectId, filters = {}) {
    const {
      orderBy = "DESC",
      query,
      status,
      environment,
      page = 1,
      limit = 10,
    } = filters;
    const { whereSql, whereParams } = Errorlog.getFilterQuery(projectId, {
      query,
      status,
      environment,
    }, "e");

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
    const offset = (pageNumber - 1) * pageSize;
    const sortOrder = String(orderBy).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const countSql = `SELECT COUNT(*) AS total FROM ${Errorlog.table} e ${whereSql}`;
    const sql = `SELECT e.*, u.username AS assignee_username, u.email AS assignee_email
      FROM ${Errorlog.table} e
      LEFT JOIN users u ON e.assignee_id = u.id
      ${whereSql}
      ORDER BY e.created_at ${sortOrder} LIMIT ? OFFSET ?`;
    const params = [...whereParams, pageSize, offset];

    return new Promise((resolve, reject) => {
      con.query(countSql, whereParams, (countErr, countResults) => {
        if (countErr) {
          console.error("Error executing query:", countErr);
          return reject(countErr);
        }

        const total = countResults?.[0]?.total || 0;

        con.query(sql, params, (err, results) => {
          if (err) {
            console.error("Error executing query:", err);
            return reject(err);
          }

          resolve({
            rows: results.map((error) => Errorlog.formatAssignee(error)),
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

  static selectByProjectIdForExport(projectId, filters = {}) {
    const { orderBy = "DESC", query, status, environment, page, limit } = filters;
    const { whereSql, whereParams } = Errorlog.getFilterQuery(projectId, {
      query,
      status,
      environment,
    }, "e");
    const sortOrder = String(orderBy).toUpperCase() === "ASC" ? "ASC" : "DESC";
    const hasPagination =
      typeof page !== "undefined" &&
      page !== "" &&
      typeof limit !== "undefined" &&
      limit !== "";
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
    const offset = (pageNumber - 1) * pageSize;
    const sql = hasPagination
      ? `SELECT e.*, u.username AS assignee_username, u.email AS assignee_email
        FROM ${Errorlog.table} e
        LEFT JOIN users u ON e.assignee_id = u.id
        ${whereSql}
        ORDER BY e.created_at ${sortOrder} LIMIT ? OFFSET ?`
      : `SELECT e.*, u.username AS assignee_username, u.email AS assignee_email
        FROM ${Errorlog.table} e
        LEFT JOIN users u ON e.assignee_id = u.id
        ${whereSql}
        ORDER BY e.created_at ${sortOrder}`;
    const params = hasPagination
      ? [...whereParams, pageSize, offset]
      : whereParams;

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

  static selectById(id) {
    const sql = `SELECT e.*, u.username AS assignee_username, u.email AS assignee_email
      FROM ${Errorlog.table} e
      LEFT JOIN users u ON e.assignee_id = u.id
      WHERE e.id = ?`;

    return new Promise((resolve, reject) => {
      con.query(sql, [id], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(Errorlog.formatAssignee(results[0]));
      });
    });
  }

  static assignUser(userId, errorId) {
    const sql = `UPDATE ${Errorlog.table} SET assignee_id= ?, status=${
      userId ? 1 : 0
    } WHERE id = ?`;

    return new Promise((resolve, reject) => {
      con.query(sql, [userId, errorId], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results);
      });
    });
  }

  static resolve(errorId) {
    const sql = `UPDATE ${Errorlog.table} SET status=2 WHERE id = ?`;

    return new Promise((resolve, reject) => {
      con.query(sql, [errorId], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results);
      });
    });
  }

  static assigned(filters = {}) {
    const userId = User.currentUser?.id;
    const whereSql = [`e.assignee_id = ?`, `e.status = 1`];
    const params = [userId];

    if (filters?.environment) {
      whereSql.push(`e.environment = ?`);
      params.push(normalizeEnvironment(filters.environment));
    }

    const sql = `SELECT e.*, u.username AS assignee_username, u.email AS assignee_email
      FROM ${Errorlog.table} e
      LEFT JOIN users u ON e.assignee_id = u.id
      WHERE ${whereSql.join(" AND ")}`;

    return new Promise((resolve, reject) => {
      con.query(sql, params, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results.map((error) => Errorlog.formatAssignee(error)));
      });
    });
  }

  static delete(projectId) {
    const checkSql = `DELETE FROM ${Errorlog.table} WHERE project_id = ?`;
    const checkParams = [projectId];

    return new Promise((resolve, reject) => {
      con.query(checkSql, checkParams, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results);
      });
    });
  }
}
