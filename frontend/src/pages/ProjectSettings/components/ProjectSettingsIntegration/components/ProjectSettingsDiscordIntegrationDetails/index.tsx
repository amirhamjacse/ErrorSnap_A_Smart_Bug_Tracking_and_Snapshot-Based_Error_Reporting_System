import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { key as discordDetailsKey } from "hooks/useDiscordDetails";
import DiscordIcon from "icons/DiscordIcon";
import React from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { discordDetails } from "types/discord";
import { apiClient } from "utils/axios";
import { cssColor } from "utils/colors";

const maskWebhook = (webhookUrl: string) => {
  if (!webhookUrl) {
    return "NULL";
  }

  if (webhookUrl.length <= 30) {
    return webhookUrl;
  }

  return `${webhookUrl.slice(0, 22)}...${webhookUrl.slice(-8)}`;
};

export default function ProjectSettingsDiscordIntegrationDetails({
  data,
}: {
  data: discordDetails;
}) {
  const { projectId } = useParams();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: { projectId: string }) => {
      const result = await apiClient.post("/discord/disconnect", values);
      return result?.data;
    },
  });

  const removeIntegration = () => {
    if (!projectId) {
      return;
    }

    mutate(
      { projectId },
      {
        onSuccess: ({ message }) => {
          toast.success(message || "Discord integration removed");
          queryClient.invalidateQueries({
            queryKey: [discordDetailsKey, projectId],
          });
        },
        onError: () => {
          toast.error("Something went wrong!");
        },
      },
    );
  };

  return (
    <Box
      sx={{
        borderRadius: 2,
        p: 2,
        backgroundColor: cssColor("backgroundShade"),
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <DiscordIcon />
        <Typography variant="h5">Discord</Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Typography variant="body1">Connected Webhook:</Typography>
        <Typography variant="caption" color="textSecondary">
          {maskWebhook(data?.webhook_url)}
        </Typography>
      </Box>
      <Button
        variant="outlined"
        color="error"
        disabled={isPending}
        startIcon={isPending ? <CircularProgress size={15} /> : null}
        onClick={removeIntegration}
      >
        Remove Discord Integration
      </Button>
    </Box>
  );
}
