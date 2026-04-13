import { Box, CircularProgress, Typography } from "@mui/material";
import { ReactNode } from "react";
import { cssColor } from "utils/colors";

interface ListContainerProps {
  error?: string;
  emptyText?: string;
  loading?: boolean;
  children: ReactNode;
  count?: number;
}

export default function ListContainer({
  children,
  error,
  emptyText,
  count = 1,
  loading,
}: ListContainerProps) {
  if (loading) {
    return (
      <Box width="100%" textAlign="center" p={4}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (count === 0) {
    return (
      <Box width="100%" textAlign="center" p={4}>
        <Typography>{emptyText || "No data found!"}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box width="100%" textAlign="center" p={4}>
        <Typography color={cssColor("error")}>{error}</Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
