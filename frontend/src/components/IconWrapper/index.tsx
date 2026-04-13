import { ElementType, memo, useMemo } from "react";
import { Box, BoxProps } from "@mui/material";
import { Icon as IconifyIcon } from "@iconify/react";
import { cssColor } from "utils/colors";

export type IconWrapperFontSize = "small" | "large" | "medium" | number;

export interface IconWrapperProps extends BoxProps {
  fontSize?: IconWrapperFontSize;
  icon: ElementType | string;
}

const getFixedFontSize = (fontSize: IconWrapperFontSize) => {
  switch (fontSize) {
    case "small":
      return 12;
    case "medium":
      return 24;
    case "large":
      return 48;
    default:
      return fontSize;
  }
};

const IconWrapper = ({
  fontSize = "medium",
  icon: Icon,
  sx = {},
  ...props
}: IconWrapperProps) => {
  const fixedFontSize = useMemo(() => {
    return getFixedFontSize(fontSize);
  }, [fontSize]);

  const fixedSX = useMemo(() => {
    return {
      width: fixedFontSize,
      height: fixedFontSize,
      display: "flex",
      justifyContent: "center",
      ...sx,
    };
  }, [fixedFontSize, sx]);

  return (
    <Box {...props} sx={fixedSX}>
      <IconifyIcon
        icon={Icon as string}
        fontSize={fixedFontSize}
        color={cssColor("white")}
      />
    </Box>
  );
};

export default memo(IconWrapper);
