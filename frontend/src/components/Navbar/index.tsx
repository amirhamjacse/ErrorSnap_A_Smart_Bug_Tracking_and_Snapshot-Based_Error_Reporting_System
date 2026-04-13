import { AppBar, Box, Stack, Typography } from "@mui/material";
import PageContainer from "components/PageContainer";
import { useNavigate } from "react-router-dom";
import { cssColor } from "utils/colors";
import MenuItems from "./components/MenuItems";

export default function Navbar() {
  const navigate = useNavigate();

  const RedirectToHome = () => {
    navigate("/projects");
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          height: { xs: "68px", md: "76px" },
        }}
      >
        <PageContainer sx={{ height: "100%" }}>
          <Box height="100%" display="flex" alignItems="center">
            <Stack
              onClick={RedirectToHome}
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ cursor: "pointer", flexGrow: 1, minWidth: 0 }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  background:
                    "linear-gradient(135deg, rgba(108, 140, 255, 0.28), rgba(124, 92, 255, 0.28))",
                  border: `1px solid ${cssColor("divider")}`,
                  boxShadow: "0 16px 35px rgba(108, 140, 255, 0.12)",
                }}
              >
                <Box width="24px" component="img" src="/bug.svg" />
              </Box>
              <Box>
                <Typography variant="h6" component="div" sx={{ lineHeight: 1.1 }}>
                  ErrorSnap
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Issue intelligence for shipped code
                </Typography>
              </Box>
            </Stack>

            <MenuItems />
          </Box>
        </PageContainer>
      </AppBar>
    </>
  );
}
