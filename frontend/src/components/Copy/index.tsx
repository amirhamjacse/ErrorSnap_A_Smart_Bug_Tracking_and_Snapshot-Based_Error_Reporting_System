import {
  Box,
  IconButton,
  SxProps,
  Theme,
  Tooltip,
  Typography,
} from "@mui/material";
import { MutableRefObject, ReactNode, useRef } from "react";
import fieldToClipboard from "libs/fieldtoclipboard";
import { cssColor } from "utils/colors";
import { zeroArgsFunction } from "types/function";
import toast from "react-hot-toast";
import CopyIcon from "icons/CopyIcon";

export interface CopyProps {
  children: ReactNode;
  fontSize?: number;
  targetRef?: MutableRefObject<unknown>;
  onAfterCopy?: zeroArgsFunction;
  sx?: SxProps<Theme>;
}

const Copy = ({
  children = null,
  fontSize = 18,
  targetRef = null,
  onAfterCopy,
  sx,
}: CopyProps) => {
  const elementRef = useRef(null);
  const handleCopyToClipboard = () => {
    fieldToClipboard.copyfield(
      null,
      targetRef?.current || elementRef?.current,
      () => {}
    );
    toast.success(<Typography sx={{ color: "#000" }}>Copied to clipboard</Typography>);
    if (onAfterCopy) {
      onAfterCopy();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        ...sx,
      }}
    >
      <Box ref={elementRef}>{children}</Box>
      <Tooltip title="Copy" arrow>
        <IconButton onClick={handleCopyToClipboard}>
          <CopyIcon fontSize={fontSize} color={cssColor("textSecondary")} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Copy;
