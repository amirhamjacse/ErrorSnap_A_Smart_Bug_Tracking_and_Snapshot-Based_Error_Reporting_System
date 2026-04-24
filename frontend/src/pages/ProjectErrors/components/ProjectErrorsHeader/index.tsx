import {
  Box,
  Button,
  CircularProgress,
  Grid2 as Grid,
  Typography,
} from "@mui/material";
import DownloadIcon from "icons/DownloadIcon";
import PlugIcon from "icons/PlugIcon";
import SearchIcon from "icons/SearchIcon";
import SettingsIcon from "icons/SettingsIcon";
import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { queryStringParse } from "utils/querystring";
import { apiClient } from "utils/axios";
import toast from "react-hot-toast";

export default function ProjectErrorsHeader({
  projectName,
  onOpenFilteredExport,
}: {
  projectName: string;
  onOpenFilteredExport: () => void;
}) {
  const { projectId } = useParams();
  const location = useLocation();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportLogs = async () => {
    if (!projectId || isExporting) {
      return;
    }

    const queryParams = queryStringParse(location.search);
    const query = queryParams?.query || "";
    const status = queryParams?.status ?? "active";
    const environment = queryParams?.environment || "";
    const page = Number(queryParams?.page) > 0 ? Number(queryParams?.page) : 1;
    const limit =
      Number(queryParams?.limit) > 0 ? Number(queryParams?.limit) : 10;

    setIsExporting(true);
    try {
      const response = await apiClient.get(`/error-logs/${projectId}/export`, {
        params: {
          query,
          status,
          environment,
          page,
          limit,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeProjectName = (projectName || "project")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      link.href = url;
      link.setAttribute(
        "download",
        `${safeProjectName || "project"}-error-logs.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Error logs exported successfully");
    } catch {
      toast.error("Error exporting logs");
    } finally {
      setIsExporting(false);
    }
  };

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
            onClick={onOpenFilteredExport}
            variant="outlined"
            startIcon={<SearchIcon />}
          >
            Filtered Export
          </Button>
          <Button
            disabled={isExporting}
            onClick={handleExportLogs}
            variant="outlined"
            startIcon={
              isExporting ? <CircularProgress size={14} /> : <DownloadIcon />
            }
          >
            Export Logs
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
