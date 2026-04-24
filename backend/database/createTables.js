import { con } from "./connection.js";
import createUserTable from "../tables/users.js";
import createErrorLogsTable from "../tables/errorLogs.js";
import createProjectTable from "../tables/project.js";
import createProjectTeamTable from "../tables/projectTeam.js";
import createSlackIntegrationTable from "../tables/slackIntegration.js";
import createSourcemapHistoryTable from "../tables/sourcemapHistory.js";
import createProjectInvitationLinkTable from "../tables/projectInvitationLink.js";
import createDiscordIntegrationTable from "../tables/discordIntegration.js";

con.connect(function (error) {
  if (error) {
    console.log("database connection failed! ", error);
    return;
  }

  console.log("Database connected successfully");

  createUserTable();
  createErrorLogsTable();
  createProjectTable();
  createProjectTeamTable();
  createSlackIntegrationTable();
  createDiscordIntegrationTable();
  createSourcemapHistoryTable();
  createProjectInvitationLinkTable();
});
