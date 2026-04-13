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
import { cssColor } from "utils/colors";

export default function ErrorFilters() {
  const { value, handleChange } = useFilterChange("status", 0);
  const { value: queryValue, handleChange: handleChangeQuery } =
    useFilterChangeInput("query", "");

  const handleChangeStatus = (e) => {
    handleChange(e.target.value);
  };

  return (
    <Box
      p={1}
      sx={{
        backgroundColor: cssColor("backgroundShade"),
      }}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 9, md: 10 }}>
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
        <Grid size={{ xs: 12, sm: 3, md: 2 }}>
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
            <MenuItem value={0}>Unresolve</MenuItem>
            <MenuItem value={1}>Pending</MenuItem>
            <MenuItem value={2}>Resolved</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
}
