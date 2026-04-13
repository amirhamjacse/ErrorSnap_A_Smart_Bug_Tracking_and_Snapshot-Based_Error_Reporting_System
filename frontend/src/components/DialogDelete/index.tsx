import { Typography } from "@mui/material";
import { CustomDialog, CustomDialogProps } from "components/CustomDialog";
import DeleteIcon from "icons/DeleteIcon";
import React from "react";

type DialogDeleteProps = Omit<CustomDialogProps, "startIcon">;

export default function DialogDelete({
  title,
  children,
  ...rest
}: DialogDeleteProps) {
  return (
    <CustomDialog
      startIcon={<DeleteIcon />}
      maxWidth="xs"
      title={title || "Delete"}
      {...rest}
    >
      <Typography>{children || "Are you sure you want to delete?"}</Typography>
    </CustomDialog>
  );
}
