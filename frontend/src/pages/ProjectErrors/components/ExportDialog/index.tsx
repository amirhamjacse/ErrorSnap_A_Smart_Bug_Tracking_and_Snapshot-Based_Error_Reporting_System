import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "utils/axios";
import { useState } from "react";

interface ExportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  browser?: string;
  os?: string;
  environment?: string;
  search?: string;
}

interface ExportPreview {
  totalErrors: number;
  filteredErrors: number;
  sample: Array<{
    id: number;
    message: string;
    browser: string;
    status: string;
    createdAt: string;
  }>;
}

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export default function ExportDialog({
  open,
  onClose,
  projectId,
}: ExportDialogProps) {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [filters, setFilters] = useState<ExportFilters>({});
  const [preview, setPreview] = useState<ExportPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const { mutateAsync: getPreview, isPending: previewLoading } = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(
        `/export/${projectId}/preview`,
        filters
      );
      return response.data?.data as ExportPreview;
    },
  });

  const { mutateAsync: downloadExport, isPending: downloadLoading } =
    useMutation({
      mutationFn: async () => {
        const endpoint =
          format === "csv"
            ? `/export/${projectId}/csv`
            : `/export/${projectId}/json`;
        const response = await apiClient.post(endpoint, filters, {
          responseType: "blob",
        });
        return response.data;
      },
    });

  const handleFilterChange = (
    key: keyof ExportFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : value,
    }));
  };

  const handlePreview = async () => {
    try {
      const result = await getPreview();
      setPreview(result);
      setShowPreview(true);
    } catch (error) {
      console.error("Failed to generate preview", error);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadExport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const filename = `errors_${projectId}_${new Date().getTime()}.${
        format === "csv" ? "csv" : "json"
      }`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (error) {
      console.error("Failed to download export", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
        },
      }}
    >
      <DialogTitle>Export Errors</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          {/* Format Selection */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Export Format
            </Typography>
            <RadioGroup
              value={format}
              onChange={(e) => setFormat(e.target.value as "csv" | "json")}
            >
              <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              <FormControlLabel value="json" control={<Radio />} label="JSON" />
            </RadioGroup>
          </Box>

          <Divider />

          {/* Filters */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Filters (Optional)
            </Typography>
            <Stack spacing={2}>
              {/* Date Range */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  size="small"
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  fullWidth
                />
                <TextField
                  size="small"
                  type="date"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={filters.endDate || ""}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  fullWidth
                />
              </Stack>

              {/* Status */}
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ""}
                  label="Status"
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="0">Unresolved</MenuItem>
                  <MenuItem value="1">Pending</MenuItem>
                  <MenuItem value="2">Resolved</MenuItem>
                </Select>
              </FormControl>

              {/* Browser */}
              <TextField
                size="small"
                label="Browser (contains)"
                placeholder="e.g., Chrome"
                value={filters.browser || ""}
                onChange={(e) => handleFilterChange("browser", e.target.value)}
                fullWidth
              />

              {/* OS */}
              <TextField
                size="small"
                label="OS (contains)"
                placeholder="e.g., Windows"
                value={filters.os || ""}
                onChange={(e) => handleFilterChange("os", e.target.value)}
                fullWidth
              />

              {/* Environment */}
              <FormControl size="small" fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={filters.environment || ""}
                  label="Environment"
                  onChange={(e) =>
                    handleFilterChange("environment", e.target.value)
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="production">Production</MenuItem>
                  <MenuItem value="staging">Staging</MenuItem>
                  <MenuItem value="development">Development</MenuItem>
                </Select>
              </FormControl>

              {/* Search */}
              <TextField
                size="small"
                label="Search in message"
                placeholder="Find errors..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                fullWidth
              />
            </Stack>
          </Box>

          {/* Preview Button & Results */}
          <Box>
            <Button
              variant="outlined"
              onClick={handlePreview}
              disabled={previewLoading || showPreview}
              fullWidth
            >
              {previewLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Generating Preview...
                </>
              ) : (
                "Preview Export"
              )}
            </Button>

            {showPreview && preview && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>{preview.filteredErrors}</strong> of{" "}
                    <strong>{preview.totalErrors}</strong> errors match your
                    filters.
                  </Typography>
                </Alert>

                {preview.filteredErrors > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Sample (First 5)
                    </Typography>
                    <TableContainer component={Paper} sx={{ mt: 1 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell>Message</TableCell>
                            <TableCell>Browser</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {preview.sample.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell
                                sx={{
                                  maxWidth: 150,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <Typography variant="caption">
                                  {item.message}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption">
                                  {item.browser}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption">
                                  {item.status}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          disabled={downloadLoading || preview?.filteredErrors === 0}
        >
          {downloadLoading ? (
            <>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Downloading...
            </>
          ) : (
            `Download ${format.toUpperCase()}`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
