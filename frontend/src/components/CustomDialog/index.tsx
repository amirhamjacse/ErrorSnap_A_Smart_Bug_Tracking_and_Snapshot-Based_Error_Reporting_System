import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Button,
  DialogProps,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "icons/CloseIcon";
import { zeroArgsFunction } from "types/function";
import { cssColor } from "utils/colors";

export interface CustomDialogProps extends Omit<DialogProps, "title"> {
  open: boolean;
  disabled?: boolean;
  title: string;
  submitText?: string;
  children: React.ReactNode;
  startIcon?: React.ReactNode;
  onClose: zeroArgsFunction;
  onSubmit?: zeroArgsFunction;
}

export const CustomDialog = ({
  open,
  onClose,
  disabled = false,
  submitText = "",
  title,
  startIcon,
  onSubmit,
  children,
  ...rest
}: CustomDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={!disabled ? onClose : null}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          bgcolor: "background.paper",
          backgroundImage:
            "linear-gradient(180deg, rgba(13, 20, 34, 0.98), rgba(9, 15, 28, 0.98))",
        },
      }}
      {...rest}
    >
      <DialogTitle
        sx={{ pb: 2, borderBottom: `1px solid ${cssColor("divider")}` }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="span">
            {title}
          </Typography>
          <IconButton onClick={onClose} size="small" edge="end">
            <CloseIcon color={cssColor("white")} fontSize={20} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>{children}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          disabled={disabled}
          onClick={onClose}
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          startIcon={
            disabled ? (
              <CircularProgress
                size={15}
                sx={{ color: cssColor("textSecondary") }}
              />
            ) : (
              startIcon || null
            )
          }
          disabled={disabled}
          onClick={onSubmit}
          variant="contained"
        >
          {submitText || "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
