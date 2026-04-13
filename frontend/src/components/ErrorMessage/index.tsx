import { Box, Typography } from "@mui/material";

export default function ErrorMessage({ message }: { message: string }) {
  return (
    <Box p={[2, 4]} textAlign="center">
      <Typography color="error">{message}</Typography>
    </Box>
  );
}
