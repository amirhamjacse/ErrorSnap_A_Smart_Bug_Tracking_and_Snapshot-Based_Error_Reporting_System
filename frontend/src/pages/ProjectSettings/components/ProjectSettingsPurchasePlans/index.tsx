import {
  Box,
  Button,
  Chip,
  Divider,
  Grid2,
  List,
  ListItem,
  Paper,
  Typography,
} from "@mui/material";
import { useState } from "react";
import useProjectId from "hooks/useProjectId";
import { apiClient } from "utils/axios";
import toast from "react-hot-toast";

type plan = {
  code: string;
  name: string;
  price: string;
  badge?: string;
  description: string;
  metrics: Array<string>;
  highlights: Array<string>;
  paid: boolean;
};

const plans: plan[] = [
  {
    code: "starter",
    name: "Starter",
    price: "$0 / month",
    badge: "Best for student demos",
    description: "Get started with real production error tracking for one project.",
    metrics: [
      "Up to 500 API calls / month",
      "Up to 200 sessions / month",
      "Up to 1,000 errors / month",
    ],
    highlights: [
      "Single project",
      "Basic billing history",
      "Email support",
    ],
    paid: false,
  },
  {
    code: "growth",
    name: "Growth",
    price: "$29 / month",
    badge: "Most popular",
    description:
      "For growing SaaS teams that need better limits, integrations, and priority handling.",
    metrics: [
      "Up to 5,000 API calls / month",
      "Up to 2,000 sessions / month",
      "Up to 10,000 errors / month",
    ],
    highlights: [
      "Unlimited projects",
      "Slack + webhook alerts",
      "Priority support",
    ],
    paid: true,
  },
  {
    code: "scale",
    name: "Scale",
    price: "$99 / month",
    badge: "Enterprise-ready",
    description:
      "For high-volume products with advanced governance and custom metering limits.",
    metrics: [
      "Up to 100,000 API calls / month",
      "Up to 30,000 sessions / month",
      "Up to 75,000 errors / month",
    ],
    highlights: [
      "SSO and audit-ready controls",
      "Dedicated onboarding",
      "Custom SLA and support",
    ],
    paid: true,
  },
];

export default function ProjectSettingsPurchasePlans() {
  const projectId = useProjectId();
  const [loadingPlanCode, setLoadingPlanCode] = useState("");

  const handleChoosePlan = async (item: plan) => {
    if (!item.paid) {
      toast.success("Starter plan is free and already available.");
      return;
    }

    if (!projectId) {
      return;
    }

    setLoadingPlanCode(item.code);
    try {
      const response = await apiClient.post("/billing/checkout-session", {
        projectId,
        planCode: item.code,
      });

      const checkoutUrl = response.data?.data?.url;
      if (!checkoutUrl) {
        throw new Error("Missing checkout URL");
      }

      window.location.href = checkoutUrl;
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Unable to start checkout";
      toast.error(errorMessage);
    } finally {
      setLoadingPlanCode("");
    }
  };

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
      <Typography variant="h6" gutterBottom>
        Purchase Plans
      </Typography>
      <Typography color="text.secondary">
        Choose a plan based on your monthly usage profile for project {projectId}.
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Payments are processed securely via Stripe (card payments).
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Grid2 container spacing={2}>
        {plans.map((item) => (
          <Grid2 key={item.name} size={{ xs: 12, md: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                minHeight: 420,
                borderRadius: 2,
                backgroundColor: "rgba(20, 30, 48, 0.72)",
                borderColor:
                  item.name === "Growth" ? "rgba(74, 222, 128, 0.55)" : "rgba(255,255,255,0.12)",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                mb={1.5}
              >
                <Typography variant="h6">{item.name}</Typography>
                {item.badge ? <Chip size="small" label={item.badge} color="success" /> : null}
              </Box>

              <Typography variant="h5" mb={0.5}>
                {item.price}
              </Typography>
              <Typography color="text.secondary" mb={2}>
                {item.description}
              </Typography>

              <Typography variant="subtitle2" mb={1}>
                Usage limits
              </Typography>
              <List dense sx={{ py: 0, mb: 1.5 }}>
                {item.metrics.map((metric) => (
                  <ListItem key={metric} sx={{ py: 0.2, px: 0 }}>
                    • {metric}
                  </ListItem>
                ))}
              </List>

              <Typography variant="subtitle2" mb={1}>
                Included features
              </Typography>
              <List dense sx={{ py: 0, mb: 2 }}>
                {item.highlights.map((feature) => (
                  <ListItem key={feature} sx={{ py: 0.2, px: 0 }}>
                    • {feature}
                  </ListItem>
                ))}
              </List>

              <Button
                variant={item.name === "Growth" ? "contained" : "outlined"}
                fullWidth
                onClick={() => handleChoosePlan(item)}
                disabled={loadingPlanCode === item.code}
              >
                {loadingPlanCode === item.code
                  ? "Redirecting..."
                  : item.name === "Starter"
                    ? "Current baseline"
                    : `Choose ${item.name}`}
              </Button>
            </Paper>
          </Grid2>
        ))}
      </Grid2>
    </Paper>
  );
}
