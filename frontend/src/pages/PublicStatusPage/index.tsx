import {
  Box,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ListContainer from "components/ListContainer";
import usePublicStatus from "hooks/usePublicStatus";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

function getStatusColor(level?: string) {
  if (level === "operational") {
    return "success";
  }

  if (level === "degraded") {
    return "warning";
  }

  return "error";
}

function getIncidentStatusLabel(status: number) {
  if (status === 2) {
    return "Resolved";
  }

  if (status === 1) {
    return "Pending";
  }

  return "Unresolved";
}

export default function PublicStatusPage() {
  const { projectId } = useParams();
  const [environment, setEnvironment] = useState("production");
  const { data, isLoading, error } = usePublicStatus(projectId, environment);

  const generatedAtLabel = useMemo(() => {
    if (!data?.generated_at) {
      return "-";
    }

    return new Date(data.generated_at).toLocaleString();
  }, [data?.generated_at]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 40%), #070d18",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Paper
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.08)",
            background:
              "linear-gradient(180deg, rgba(13, 20, 34, 0.95) 0%, rgba(9, 15, 28, 0.92) 100%)",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
          >
            <Box>
              <Typography variant="h5" gutterBottom>
                {data?.project?.name || "Project"} Status
              </Typography>
              <Typography color="text.secondary">
                Public service health and incident overview.
              </Typography>
            </Box>

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

          <Divider sx={{ my: 2 }} />

          <ListContainer loading={isLoading} error={error?.message} count={data ? 1 : 0}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                <Chip
                  label={data?.status?.label || "Unknown"}
                  color={getStatusColor(data?.status?.level) as "success" | "warning" | "error"}
                  variant="filled"
                />
                <Typography color="text.secondary">{data?.status?.message}</Typography>
              </Box>

              <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }}
                gap={1.5}
              >
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total errors
                  </Typography>
                  <Typography variant="h6">{data?.summary?.total_errors || 0}</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Unresolved
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {data?.summary?.unresolved || 0}
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {data?.summary?.pending || 0}
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Resolved
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {data?.summary?.resolved || 0}
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Errors last 24h
                  </Typography>
                  <Typography variant="h6">{data?.summary?.errors_last_24h || 0}</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Errors last 7d
                  </Typography>
                  <Typography variant="h6">{data?.summary?.errors_last_7d || 0}</Typography>
                </Paper>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Active Incidents
                </Typography>
                {data?.incidents?.length ? (
                  <Stack spacing={1}>
                    {data.incidents.map((incident) => (
                      <Paper
                        key={incident.id}
                        variant="outlined"
                        sx={{ p: 1.5, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.02)" }}
                      >
                        <Box display="flex" justifyContent="space-between" gap={1} flexWrap="wrap">
                          <Typography sx={{ wordBreak: "break-word", flex: 1 }}>
                            {incident.message}
                          </Typography>
                          <Chip
                            size="small"
                            label={getIncidentStatusLabel(incident.status)}
                            color={incident.status === 0 ? "error" : "warning"}
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                          {new Date(incident.created_at).toLocaleString()} | {incident.browser} | {incident.os}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">No active incidents for this environment.</Typography>
                )}
              </Box>

              <Typography variant="caption" color="text.secondary">
                Last updated: {generatedAtLabel}
              </Typography>
            </Stack>
          </ListContainer>
        </Paper>
      </Box>
    </Box>
  );
}
