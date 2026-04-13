import dotend from "dotenv";
dotend.config();
import { con } from "../database/connection.js";
import axios from "axios";
import { WebClient } from "@slack/web-api";

export default class Slack {
  static table = "slack_integration";

  static insert(values) {
    const columns = Object.keys(values).join(", ");
    const placeholders = Object.keys(values)
      .map(() => "?")
      .join(", ");
    const sql = `INSERT INTO ${Slack.table} (${columns}) VALUES (${placeholders})`;
    const params = Object.values(values);

    return new Promise((resolve, reject) => {
      con.query(sql, params, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(false);
        }

        resolve(true);
      });
    });
  }

  static getDetailsByProjectId(projectId) {
    const query = `SELECT * FROM ${Slack.table} WHERE project_id=?`;
    const checkParams = [projectId];

    return new Promise((resolve, reject) => {
      con.query(query, checkParams, (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          return reject(err);
        }

        resolve(results[0]);
      });
    });
  }

  static exchangeCodeForToken(code) {
    return new Promise(async (resolve, reject) => {
      const response = await axios.post(
        "https://slack.com/api/oauth.v2.access",
        null,
        {
          params: {
            code,
            client_id: process.env.SLACK_CLIENT_ID,
            client_secret: process.env.SLACK_CLIENT_SECRET,
            redirect_uri: process.env.SLACK_REDIRECT_URI,
          },
        }
      );

      if (response?.data) {
        return resolve(response?.data);
      }

      reject("Token exchange failed!");
    });
  }

  static addChannelId(id, projectId) {
    const checkSql = `UPDATE ${Slack.table} SET channel_id=? WHERE project_id = ?`;
    const checkParams = [id, projectId];

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

  static async isValidChannel(channelId, projectId) {
    return new Promise(async (resolve, reject) => {
      try {
        const slackDetails = await Slack.getDetailsByProjectId(projectId);
        if (!slackDetails) {
          resolve(false);
        }

        const response = await axios.get(
          "https://slack.com/api/conversations.info",
          {
            headers: {
              Authorization: `Bearer ${slackDetails?.access_token}`,
            },
            params: {
              channel: channelId,
            },
          }
        );

        if (response.data.ok) {
          resolve(true);
        }

        resolve(false);
      } catch (error) {
        reject(error);
      }
    });
  }

  static async sendMessage(values, projectId) {
    const slackDetails = await Slack.getDetailsByProjectId(projectId);
    if (!slackDetails || !slackDetails.channel_id) {
      return;
    }

    const slackClient = new WebClient(slackDetails?.access_token);
    const { project_id, lineno, colno, browser, os, stack } = values;

    const slackMessage = `
      🚨 *Error Logged* 🚨
      - *Project ID*: ${project_id}
      - *Line*: ${lineno || "N/A"}, Column: ${colno || "N/A"}
      - *OS*: ${os || "N/A"}, Browser: ${browser || "N/A"}
      - *Stack Trace*:
      \`\`\`
      ${stack}
      \`\`\`
          `;

    try {
      // Send the message
      await slackClient.chat.postMessage({
        channel: slackDetails?.channel_id,
        text: slackMessage,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: slackMessage,
            },
          },
        ],
      });
    } catch (error) {
      console.error("Error sending Slack message:", error);
    }
  }
}
