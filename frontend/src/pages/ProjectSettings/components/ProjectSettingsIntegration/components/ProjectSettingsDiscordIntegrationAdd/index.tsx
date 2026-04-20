import {
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  Grid2 as Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { key as discordDetailsKey } from "hooks/useDiscordDetails";
import DiscordIcon from "icons/DiscordIcon";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { apiClient } from "utils/axios";
import { cssColor } from "utils/colors";

export default function ProjectSettingsDiscordIntegrationAdd() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [webhookUrl, setWebhookUrl] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: { projectId: string; webhookUrl: string }) => {
      const result = await apiClient.post("/discord/connect", values);
      return result?.data;
    },
  });

  const connectDiscord = () => {
    const normalizedWebhook = webhookUrl.trim();
    if (!projectId || !normalizedWebhook) {
      return;
    }

    mutate(
      { projectId, webhookUrl: normalizedWebhook },
      {
        onSuccess: ({ message }) => {
          toast.success(message || "Discord integration saved");
          queryClient.invalidateQueries({
            queryKey: [discordDetailsKey, projectId],
          });
        },
        onError: (error) => {
          const errorMessage = (error as AxiosError<{ message: string }>)
            ?.response?.data?.message;
          toast.error(errorMessage || "Something went wrong!");
        },
      }
    );
  };

  return (
    <Grid
      container
      sx={{
        borderRadius: 2,
        p: 2,
        alignItems: "center",
        backgroundColor: cssColor("backgroundShade"),
      }}
      spacing={1}
    >
      <Grid size={{ xs: 12, sm: 8, md: 9 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <DiscordIcon />
          <Typography variant="h5">Discord</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" mb={1}>
          connect a discord channel webhook to receive project error alerts
        </Typography>
        <Box mb={1.5}>
          <Typography variant="caption" display="block" color="textSecondary">
            How to get webhook URL from Discord:
          </Typography>
          <Typography variant="caption" display="block" color="textSecondary">
            1. Open your Discord server and choose the channel.
          </Typography>
          <Typography variant="caption" display="block" color="textSecondary">
            2. Click channel settings - Integrations - Webhooks.
          </Typography>
          <Typography variant="caption" display="block" color="textSecondary">
            3. Create or edit a webhook, then copy its URL.
          </Typography>
          <Typography variant="caption" display="block" color="textSecondary">
            4. Paste the URL below and save.
          </Typography>
        </Box>
        <Box sx={{ maxWidth: "420px" }}>
          <TextField
            fullWidth
            label="Discord Webhook URL"
            value={webhookUrl}
            onChange={(event) => setWebhookUrl(event.target.value)}
            disabled={isPending}
          />
          <FormHelperText>
            Example: https://discord.com/api/webhooks/.../...
          </FormHelperText>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 3 }} textAlign="right">
        <Button
          sx={{ width: "100%" }}
          variant="contained"
          color="white"
          onClick={connectDiscord}
          disabled={isPending || !webhookUrl.trim()}
          startIcon={isPending ? <CircularProgress size={15} /> : null}
        >
          <Typography variant="body1" fontWeight={600} noWrap color="black">
            Save Webhook
          </Typography>
        </Button>
      </Grid>
    </Grid>
  );
}
