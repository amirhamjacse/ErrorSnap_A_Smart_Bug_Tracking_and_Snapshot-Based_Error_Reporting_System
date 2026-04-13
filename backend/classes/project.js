import { con } from "../database/connection.js";
import ProjectTeam from "./projectTeam.js";
import User from "./user.js";

class Project {
  static table = "project";

  static getProjectWithName(name) {
    const userId = User.currentUser?.id;
    const query = `SELECT * FROM ${Project.table} WHERE name='${name}' AND user_id='${userId}'`;

    return new Promise((resolve, reject) => {
      con.query(query, function (error, results) {
        if (error) return reject(error);
        resolve(results[0]);
      });
    });
  }

  static update(projectId, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);

    const setClause = columns.map((col) => `${col}=?`).join(", ");
    const query = `UPDATE ${Project.table} SET ${setClause} WHERE id=?`;

    return new Promise((resolve, reject) => {
      con.query(query, [...values, projectId], function (error, results) {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  static getUserProjects(filter) {
    const userId = User.currentUser?.id;
    let query = `SELECT p.* FROM ${ProjectTeam.table} pt JOIN ${Project.table} p ON pt.project_id = p.id WHERE pt.user_id = '${userId}' AND pt.is_approved = 1`;

    if (filter === "me") {
      query += ` AND pt.invited_by IS NULL`;
    } else if (filter === "assigned") {
      query += ` AND pt.invited_by IS NOT NULL`;
    }

    return new Promise((resolve, reject) => {
      con.query(query, function (error, results) {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  static getById(projectId) {
    const query = `SELECT * FROM ${Project.table} WHERE id='${projectId}'`;

    return new Promise((resolve, reject) => {
      con.query(query, function (error, results) {
        if (error) return reject(error);
        resolve(results[0]);
      });
    });
  }

  static getUserProjectById(projectId) {
    const userId = User.currentUser?.id;
    const query = `SELECT * FROM ${Project.table} WHERE user_id=${userId} AND id = '${projectId}'`;

    return new Promise((resolve, reject) => {
      con.query(query, function (error, results) {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }

  static delete(projectId) {
    const query = `DELETE FROM ${Project.table} WHERE id = '${projectId}'`;

    return new Promise((resolve, reject) => {
      con.query(query, function (error, results) {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }
}

export default Project;
