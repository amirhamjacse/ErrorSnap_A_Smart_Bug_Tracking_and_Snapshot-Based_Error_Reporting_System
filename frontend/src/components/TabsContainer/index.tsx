import { Box, Tab, TabProps, Tabs, Typography } from "@mui/material";
import { IconWrapperProps } from "components/IconWrapper";
import { ComponentType } from "react";
import { cssColor } from "utils/colors";

interface TabItemProps extends TabProps {
  Icon?: ComponentType<Omit<IconWrapperProps, "icon">>;
  label: string;
}

const TabItem = ({ Icon, label, ...props }: TabItemProps) => {
  return (
    <Tab
      sx={{
        p: "4px 0px",
        minHeight: "0px",
        minWidth: "0px",
      }}
      label={
        <Box display="flex" alignItems="center">
          <Icon fontSize={16} mr={1} />
          <Typography>{label}</Typography>
        </Box>
      }
      {...props}
    />
  );
};

function TabsContainer({ value, onChange, children }) {
  return (
    <Tabs
      variant="scrollable"
      value={value}
      onChange={onChange}
      sx={{
        minHeight: "33px",
        position: "relative",

        ".Mui-selected": {
          color: `${cssColor("white")} !important`,
        },
        ".MuiTabs-indicator": {
          borderRadius: "3px",
          backgroundColor: cssColor("white"),
        },

        ".MuiTabs-flexContainer": {
          gap: {
            lg: "25px",
            sm: "15px",
          },
        },
      }}
    >
      {children}
    </Tabs>
  );
}

TabsContainer.item = TabItem;

export default TabsContainer;
