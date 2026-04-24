import {
  Box,
  Grid2 as Grid,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import useFilterChange from "hooks/useFilterChange";
import useFilterChangeInput from "hooks/useFilterChangeInput";
import SearchIcon from "icons/SearchIcon";
import { environmentOptions } from "types/environment";
import { cssColor } from "utils/colors";

export default function ErrorFilters() {
  const { value, handleChange } = useFilterChange("status", "active");
  const { value: environment, handleChange: handleEnvironmentChange } =
    useFilterChange("environment", "");
  const { handleChange: handlePageChange } = useFilterChange("page", 1);
  const { value: queryValue, handleChange: handleChangeQuery } =
    useFilterChangeInput("query", "", 300, () => handlePageChange(1));

  const handleChangeStatus = (e) => {
    handleChange(e.target.value);
    handlePageChange(1);
  };

  return (
    <Box
      p={1}
      sx={{
        backgroundColor: cssColor("backgroundShade"),
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 7, md: 8 }}>
          <TextField
            value={queryValue}
            onChange={handleChangeQuery}
            size="small"
            placeholder="Search errors by name or id"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color={cssColor("textPrimary")} />
                  </InputAdornment>
                ),
              },
            }}
            name="search"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 2.5, md: 2 }}>
          <TextField
            fullWidth
            select
            size="small"
            sx={{
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: cssColor("divider"),
              },
            }}
            value={value}
            label="Status"
            onChange={handleChangeStatus}
          >
            <MenuItem value="active">Open</MenuItem>
            <MenuItem value={0}>Unresolved</MenuItem>
            <MenuItem value={1}>Pending</MenuItem>
            <MenuItem value={2}>Resolved</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 2.5, md: 2 }}>
          <TextField
            fullWidth
            select
            size="small"
            sx={{
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: cssColor("divider"),
              },
            }}
            value={environment}
            label="Environment"
            onChange={(e) => {
              handleEnvironmentChange(e.target.value);
              handlePageChange(1);
            }}
          >
            {environmentOptions.map((item) => (
              <MenuItem key={item.value || "all"} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
}
