import {
  Box,
  Card,
  Chip,
  Divider,
  Grid2,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ListContainer from "components/ListContainer";
import useFilterChange from "hooks/useFilterChange";
import useErrorPatterns from "hooks/useErrorPatterns";
import useProjectId from "hooks/useProjectId";
import { useState } from "react";

const STATUS_LABELS: { [key: number]: string } = {
  0: "Unresolved",
  1: "Pending",
  2: "Resolved",
};

const STATUS_COLORS: { [key: number]: any } = {
  0: "error",
  1: "warning",
  2: "success",
};

export default function ProjectSettingsCodePatterns() {
  const projectId = useProjectId();
  const { value: environment, handleChange: handleEnvironmentChange } = useFilterChange(
    "pattern-environment",
    "production"
  );
  const { value: days, handleChange: handleDaysChange } = useFilterChange(
    "pattern-days",
    "30"
  );

  const { data, isLoading, error } = useErrorPatterns(projectId, environment, days);

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
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
        <Box>
          <Typography variant="h6" gutterBottom>
            Error Patterns
          </Typography>
          <Typography color="text.secondary">
            Identify recurring error patterns and focus on what matters most.
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" gap={2} alignItems="center" justifyContent="space-between" flexWrap="wrap" mb={3}>
        <TextField
          select
          size="small"
          label="Environment"
          value={environment}
          onChange={(event) => handleEnvironmentChange(event.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="production">Production</MenuItem>
          <MenuItem value="development">Development</MenuItem>
          <MenuItem value="staging">Staging</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Time Period"
          value={days}
          onChange={(event) => handleDaysChange(event.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="7">Last 7 days</MenuItem>
          <MenuItem value="30">Last 30 days</MenuItem>
          <MenuItem value="90">Last 90 days</MenuItem>
          <MenuItem value="180">Last 180 days</MenuItem>
        </TextField>

        <Typography color="text.secondary" variant="body2">
          {data?.total_patterns || 0} patterns found in {data?.total_errors || 0} errors
        </Typography>
      </Box>

      <ListContainer loading={isLoading} error={error?.message} count={data?.patterns?.length || 0}>
        <Stack spacing={2}>
          {data?.patterns?.map((pattern, index) => (
            <Card
              key={index}
              sx={{
                p: 2.5,
                backgroundColor: "rgba(15, 23, 42, 0.68)",
                border: "1px solid rgba(255,255,255,0.05)",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(15, 23, 42, 0.88)",
                  borderColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={1.5}>
                <Box flex={1}>
                  <Typography variant="body1" sx={{ wordBreak: "break-word", mb: 0.5 }}>
                    {pattern.example_message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pattern: {pattern.pattern}
                  </Typography>
                </Box>
                <Box textAlign="right" display="flex" flexDirection="column" gap={1}>
                  <Chip
                    label={`${pattern.occurrence_count} occurrences (${pattern.percentage}%)`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                  <Chip
                    label={`${pattern.resolution_status.unresolved} unresolved`}
                    size="small"
                    color={pattern.resolution_status.unresolved > 0 ? "error" : "default"}
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Grid2 container spacing={1.5} mb={1.5}>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Affected Browsers
                  </Typography>
                  <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                    {pattern.affected_browsers.length > 0 ? (
                      pattern.affected_browsers.map((browser) => (
                        <Chip key={browser} label={browser} size="small" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </Box>
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Affected OS
                  </Typography>
                  <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                    {pattern.affected_os.length > 0 ? (
                      pattern.affected_os.map((os) => (
                        <Chip key={os} label={os} size="small" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </Box>
                </Grid2>
              </Grid2>

              <Grid2 container spacing={1.5} mb={1.5}>
                <Grid2 size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    First Seen
                  </Typography>
                  <Typography variant="body2">
                    {new Date(pattern.first_occurrence).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                </Grid2>

                <Grid2 size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Last Seen
                  </Typography>
                  <Typography variant="body2">
                    {new Date(pattern.last_occurrence).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Typography>
                </Grid2>

                <Grid2 size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    {pattern.resolution_status.pending}
                  </Typography>
                </Grid2>

                <Grid2 size={{ xs: 6, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Resolved
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    {pattern.resolution_status.resolved}
                  </Typography>
                </Grid2>
              </Grid2>

              {pattern.error_samples.length > 0 && (
                <>
                  <Typography variant="caption" color="text.secondary">
                    Recent Examples
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={0.5} mt={0.5}>
                    {pattern.error_samples.map((sample) => (
                      <Box
                        key={sample.id}
                        sx={{
                          p: 1,
                          backgroundColor: "rgba(255,255,255,0.05)",
                          borderRadius: 1,
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                          <Typography variant="caption" sx={{ wordBreak: "break-word", flex: 1 }}>
                            {sample.message}
                          </Typography>
                          <Chip
                            label={STATUS_LABELS[sample.status]}
                            size="small"
                            color={STATUS_COLORS[sample.status]}
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                          {new Date(sample.created_at).toLocaleString("en-US")}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Card>
          ))}
        </Stack>
      </ListContainer>
    </Paper>
  );
}
