import Project from "../classes/project.js";
import ProjectTeam from "../classes/projectTeam.js";
import Slack from "../classes/slack.js";
import { WebClient } from "@slack/web-api";

export const slackConnectInit = async (req, res) => {
  const projectId = req.query?.projectId;

  const slackAuthURL = `https://slack.com/oauth/v2/authorize?client_id=${
    process.env.SLACK_CLIENT_ID
  }&scope=${process.env.SLACK_SCOPE}&redirect_uri=${
    process.env.SLACK_REDIRECT_URI
  }&state=${encodeURIComponent(projectId)}`;

  res.status(200).json({ message: "", data: slackAuthURL });
};

export const slackConnectFinalize = async (req, res) => {
  const { code, state } = req.query;
  const projectId = state;

  try {
    const { access_token, team, bot_user_id } =
      await Slack.exchangeCodeForToken(code);

    const resutlt = await Slack.insert({
      team_id: team?.id,
      team_name: team?.name,
      scope: process.env.SLACK_SCOPE,
      project_id: projectId,
      bot_user_id,
      access_token,
    });

    if (resutlt) {
      res.redirect(
        `${process.env.FRONTEND_LINK}/projects/${projectId}/settings/integration`
      );
    } else {
      return res.status(200).json({ message: "Slack integration failed" });
    }
  } catch (error) {
    console.error("Error during Slack OAuth:", error);
    res.status(500).send("Error during Slack OAuth.");
  }
};

export const addChannelId = async (req, res) => {
  const { channelId, projectId } = req.body;

  if (!channelId || !projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // check for valid channel id
    const isValidChannel = await Slack.isValidChannel(channelId, projectId);
    if (!isValidChannel) {
      return res.status(404).json({ message: "Channel does not exists" });
    }

    await Slack.addChannelId(channelId, projectId);

    // bot joins the slack channel
    const slackDetails = await Slack.getDetailsByProjectId(projectId);
    const slackClient = new WebClient(slackDetails?.access_token);
    await slackClient.conversations.join({
      channel: channelId,
    });

    return res.status(201).json({ message: "Channel added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Channel adding failed!" });
  }
};

export const getConnectedSlackDetails = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Slack details not found!" });
  }

  try {
    const slackDetails = await Slack.getDetailsByProjectId(projectId);
    res.status(200).json({ message: "", data: slackDetails || null });
  } catch (error) {
    res.status(500).json({ message: "Fetching channel details failed!" });
  }
};
