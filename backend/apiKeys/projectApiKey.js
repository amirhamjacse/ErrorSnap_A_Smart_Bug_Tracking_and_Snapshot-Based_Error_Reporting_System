import { con } from "../database/connection.js";
import crypto from "crypto";

function hashApiKey(apiKey) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

function generateRawApiKey() {
  return `esk_${crypto.randomBytes(32).toString("hex")}`;
}

function startOfCurrentMinute(date = new Date()) {
  const nextDate = new Date(date);
  nextDate.setSeconds(0, 0);
  return nextDate;
}

export default class ProjectApiKey {
  static table = "project_api_keys";

  static generate() {
    const apiKey = generateRawApiKey();
    return {
      rawKey: apiKey,
      apiKeyHash: hashApiKey(apiKey),
      keySuffix: apiKey.slice(-6),
    };
  }

  static create(values) {
    const columns = Object.keys(values).join(", ");
    const placeholders = Object.keys(values)
      .map(() => "?")
      .join(", ");
    const sql = `INSERT INTO ${ProjectApiKey.table} (${columns}) VALUES (${placeholders})`;
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

  static getByProjectId(projectId) {
    const sql = `SELECT * FROM ${ProjectApiKey.table} WHERE project_id = ? ORDER BY created_at DESC`;

    return new Promise((resolve, reject) => {
      con.query(sql, [projectId], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results || []);
      });
    });
  }

  static getByHash(apiKeyHash) {
    const sql = `SELECT * FROM ${ProjectApiKey.table} WHERE api_key_hash = ? LIMIT 1`;

    return new Promise((resolve, reject) => {
      con.query(sql, [apiKeyHash], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results?.[0] || null);
      });
    });
  }

  static getById(id) {
    const sql = `SELECT * FROM ${ProjectApiKey.table} WHERE id = ? LIMIT 1`;

    return new Promise((resolve, reject) => {
      con.query(sql, [id], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results?.[0] || null);
      });
    });
  }

  static revoke(id) {
    const sql = `UPDATE ${ProjectApiKey.table} SET is_active = 0 WHERE id = ?`;

    return new Promise((resolve, reject) => {
      con.query(sql, [id], (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results);
      });
    });
  }

  static async consume(apiKey) {
    const apiKeyHash = hashApiKey(apiKey);
    const apiKeyRow = await ProjectApiKey.getByHash(apiKeyHash);

    if (!apiKeyRow?.id || !apiKeyRow?.is_active) {
      return { ok: false, status: 401, message: "Invalid API key" };
    }

    const limitPerMinute = Math.max(Number(apiKeyRow.rate_limit_per_minute) || 60, 1);
    const currentWindowStart = startOfCurrentMinute();
    const storedWindowStart = apiKeyRow.window_started_at
      ? startOfCurrentMinute(new Date(apiKeyRow.window_started_at))
      : null;
    const isNewWindow =
      !storedWindowStart || storedWindowStart.getTime() !== currentWindowStart.getTime();

    if (!isNewWindow && Number(apiKeyRow.requests_in_window || 0) >= limitPerMinute) {
      return {
        ok: false,
        status: 429,
        message: "Rate limit exceeded for this project API key",
        retryAfterSeconds: 60,
      };
    }

    const requestsInWindow = isNewWindow
      ? 1
      : Number(apiKeyRow.requests_in_window || 0) + 1;

    const sql = `UPDATE ${ProjectApiKey.table} SET window_started_at = ?, requests_in_window = ?, last_used_at = NOW() WHERE id = ?`;

    await new Promise((resolve, reject) => {
      con.query(
        sql,
        [currentWindowStart, requestsInWindow, apiKeyRow.id],
        (err, results) => {
          if (err) {
            console.error("Error executing query:", err);
            return reject(err);
          }

          resolve(results);
        }
      );
    });

    return {
      ok: true,
      projectId: apiKeyRow.project_id,
      apiKey: apiKeyRow,
    };
  }
}