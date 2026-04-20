import Discord from "../classes/discord.js";
import ProjectTeam from "../classes/projectTeam.js";

const isValidDiscordWebhook = (webhookUrl) => {
  try {
    const parsedUrl = new URL(webhookUrl);
    const allowedHosts = [
      "discord.com",
      "canary.discord.com",
      "ptb.discord.com",
      "discordapp.com",
    ];

    if (!allowedHosts.includes(parsedUrl.hostname)) {
      return false;
    }

    return /^\/api\/webhooks\/\d+\/[^/]+$/.test(parsedUrl.pathname);
  } catch (error) {
    return false;
  }
};

export const connectDiscordIntegration = async (req, res) => {
  const { projectId, webhookUrl } = req.body;

  if (!projectId || !webhookUrl) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Project not found!" });
  }

  const normalizedWebhookUrl = String(webhookUrl).trim();
  if (!isValidDiscordWebhook(normalizedWebhookUrl)) {
    return res.status(400).json({ message: "Invalid Discord webhook URL" });
  }

  try {
    await Discord.upsert({
      project_id: projectId,
      webhook_url: normalizedWebhookUrl,
    });

    return res.status(201).json({ message: "Discord integration saved" });
  } catch (error) {
    return res.status(500).json({ message: "Saving Discord integration failed!" });
  }
};

export const getConnectedDiscordDetails = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Discord details not found!" });
  }

  try {
    const discordDetails = await Discord.getDetailsByProjectId(projectId);
    return res.status(200).json({ message: "", data: discordDetails || null });
  } catch (error) {
    return res.status(500).json({ message: "Fetching Discord details failed!" });
  }
};

export const removeDiscordIntegration = async (req, res) => {
  const { projectId } = req.body;

  if (!projectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const isProjectMember = await ProjectTeam.isProjectMember(projectId);
  if (!isProjectMember.length) {
    return res.status(404).json({ message: "Project not found!" });
  }

  try {
    await Discord.removeByProjectId(projectId);
    return res.status(200).json({ message: "Discord integration removed" });
  } catch (error) {
    return res.status(500).json({ message: "Removing Discord integration failed!" });
  }
};
