import { con } from "../database/connection.js";
import Project from "./project.js";
import User from "./user.js";

export default class ProjectTeam {
  static table = "project_team";

  static insert(values) {
    const columns = Object.keys(values).join(", ");
    const placeholders = Object.keys(values)
      .map(() => "?")
      .join(", ");
    const sql = `INSERT INTO ${ProjectTeam.table} (${columns}) VALUES (${placeholders})`;
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

  static checkForDuplicateTeamMember(projectId, user_id) {
    const checkSql = `SELECT * FROM ${ProjectTeam.table} WHERE project_id = ? AND user_id = ?`;
    const checkParams = [projectId, user_id];

    return new Promise((resolve, reject) => {
      con.query(checkSql, checkParams, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results[0]);
      });
    });
  }

  static members(projectId, pending = false) {
    const checkSql = `SELECT pt.*,u.username,u.email  FROM ${
      ProjectTeam.table
    } pt JOIN ${
      User.table
    } u ON pt.user_id = u.id WHERE project_id = ? AND is_approved = ${
      pending ? 0 : 1
    }`;
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

  static approveMember(memberId) {
    const checkSql = `UPDATE ${ProjectTeam.table} SET is_approved=1 WHERE id = ?`;
    const checkParams = [memberId];

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

  static allInvitations() {
    const user_id = User.currentUser?.id;
    const checkSql = `SELECT pt.*,p.name AS project_name, p.description AS project_description, u.username AS invited_by_username FROM ${ProjectTeam.table} pt JOIN ${Project.table} p ON pt.project_id = p.id JOIN ${User.table} u ON pt.invited_by = u.id WHERE pt.user_id = ? AND is_approved = 0`;
    const checkParams = [user_id];

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

  static deleteMember(memberId) {
    const checkSql = `DELETE FROM ${ProjectTeam.table} WHERE id = ?`;
    const checkParams = [memberId];

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

  static deleteTeam(projectId) {
    const checkSql = `DELETE FROM ${ProjectTeam.table} WHERE project_id = ?`;
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

  static isProjectMember(projectId) {
    const userId = User.currentUser?.id;
    const checkSql = `SELECT * FROM ${ProjectTeam.table} WHERE user_id=? AND project_id = ? AND is_approved = 1`;
    const checkParams = [userId, projectId];

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

  static hasProjectInvitations() {
    const userId = User.currentUser?.id;
    const checkSql = `SELECT * FROM ${ProjectTeam.table} WHERE user_id=? AND invited_by IS NOT NULL AND is_approved = 0`;
    const checkParams = [userId];

    return new Promise((resolve, reject) => {
      con.query(checkSql, checkParams, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results?.length > 0);
      });
    });
  }
}
