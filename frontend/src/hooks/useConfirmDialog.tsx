import React, { ReactNode, useCallback, useState } from "react";
import { setFunction, zeroArgsFunction } from "types/function";
import toast from "react-hot-toast";
import { CustomDialog } from "components/CustomDialog";
import { CircularProgress, Typography } from "@mui/material";
import DeleteIcon from "icons/DeleteIcon";

export interface useConfirmDialogProps {
  title?: string;
  description?: string;
  successMessage?: string;
  onAfterDelete?: zeroArgsFunction;
  startIcon?: ReactNode;
}

function useConfirmDialog<T1 = string | number>(
  onDelete: setFunction<T1>,
  {
    title,
    description,
    successMessage,
    onAfterDelete,
    startIcon = <DeleteIcon />,
  }: useConfirmDialogProps
) {
  const [deleteId, setDeleteId] = useState<T1>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = useCallback((id: T1) => setDeleteId(id), []);

  const handleClose = useCallback(() => {
    setDeleteId(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!deleteId) {
      return;
    }
    setLoading(true);

    try {
      await onDelete(deleteId);
      if (onAfterDelete) {
        await onAfterDelete();
      }
      toast.success(successMessage || "Successfully deleted");
    } catch (error) {
      toast.error(String(error));
    } finally {
      handleClose();
      setLoading(false);
    }
  }, [onDelete, deleteId, handleClose, successMessage, onAfterDelete]);

  const component = (
    <CustomDialog
      open={!!deleteId}
      onSubmit={handleConfirm}
      onClose={handleClose}
      maxWidth="xs"
      title={title}
      disabled={loading}
      startIcon={loading ? <CircularProgress /> : startIcon}
    >
      <Typography>{description}</Typography>
    </CustomDialog>
  );

  return {
    component,
    handleDelete,
  };
}

export default useConfirmDialog;
