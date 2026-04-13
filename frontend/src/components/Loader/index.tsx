import { Box, BoxProps, CircularProgress } from "@mui/material";
import { cssColor } from "utils/colors";

interface LoaderProps extends BoxProps {
  size?: number;
}

export default function Loader({ size = 30, ...props }: LoaderProps) {
  return (
    <Box display="flex" justifyContent="center" p={[2, 6]} {...props}>
      <CircularProgress
        size={size}
        sx={{
          color: cssColor("white"),
        }}
      />
    </Box>
  );
}
