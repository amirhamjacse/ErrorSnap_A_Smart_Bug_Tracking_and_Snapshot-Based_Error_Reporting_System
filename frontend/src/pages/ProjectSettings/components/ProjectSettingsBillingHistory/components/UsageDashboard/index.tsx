import { Box, Button, Chip, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import useBillingSummary from "hooks/useBillingSummary";
import useProjectId from "hooks/useProjectId";
import { Link } from "react-router-dom";

const quotaCatalog = {
  api_calls: 500,
  sessions_recorded: 200,
  errors_logged: 1000,
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(value, 100));
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default function UsageDashboard() {
  const projectId = useProjectId();
  const { data, isLoading } = useBillingSummary(projectId);

  const apiUsagePercent =
    ((data?.usage?.api_calls || 0) / quotaCatalog.api_calls) * 100;
  const sessionUsagePercent =
    ((data?.usage?.sessions_recorded || 0) / quotaCatalog.sessions_recorded) * 100;
  const errorUsagePercent =
    ((data?.usage?.errors_logged || 0) / quotaCatalog.errors_logged) * 100;

  const overallPercent = clampPercent(
    Math.max(apiUsagePercent, sessionUsagePercent, errorUsagePercent)
  );
  const upgradeRecommended = overallPercent >= 60;
  const statusLabel = upgradeRecommended ? "Upgrade recommended" : "Healthy usage";
  const statusColor = upgradeRecommended ? "warning" : "success";

  return (
    <Paper
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "linear-gradient(180deg, rgba(13, 20, 34, 0.95) 0%, rgba(9, 15, 28, 0.92) 100%)",
      }}
    >
      <Stack spacing={2}>
        <Box display="flex" justifyContent="space-between" gap={2} flexWrap="wrap">
          <Box>
            <Typography variant="h6" gutterBottom>
              Usage Dashboard
            </Typography>
            <Typography color="text.secondary">
              Current monthly usage and quota health for this project.
            </Typography>
          </Box>
          <Chip label={statusLabel} color={statusColor} variant="outlined" />
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" mb={1}>
            You used {isLoading ? "..." : formatPercent(overallPercent)} of quota
          </Typography>
          <LinearProgress
            variant="determinate"
            value={isLoading ? 0 : overallPercent}
            sx={{ height: 10, borderRadius: 999 }}
          />
        </Box>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
          gap={2}
        >
          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2, backgroundColor: "rgba(20, 30, 48, 0.72)" }}
          >
            <Typography variant="body2" color="text.secondary">
              API calls
            </Typography>
            <Typography variant="h5" mt={0.5}>
              {data?.usage?.api_calls || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              of {quotaCatalog.api_calls} quota
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2, backgroundColor: "rgba(20, 30, 48, 0.72)" }}
          >
            <Typography variant="body2" color="text.secondary">
              Sessions recorded
            </Typography>
            <Typography variant="h5" mt={0.5}>
              {data?.usage?.sessions_recorded || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              of {quotaCatalog.sessions_recorded} quota
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2, backgroundColor: "rgba(20, 30, 48, 0.72)" }}
          >
            <Typography variant="body2" color="text.secondary">
              Errors logged
            </Typography>
            <Typography variant="h5" mt={0.5}>
              {data?.usage?.errors_logged || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              of {quotaCatalog.errors_logged} quota
            </Typography>
          </Paper>
        </Box>

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          flexWrap="wrap"
        >
          <Typography color="text.secondary">
            {upgradeRecommended
              ? "Upgrade recommended to avoid hitting your usage ceiling."
              : "Usage is healthy. Keep monitoring as traffic grows."}
          </Typography>
          <Button component={Link} to={`/projects/${projectId}/settings/plans`} variant="contained">
            View Purchase Plans
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
