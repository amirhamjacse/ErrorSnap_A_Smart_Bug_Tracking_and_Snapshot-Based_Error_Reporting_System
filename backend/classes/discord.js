import { con } from "../database/connection.js";
import axios from "axios";

export default class Discord {
  static table = "discord_integration";

  static getDetailsByProjectId(projectId) {
    const query = `SELECT * FROM ${Discord.table} WHERE project_id=?`;
    const params = [projectId];

    return new Promise((resolve, reject) => {
      con.query(query, params, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results?.[0] || null);
      });
    });
  }

  static upsert(values) {
    const query = `INSERT INTO ${Discord.table} (project_id, webhook_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE webhook_url = VALUES(webhook_url)`;
    const params = [values.project_id, values.webhook_url];

    return new Promise((resolve, reject) => {
      con.query(query, params, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results);
      });
    });
  }

  static removeByProjectId(projectId) {
    const query = `DELETE FROM ${Discord.table} WHERE project_id=?`;
    const params = [projectId];

    return new Promise((resolve, reject) => {
      con.query(query, params, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results);
      });
    });
  }

  static async sendMessage(values, projectId) {
    const discordDetails = await Discord.getDetailsByProjectId(projectId);
    if (!discordDetails?.webhook_url) {
      return;
    }

    const { project_id, lineno, colno, browser, os, stack } = values;
    const stackText = stack || "N/A";
    const maxStackLength = 1100;
    const stackBody =
      stackText.length > maxStackLength
        ? `${stackText.slice(0, maxStackLength)}\n...truncated`
        : stackText;

    const message = [
      "🚨 **Error Logged**",
      `**Project ID:** ${project_id}`,
      `**Line/Column:** ${lineno || "N/A"}/${colno || "N/A"}`,
      `**OS/Browser:** ${os || "N/A"} / ${browser || "N/A"}`,
      "**Stack Trace:**",
      "```",
      stackBody,
      "```",
    ].join("\n");

    try {
      await axios.post(discordDetails.webhook_url, {
        content: message,
      });
    } catch (error) {
      console.error("Error sending Discord message:", error);
    }
  }
}
