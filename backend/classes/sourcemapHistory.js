import { con } from "../database/connection.js";

class SourcemapHistory {
  static table = "sourcemap_history";

  static getByProjectId(projectId) {
    const query = `SELECT * FROM ${this.table} WHERE project_id = ? ORDER BY uploaded_at DESC`;
    return new Promise((resolve, reject) => {
      con.query(query, [projectId], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  static create(values) {
    const columns = Object.keys(values).join(", ");
    const placeholders = Object.keys(values)
      .map(() => "?")
      .join(", ");
    const params = Object.values(values);

    const query = `INSERT INTO ${this.table} (${columns}) VALUES (${placeholders})`;

    return new Promise((resolve, reject) => {
      con.query(query, params, (error, results) => {
        if (error) return reject(error);
        resolve({
          id: results.insertId,
          ...values,
        });
      });
    });
  }

  static getById(id) {
    const query = `SELECT * FROM ${this.table} WHERE id = ?`;
    return new Promise((resolve, reject) => {
      con.query(query, [id], (error, results) => {
        if (error) return reject(error);
        resolve(results[0]);
      });
    });
  }

  static deleteByProjectId(projectId) {
    const query = `DELETE FROM ${this.table} WHERE project_id = ?`;
    return new Promise((resolve, reject) => {
      con.query(query, [projectId], (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }
}

export default SourcemapHistory;
