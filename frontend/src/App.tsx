import { Box } from "@mui/material";
import RoutProvider from "./routes/Provider";
import { cssColor } from "utils/colors";
import { Toaster } from "react-hot-toast";
import AppEvents from "components/AppEvents";
import AppLoader from "components/AppLoader";
import GlobalFetchingLoader from "components/GlobalFetchingLoader";
import ServerSpinnerToast from "components/ServerSpinnerToast";

function App() {
  return (
    <>
      <Toaster />
      <Box
        width="100%"
        minHeight="100dvh"
        position="relative"
        overflow="hidden"
        sx={{
          background:
            "radial-gradient(circle at top left, rgba(108, 140, 255, 0.1), transparent 28%), radial-gradient(circle at top right, rgba(124, 92, 255, 0.08), transparent 24%), linear-gradient(180deg, rgba(8, 16, 31, 0.72) 0%, rgba(6, 11, 22, 0.92) 100%)",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 32%, rgba(255,255,255,0.02) 68%, transparent 100%)",
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: "-12rem",
            right: "-10rem",
            width: "26rem",
            height: "26rem",
            borderRadius: "999px",
            background: "rgba(124, 92, 255, 0.08)",
            filter: "blur(80px)",
            pointerEvents: "none",
          },
        }}
      >
        <ServerSpinnerToast />
        <AppEvents />
        <Box position="relative" zIndex={1}>
          <AppLoader>
            <GlobalFetchingLoader />
            <RoutProvider />
          </AppLoader>
        </Box>
      </Box>
    </>
  );
}

export default App;
