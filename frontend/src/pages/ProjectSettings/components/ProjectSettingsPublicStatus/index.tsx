import {
  Box,
  Button,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ListContainer from "components/ListContainer";
import usePublicStatus from "hooks/usePublicStatus";
import useProjectId from "hooks/useProjectId";
import { useMemo, useState } from "react";

export default function ProjectSettingsPublicStatus() {
  const projectId = useProjectId();
  const [environment, setEnvironment] = useState("production");
  const { data, isLoading, error } = usePublicStatus(projectId, environment, {
    enabled: Boolean(projectId),
  });

  const statusUrl = useMemo(() => {
    if (!projectId) {
      return "";
    }

    return `${window.location.origin}/status/${projectId}`;
  }, [projectId]);

  const handleCopyLink = async () => {
    if (!statusUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(statusUrl);
    } catch (copyError) {
      console.error("Failed to copy status page URL", copyError);
    }
  };

  return (
    <Paper
      sx={{
        mt: 3,
        p: { xs: 2.5, md: 3 },
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(180deg, rgba(13, 20, 34, 0.95) 0%, rgba(9, 15, 28, 0.92) 100%)",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Public Status Page
      </Typography>
      <Typography color="text.secondary">
        Share a public page that shows service health, recent incidents, and uptime indicators.
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center" mb={2}>
        <TextField
          size="small"
          label="Status URL"
          value={statusUrl}
          InputProps={{ readOnly: true }}
          sx={{ minWidth: 300, flex: 1 }}
        />
        <Button variant="outlined" onClick={handleCopyLink} disabled={!statusUrl}>
          Copy Link
        </Button>
        <Button
          variant="contained"
          href={statusUrl}
          target="_blank"
          rel="noopener noreferrer"
          disabled={!statusUrl}
        >
          Open Page
        </Button>
      </Box>

      <Box display="flex" gap={1.5} alignItems="center" mb={2}>
        <TextField
          select
          size="small"
          label="Environment"
          value={environment}
          onChange={(event) => setEnvironment(event.target.value)}
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="production">Production</MenuItem>
          <MenuItem value="staging">Staging</MenuItem>
          <MenuItem value="development">Development</MenuItem>
        </TextField>
      </Box>

      <ListContainer loading={isLoading} error={error?.message} count={data ? 1 : 0}>
        <Typography variant="body2" color="text.secondary">
          Current status: {data?.status?.label || "Unknown"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Active incidents: {(data?.summary?.unresolved || 0) + (data?.summary?.pending || 0)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Errors last 24h: {data?.summary?.errors_last_24h || 0}
        </Typography>
      </ListContainer>
    </Paper>
  );
}
