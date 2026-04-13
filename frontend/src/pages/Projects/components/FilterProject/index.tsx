import { Box, Chip, Stack } from "@mui/material";
import useFilterChange from "hooks/useFilterChange";

const chips = [
  {
    id: "",
    label: "All",
  },
  {
    id: "me",
    label: "Created by me",
  },
  {
    id: "assigned",
    label: "Assigned",
  },
];

export default function FilterProject() {
  const { value, handleChange } = useFilterChange("filterBy", "");

  return (
    <Box>
      <Stack direction="row" spacing={1}>
        {chips.map((chip) => (
          <Chip
            key={chip.id}
            label={chip.label}
            clickable
            color={value === chip.id ? "primary" : "default"}
            onClick={() => handleChange(chip.id)}
          />
        ))}
      </Stack>
    </Box>
  );
}
