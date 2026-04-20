import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ListContainer from "components/ListContainer";
import useBillingHistory from "hooks/useBillingHistory";
import useProjectId from "hooks/useProjectId";
import { Link } from "react-router-dom";
import ProjectSettingsBillingMetering from "../ProjectSettingsIntegration/components/ProjectSettingsBillingMetering";

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function ProjectSettingsBillingHistory() {
  const projectId = useProjectId();
  const { data, isLoading, error } = useBillingHistory(projectId, 12);

  return (
    <>
      <ProjectSettingsBillingMetering />

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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              Billing History
            </Typography>
            <Typography color="text.secondary">
              Month-by-month usage and estimated cost summary for the last 12 billing periods.
            </Typography>
          </Box>

          <Button
            component={Link}
            to={`/projects/${projectId}/settings/plans`}
            variant="outlined"
          >
            View Purchase Plans
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <ListContainer loading={isLoading} error={error?.message} count={data?.length || 0}>
          <TableContainer component={Box} sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Period</TableCell>
                  <TableCell>Errors</TableCell>
                  <TableCell>Sessions</TableCell>
                  <TableCell>API calls</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Estimated total</TableCell>
                  <TableCell>Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.map((item) => (
                  <TableRow key={item.period_key}>
                    <TableCell>{item.period_key}</TableCell>
                    <TableCell>{item.usage.errors_logged}</TableCell>
                    <TableCell>{item.usage.sessions_recorded}</TableCell>
                    <TableCell>{item.usage.api_calls}</TableCell>
                    <TableCell>
                      <Chip size="small" label="Recorded" color="success" variant="outlined" />
                    </TableCell>
                    <TableCell>{formatCurrency(item.estimate.total)}</TableCell>
                    <TableCell>{new Date(item.updated_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ListContainer>
      </Paper>
    </>
  );
}