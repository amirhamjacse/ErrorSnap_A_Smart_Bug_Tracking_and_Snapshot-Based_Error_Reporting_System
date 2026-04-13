import { Box, Chip, Grid2 as Grid, Paper, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

export default function AuthFormWrapper({ children }: { children: ReactNode }) {
  return (
    <Box
      minHeight="100dvh"
      display="grid"
      alignItems="center"
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(108, 140, 255, 0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(124, 92, 255, 0.14), transparent 28%)",
          pointerEvents: "none",
        },
      }}
    >
      <Grid
        container
        maxWidth="1200px"
        mx="auto"
        spacing={{ xs: 3, lg: 4 }}
        alignItems="stretch"
      >
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box
            height="100%"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            gap={3}
            sx={{ pr: { lg: 6 } }}
          >
            <Chip
              label="Production issue platform"
              sx={{ alignSelf: "flex-start" }}
              color="primary"
            />
            <Box>
              <Typography variant="h1" mb={2}>
                Track errors with clarity.
                <br />
                Resolve with confidence.
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 560 }}
              >
                ErrorSnap gives your team a cleaner way to capture, inspect, and
                ship fixes faster with a dashboard that feels built for real
                production work.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {[
                "Focused issue triage",
                "Shared team visibility",
                "Fast release feedback",
              ].map((item) => (
                <Paper
                  key={item}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 3,
                    backgroundColor: "rgba(13, 20, 34, 0.56)",
                  }}
                >
                  <Typography variant="body2">{item}</Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper
            elevation={0}
            sx={{
              height: "100%",
              mx: "auto",
              maxWidth: 480,
              p: { xs: 3, sm: 4.5 },
              borderRadius: "16px",
              background:
                "linear-gradient(180deg, rgba(13, 20, 34, 0.95) 0%, rgba(9, 15, 28, 0.92) 100%)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              backdropFilter: "blur(18px)",
            }}
          >
            <Box display="grid" gap={2.5}>
              {children}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
