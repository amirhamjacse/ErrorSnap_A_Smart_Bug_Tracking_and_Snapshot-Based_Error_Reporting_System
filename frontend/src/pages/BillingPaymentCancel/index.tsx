import { Box, Button, Paper, Typography } from "@mui/material";
import PageContainer from "components/PageContainer";
import { Link, useSearchParams } from "react-router-dom";

export default function BillingPaymentCancel() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const plan = searchParams.get("plan") || "";

  const nextPath = projectId
    ? `/projects/${projectId}/settings/plans`
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
          Payment canceled
        </Typography>
        <Typography color="text.secondary" mb={2}>
          Checkout was canceled before completion.
        </Typography>

        <Box mb={3}>
          <Typography>
            Plan: <b>{plan || "N/A"}</b>
          </Typography>
        </Box>

        <Button component={Link} to={nextPath} variant="outlined">
          Back to Purchase Plans
        </Button>
      </Paper>
    </PageContainer>
  );
}
