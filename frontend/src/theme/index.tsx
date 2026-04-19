/* eslint-disable @typescript-eslint/no-empty-object-type */
import { alpha, ThemeOptions } from "@mui/material/styles";
import { cssColor } from "utils/colors";

export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

const theme: ThemeOptions = {
  shape: {
    borderRadius: 8,
  },
  typography: {
    allVariants: {
      color: cssColor("textPrimary"),
    },
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: "clamp(2.35rem, 5vw, 4.6rem)",
      lineHeight: 1.2,
      fontWeight: 700,
      letterSpacing: "-0.04em",
    },
    h2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: "clamp(1.9rem, 3vw, 2.8rem)",
      lineHeight: 1.3,
      fontWeight: 600,
      letterSpacing: "-0.03em",
    },
    h3: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: "clamp(1.5rem, 2vw, 2rem)",
      lineHeight: 1.3,
      fontWeight: 600,
      letterSpacing: "-0.02em",
    },
    h4: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: "clamp(1.25rem, 1.6vw, 1.5rem)",
      lineHeight: 1.35,
      fontWeight: 600,
    },
    body1: {
      fontSize: "16px",
      lineHeight: 1.5,
      fontWeight: 400,
    },
    body2: {
      fontSize: "14px",
      lineHeight: 1.43,
      fontWeight: 300,
    },
    button: {
      fontSize: "14px",
      lineHeight: 1.75,
      fontWeight: 500,
      textTransform: "none",
    },
    caption: {
      fontSize: "12px",
      lineHeight: 1.4,
      fontWeight: 300,
    },
  },
  palette: {
    white: "#ffffff",
    primary: {
      main: "#6c8cff",
    },
    secondary: {
      main: "#7c5cff",
    },
    backgroundShade: "#0f1728",
    background: {
      default: "#08101f",
      paper: "rgba(13, 20, 34, 0.88)",
    },
    text: {
      primary: "#eef2ff",
      secondary: "#b8c4e0",
    },
    divider: "rgba(148, 163, 184, 0.18)",
    error: {
      main: "#ff8a76",
    },
    red: "#c2415d",
    action: {
      hover: "rgba(255, 255, 255, 0.06)",
    },
  },
  breakpoints: {
    values: BREAKPOINTS,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(circle at top left, rgba(108, 140, 255, 0.18), transparent 35%), radial-gradient(circle at top right, rgba(124, 92, 255, 0.16), transparent 28%), linear-gradient(180deg, #08101f 0%, #0a1324 48%, #060b16 100%)",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage:
            "linear-gradient(180deg, rgba(8, 16, 31, 0.88), rgba(8, 16, 31, 0.7))",
          backdropFilter: "blur(18px) saturate(180%)",
          borderBottom: `1px solid ${alpha("#94a3b8", 0.14)}`,
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(13, 20, 34, 0.88)",
          border: `1px solid ${alpha("#94a3b8", 0.14)}`,
          boxShadow: "0 24px 80px rgba(2, 6, 23, 0.35)",
          backdropFilter: "blur(18px)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          backgroundImage: "none",
          backgroundColor: "rgba(13, 20, 34, 0.9)",
          border: `1px solid ${alpha("#94a3b8", 0.14)}`,
          boxShadow: "0 24px 80px rgba(2, 6, 23, 0.28)",
          transition:
            "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "24px",
          paddingRight: "24px",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha("#94a3b8", 0.16),
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: alpha("#0f172a", 0.72),
            backdropFilter: "blur(14px)",
            transition: "border-color 160ms ease, box-shadow 160ms ease",
            "& fieldset": {
              borderColor: alpha("#94a3b8", 0.2),
            },
            "&:hover fieldset": {
              borderColor: alpha("#cbd5e1", 0.46),
            },
            "&.Mui-focused fieldset": {
              borderColor: "#6c8cff",
            },
            "&.Mui-focused": {
              boxShadow: `0 0 0 4px ${alpha("#6c8cff", 0.16)}`,
            },
            "&.Mui-disabled": {
              backgroundColor: alpha("#94a3b8", 0.08),
              "& fieldset": {
                borderColor: alpha("#94a3b8", 0.22),
              },
            },
          },
          "& .MuiInputLabel-root": {
            color: cssColor("textSecondary"),
          },
          "& .MuiInputBase-input": {
            color: cssColor("white"),
          },
          "& .MuiInputBase-root.Mui-disabled": {
            backgroundColor: alpha("#94a3b8", 0.08),
          },
          "& .Mui-disabled .MuiOutlinedInput-notchedOutline": {
            borderColor: cssColor("textSecondary"),
          },
          "& .MuiInputBase-input.Mui-disabled": {
            color: alpha("#e2e8f0", 0.72),
            WebkitTextFillColor: `${alpha("#e2e8f0", 0.72)} !important`,
            opacity: 1,
          },
          "& .MuiInputLabel-root.Mui-disabled": {
            color: alpha("#e2e8f0", 0.7),
          },
          "& .Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: cssColor("error"),
          },
          "& .Mui-error .MuiInputLabel-root": {
            color: cssColor("error"),
          },
          "& .Mui-error .MuiInputBase-input": {
            color: cssColor("error"),
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: cssColor("white"),
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: cssColor("white"),
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: cssColor("white"),
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 700,
          paddingInline: "18px",
          boxShadow: "none",
          transition:
            "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },

          "&.Mui-disabled": {
            backgroundColor: alpha("#94a3b8", 0.12),
            color: alpha("#e2e8f0", 0.36),
          },
        },
        contained: {
          backgroundImage: "linear-gradient(135deg, #6c8cff 0%, #7c5cff 100%)",
          color: "#fff",
          boxShadow: "0 18px 40px rgba(108, 140, 255, 0.22)",
          "&:hover": {
            backgroundImage:
              "linear-gradient(135deg, #8197ff 0%, #8f70ff 100%)",
            boxShadow: "0 22px 48px rgba(108, 140, 255, 0.28)",
          },
        },
        outlined: {
          borderColor: alpha("#cbd5e1", 0.18),
          color: cssColor("white"),
          backgroundColor: alpha("#0f172a", 0.32),
          "&:hover": {
            borderColor: alpha("#cbd5e1", 0.3),
            backgroundColor: alpha("#ffffff", 0.05),
          },
        },
        text: {
          "&:hover": {
            backgroundColor: alpha("#ffffff", 0.05),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
          backgroundImage: "none",
          border: `1px solid ${alpha("#94a3b8", 0.14)}`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
        indicator: {
          height: 3,
          borderRadius: 999,
          backgroundImage: "linear-gradient(135deg, #6c8cff 0%, #7c5cff 100%)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 44,
          padding: "12px 16px",
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 700,
          color: alpha("#e2e8f0", 0.72),
          "&.Mui-selected": {
            color: "#ffffff",
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          overflow: "hidden",
          backgroundColor: "rgba(13, 20, 34, 0.88)",
          border: `1px solid ${alpha("#94a3b8", 0.14)}`,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: alpha("#94a3b8", 0.14),
          paddingTop: 18,
          paddingBottom: 18,
        },
        head: {
          color: alpha("#e2e8f0", 0.8),
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          backgroundColor: alpha("#ffffff", 0.02),
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "16px",
          backgroundImage: "none",
          backgroundColor: "rgba(13, 20, 34, 0.96)",
          border: `1px solid ${alpha("#94a3b8", 0.16)}`,
          boxShadow: "0 36px 120px rgba(2, 6, 23, 0.5)",
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(2, 6, 23, 0.72)",
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundImage: "linear-gradient(135deg, #6c8cff 0%, #7c5cff 100%)",
          color: "#ffffff",
          fontWeight: 800,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#0f172a",
          border: `1px solid ${alpha("#94a3b8", 0.16)}`,
          borderRadius: 12,
          boxShadow: "0 18px 48px rgba(2, 6, 23, 0.28)",
        },
      },
    },
  },
};

export interface CustomColorNames {
  primary: true;
  white: true;
  secondary: true;
  background: true;
  backgroundShade: string;
  paper: true;
  textPrimary: true;
  textSecondary: true;
  divider: true;
  error: true;
  hover: true;
  red: true;
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides extends CustomColorNames {}
}

declare module "@mui/material/styles" {
  interface Palette {
    white: string;
    red: string;
    backgroundShade: string;
  }

  interface PaletteOptions {
    white?: string;
    red?: string;
    backgroundShade?: string;
  }
}

export default theme;
