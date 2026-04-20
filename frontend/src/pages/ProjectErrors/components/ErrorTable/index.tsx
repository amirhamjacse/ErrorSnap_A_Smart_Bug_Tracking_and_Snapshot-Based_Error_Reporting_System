import {
  Box,
  Chip,
  MenuItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { cssColor } from "utils/colors";
import { Link, useLocation } from "react-router-dom";
import ListContainer from "components/ListContainer";
import { errorStatus } from "types/logs";
import { getTimeAgo } from "utils/time";
import { getBrowserIcon } from "utils/icon";
import useErrors from "hooks/useErrors";
import useFilterChange from "hooks/useFilterChange";
import useProjectId from "hooks/useProjectId";
import {
  environmentColorMap,
  normalizeEnvironmentLabel,
} from "types/environment";

export default function ErrorTable() {
  const { value: status } = useFilterChange("status", 0);
  const { value: query } = useFilterChange("query", "");
  const { value: environment } = useFilterChange("environment", "");
  const { value: page, handleChange: handlePageChange } = useFilterChange(
    "page",
    1,
  );
  const { value: limit, handleChange: handleLimitChange } = useFilterChange(
    "limit",
    10,
  );
  const location = useLocation();
  const projectId = useProjectId();

  const {
    data: errorLogs,
    isLoading,
    error,
  } = useErrors({
    projectId,
    query,
    status,
    environment: String(environment),
    page,
    limit,
  });

  const currentPage = Number(page) > 0 ? Number(page) : 1;
  const rowsPerPage = Number(limit) > 0 ? Number(limit) : 10;
  const totalPages = Math.max(errorLogs?.pagination?.totalPages || 1, 1);

  const onPageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    handlePageChange(value);
  };

  const onLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextLimit = Number(event.target.value);
    handleLimitChange({ limit: nextLimit, page: 1 });
  };

  return (
    <ListContainer
      loading={isLoading}
      error={error?.message}
      count={errorLogs?.data?.length}
    >
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "#22252B",
          mt: 3,
        }}
      >
        <Table sx={{ minWidth: 800, "& td, & th": { border: 0 } }}>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Environment</TableCell>
              <TableCell>OS</TableCell>
              <TableCell>Browser</TableCell>
              <TableCell>First seen</TableCell>
              <TableCell>Assigned</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {errorLogs?.data?.map((error) => (
              <TableRow
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: cssColor("background"),
                  },
                }}
                key={error?.id}
              >
                <TableCell>{error?.id}</TableCell>
                <TableCell component="th" scope="row">
                  <Link
                    to={`${location.pathname}/${error?.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Typography>{error?.message}</Typography>
                  </Link>
                </TableCell>
                <TableCell>{errorStatus[error?.status]}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={normalizeEnvironmentLabel(error?.environment)}
                    color={environmentColorMap[error?.environment] || "default"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{error?.os}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getBrowserIcon(error?.browser)} {error?.browser}
                  </Box>
                </TableCell>
                <TableCell>{getTimeAgo(error?.created_at)}</TableCell>
                <TableCell>{error?.assignee_id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        mt={2}
        px={0.5}
        display="flex"
        flexWrap="wrap"
        gap={2}
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography color="text.secondary" variant="body2">
          Showing {errorLogs?.data?.length || 0} of{" "}
          {errorLogs?.pagination?.total || 0} errors
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            select
            size="small"
            label="Rows"
            value={String(rowsPerPage)}
            onChange={onLimitChange}
            sx={{ minWidth: 100 }}
          >
            {[10, 20, 50].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <Pagination
            page={Math.min(currentPage, totalPages)}
            count={totalPages}
            onChange={onPageChange}
            shape="rounded"
            color="primary"
            siblingCount={1}
            boundaryCount={1}
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 600,
              },
            }}
          />
        </Box>
      </Box>
    </ListContainer>
  );
}
