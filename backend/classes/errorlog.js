import { con } from "../database/connection.js";
import { getCurrentDateTime } from "../utils/date.js";
import User from "./user.js";
import { v2 as cloudinary } from "cloudinary";

export default class Errorlog {
  static table = "errorlogs";

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
    const { message, project_id, source, lineno, colno, os, browser, status } =
      values;
    let sql = `SELECT * FROM ${Errorlog.table} WHERE source = ? AND lineno = ? AND colno = ? AND project_id = ? AND browser = ? AND message = ? AND status = ? AND os = ?`;
    const params = [
      source,
      lineno,
      colno,
      project_id,
      browser,
      message,
      status,
      os,
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
    const { orderBy = "DESC", query, status, page = 1, limit = 10 } = filters;
    let whereSql = `WHERE project_id = ?`;
    const whereParams = [projectId];

    if (query) {
      whereSql += ` AND (message LIKE ? OR id = ?)`;
      whereParams.push(`%${query}%`, `${query}`);
    }

    if (typeof status !== "undefined" && status !== "") {
      whereSql += ` AND status = ?`;
      whereParams.push(Number(status));
    }

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);
    const offset = (pageNumber - 1) * pageSize;
    const sortOrder = String(orderBy).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const countSql = `SELECT COUNT(*) AS total FROM ${Errorlog.table} ${whereSql}`;
    const sql = `SELECT * FROM ${Errorlog.table} ${whereSql} ORDER BY created_at ${sortOrder} LIMIT ? OFFSET ?`;
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
            rows: results,
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

  static selectById(id) {
    const sql = `SELECT * FROM ${Errorlog.table} WHERE id = ?`;

    return new Promise((resolve, reject) => {
      con.query(sql, [id], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results[0]);
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

  static assigned() {
    const userId = User.currentUser?.id;
    const sql = `SELECT * FROM ${Errorlog.table} WHERE assignee_id = ? AND status = 1`;

    return new Promise((resolve, reject) => {
      con.query(sql, [userId], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results);
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
