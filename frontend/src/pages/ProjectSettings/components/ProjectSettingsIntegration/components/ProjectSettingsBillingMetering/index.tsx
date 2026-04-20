import { Box, Button, Divider, Grid2, MenuItem, Paper, TextField, Typography } from "@mui/material";
import ListContainer from "components/ListContainer";
import useFilterChange from "hooks/useFilterChange";
import useBillingSummary from "hooks/useBillingSummary";
import useProjectId from "hooks/useProjectId";
import { apiClient } from "utils/axios";

function formatMonth(value: number) {
  return value < 10 ? `0${value}` : String(value);
}

function getCurrentPeriodKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = formatMonth(now.getMonth() + 1);
  return `${year}-${month}`;
}

function getPeriodOptions(count = 6) {
  const options: Array<{ label: string; value: string }> = [];
  const current = new Date();

  for (let index = 0; index < count; index += 1) {
    const date = new Date(current.getFullYear(), current.getMonth() - index, 1);
    const year = date.getFullYear();
    const month = formatMonth(date.getMonth() + 1);
    const value = `${year}-${month}`;
    const label = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });

    options.push({ label, value });
  }

  return options;
}

function MetricItem({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: "rgba(15, 23, 42, 0.68)",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5" mt={0.5}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {helper}
      </Typography>
    </Paper>
  );
}

export default function ProjectSettingsBillingMetering() {
  const projectId = useProjectId();
  const { value: periodKey, handleChange: handlePeriodChange } = useFilterChange(
    "periodKey",
    getCurrentPeriodKey()
  );
  const { data, isLoading, error } = useBillingSummary(projectId, String(periodKey));
  const periodOptions = getPeriodOptions();

  const handleExportCsv = async () => {
    if (!projectId) {
      return;
    }

    const response = await apiClient.get(`/billing/summary/${projectId}/export`, {
      params: {
        periodKey,
      },
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `billing-usage-${projectId}-${periodKey}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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
        Billing Metering (Usage-based)
      </Typography>
      <Typography color="text.secondary">
        Current monthly usage and estimated usage-based cost for this project.
      </Typography>

      <Divider sx={{ my: 2 }} />

      <ListContainer loading={isLoading} error={error?.message} count={data ? 1 : 0}>
        <Box>
          <Box
            display="flex"
            gap={2}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            mb={2}
          >
            <Typography variant="body2" color="text.secondary">
              Billing period: {data?.period_key}
            </Typography>
            <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
              <TextField
                select
                size="small"
                label="Period"
                value={periodKey}
                onChange={(event) => handlePeriodChange(event.target.value)}
                sx={{ minWidth: 170 }}
              >
                {periodOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="outlined" onClick={handleExportCsv} disabled={!data}>
                Export CSV
              </Button>
            </Box>
          </Box>

          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <MetricItem
                label="Errors logged"
                value={String(data?.usage?.errors_logged || 0)}
                helper={`$${data?.estimate?.errors || 0} estimated`}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <MetricItem
                label="Sessions recorded"
                value={String(data?.usage?.sessions_recorded || 0)}
                helper={`$${data?.estimate?.sessions || 0} estimated`}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <MetricItem
                label="API calls"
                value={String(data?.usage?.api_calls || 0)}
                helper={`$${data?.estimate?.api_calls || 0} estimated`}
              />
            </Grid2>
          </Grid2>

          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              backgroundColor: "rgba(20, 30, 48, 0.72)",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Estimated total ({data?.pricing?.currency || "USD"})
            </Typography>
            <Typography variant="h4" mt={0.5}>
              ${data?.estimate?.total || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pricing: ${data?.pricing?.errors_per_1000 || 0}/1k errors, $
              {data?.pricing?.sessions_per_1000 || 0}/1k sessions, $
              {data?.pricing?.api_calls_per_10000 || 0}/10k API calls.
            </Typography>
          </Paper>
        </Box>
      </ListContainer>
    </Paper>
  );
}
