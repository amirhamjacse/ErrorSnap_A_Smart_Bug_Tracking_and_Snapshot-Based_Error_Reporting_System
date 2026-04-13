import { Avatar, Badge, Box, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import useAuthUser from "hooks/useAuthUser";
import MenuItemsPopup from "../MenuItemsPopup";
import useHasInvitation from "hooks/useHasInvitation";

export default function MenuItems() {
  const { user } = useAuthUser();
  const { data, isLoading } = useHasInvitation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Link to="/projects" style={{ textDecoration: "none" }}>
          <Typography sx={{ minWidth: 100, cursor: "pointer" }}>
            Projects
          </Typography>
        </Link>
        <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
          <Badge
            variant="dot"
            color="error"
            invisible={isLoading ? false : !data}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user.username[0].toUpperCase()}
            </Avatar>
          </Badge>
        </IconButton>
      </Box>
      <MenuItemsPopup onClose={handleClose} anchorEl={anchorEl} />
    </>
  );
}
