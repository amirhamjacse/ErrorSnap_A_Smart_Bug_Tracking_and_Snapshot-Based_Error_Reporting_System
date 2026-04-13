import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  responsiveFontSizes,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ReactNode } from "react";
import theme from "..";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const newTheme = responsiveFontSizes(createTheme(theme));

  return (
    <MuiThemeProvider theme={newTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
