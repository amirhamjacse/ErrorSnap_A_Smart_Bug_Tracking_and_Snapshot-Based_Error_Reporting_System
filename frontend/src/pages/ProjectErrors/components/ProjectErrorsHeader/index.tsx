import {
  Box,
  Button,
  Grid2 as Grid,
  Typography,
} from "@mui/material";
import PlugIcon from "icons/PlugIcon";
import SearchIcon from "icons/SearchIcon";
import SettingsIcon from "icons/SettingsIcon";
import React from "react";
import { Link, useParams } from "react-router-dom";
import Copy from "components/Copy";

export default function ProjectErrorsHeader({
  projectName,
  onOpenExport,
}: {
  projectName: string;
  onOpenExport: () => void;
}) {
  const { projectId } = useParams();

  return (
    <Grid container>
      <Grid size={{ xs: 12, md: 6 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            mb: { xs: 1, md: 0 },
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
            {projectName}
          </Typography>
          {projectId ? (
            <Copy
              copyText={projectId}
              fontSize={14}
              sx={{
                px: 1,
                borderRadius: 5,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                gap: 0.25,
                "& .MuiIconButton-root": {
                  p: 0.4,
                },
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {projectId}
              </Typography>
            </Copy>
          ) : null}
          <Link
            to={`/projects/${projectId}/settings/integration`}
            style={{ textDecoration: "none", display: "inline-flex" }}
          >
            <Button variant="outlined" startIcon={<PlugIcon />}>
              Integration Guide
            </Button>
          </Link>
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }} textAlign="right">
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "flex-start", md: "flex-end" },
            alignItems: "center",
            gap: 1,
            flexWrap: "nowrap",
            overflowX: "auto",
            pb: 0.5,
          }}
        >
          <Button
            onClick={onOpenExport}
            variant="outlined"
            startIcon={<SearchIcon />}
          >
            Export
          </Button>
          <Link
            to={`/projects/${projectId}/settings/team`}
            style={{ textDecoration: "none", display: "inline-flex" }}
          >
            <Button variant="contained" startIcon={<SettingsIcon />}>
              Settings
            </Button>
          </Link>
        </Box>
      </Grid>
    </Grid>
  );
}
