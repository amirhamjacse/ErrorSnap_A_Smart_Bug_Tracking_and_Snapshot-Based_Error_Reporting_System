import { Badge, Divider, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import LogoutIcon from "icons/LogoutIcon";
import React from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { removeUser } from "store/features/auth";
import { zeroArgsFunction } from "types/function";
import { cssColor } from "utils/colors";
import { removeToken } from "utils/token";

export default function MenuItemsPopup({
  onClose,
  anchorEl,
}: {
  onClose: zeroArgsFunction;
  anchorEl: HTMLElement;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const open = Boolean(anchorEl);

  const handleLogout = () => {
    dispatch(removeUser());
    removeToken();
    navigate("/login");
    queryClient.clear();
  };

  return (
    <Badge variant="dot">
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={onClose}
        onClick={onClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              border: `1px solid ${cssColor("divider")}`,
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,

              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
                borderTop: `1px solid ${cssColor("divider")}`,
                borderLeft: `1px solid ${cssColor("divider")}`,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Link to="/assigned-errors">
          <MenuItem onClick={onClose}>Assigned Errors</MenuItem>
        </Link>
        <Link to="/invitations">
          <MenuItem onClick={onClose}>Invitations</MenuItem>
        </Link>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize={20} color={cssColor("white")} />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Badge>
  );
}
