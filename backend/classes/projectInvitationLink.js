import { con } from "../database/connection.js";

export default class ProjectInvitationLink {
  static table = "project_invitation_links";

  static getById(id) {
    const sql = `SELECT * FROM ${ProjectInvitationLink.table} WHERE id = ? LIMIT 1`;
    const params = [id];

    return new Promise((resolve, reject) => {
      con.query(sql, params, (err, results) => {
        if (err) {
          return reject(err);
        }

        resolve(results[0] || null);
      });
    });
  }

  static insert(values) {
    const columns = Object.keys(values).join(", ");
    const placeholders = Object.keys(values)
      .map(() => "?")
      .join(", ");
    const sql = `INSERT INTO ${ProjectInvitationLink.table} (${columns}) VALUES (${placeholders})`;
    const params = Object.values(values);

    return new Promise((resolve, reject) => {
      con.query(sql, params, (err, results) => {
        if (err) {
          return reject(err);
        }

        resolve(results);
      });
    });
  }

  static getActiveByProjectAndEmail(projectId, email) {
    const sql = `SELECT * FROM ${ProjectInvitationLink.table} WHERE project_id = ? AND email = ? AND is_used = 0 AND expires_at > NOW() LIMIT 1`;
    const params = [projectId, email];

    return new Promise((resolve, reject) => {
      con.query(sql, params, (err, results) => {
        if (err) {
          return reject(err);
        }

        resolve(results[0] || null);
      });
    });
  }

  static getValidByToken(token) {
    const sql = `SELECT pil.*, p.name AS project_name, u.username AS invited_by_username
      FROM ${ProjectInvitationLink.table} pil
      JOIN project p ON pil.project_id = p.id
      LEFT JOIN users u ON pil.invited_by = u.id
      WHERE pil.token = ? AND pil.is_used = 0 AND pil.expires_at > NOW()
      LIMIT 1`;
    const params = [token];

    return new Promise((resolve, reject) => {
      con.query(sql, params, (err, results) => {
        if (err) {
          return reject(err);
        }

        resolve(results[0] || null);
      });
    });
  }

  static markUsed(id) {
    const sql = `UPDATE ${ProjectInvitationLink.table} SET is_used = 1 WHERE id = ?`;
    const params = [id];

    return new Promise((resolve, reject) => {
      con.query(sql, params, (err, results) => {
        if (err) {
          return reject(err);
        }

        resolve(results);
      });
    });
  }

  static pendingForProject(projectId) {
    const sql = `SELECT * FROM ${ProjectInvitationLink.table} WHERE project_id = ? AND is_used = 0 AND expires_at > NOW() ORDER BY created_at DESC`;
    const params = [projectId];

    return new Promise((resolve, reject) => {
      con.query(sql, params, (err, results) => {
        if (err) {
          return reject(err);
        }

        resolve(results || []);
      });
    });
  }

  static deleteById(id) {
    const sql = `DELETE FROM ${ProjectInvitationLink.table} WHERE id = ?`;
    const params = [id];

    return new Promise((resolve, reject) => {
      con.query(sql, params, (err, results) => {
        if (err) {
          return reject(err);
        }

        resolve(results);
      });
    });
  }
}
