import { Box, Button, Paper, Typography } from "@mui/material";
import PageContainer from "components/PageContainer";
import { Link, useSearchParams } from "react-router-dom";

export default function BillingPaymentSuccess() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const plan = searchParams.get("plan") || "";
  const isDemo = searchParams.get("demo") === "1";

  const nextPath = projectId
    ? `/projects/${projectId}/settings/billing`
    : "/projects";

  return (
    <PageContainer>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          maxWidth: 700,
          mx: "auto",
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Payment successful
        </Typography>
        <Typography color="text.secondary" mb={2}>
          Your subscription checkout completed successfully.
        </Typography>

        {isDemo ? (
          <Typography color="warning.main" mb={2}>
            Demo mode active: no real payment was charged.
          </Typography>
        ) : null}

        <Box mb={3}>
          <Typography>
            Selected plan: <b>{plan || "N/A"}</b>
          </Typography>
        </Box>

        <Button component={Link} to={nextPath} variant="contained">
          Back to Billing
        </Button>
      </Paper>
    </PageContainer>
  );
}
