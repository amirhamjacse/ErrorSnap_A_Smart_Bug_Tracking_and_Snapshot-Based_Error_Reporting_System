import { Container, ContainerProps } from "@mui/material";
import { ReactNode } from "react";

interface PageContainerProps extends ContainerProps {
  children: ReactNode;
}

export default function PageContainer({
  children,
  ...rest
}: PageContainerProps) {
  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 3, md: 4 },
        px: { xs: 2, sm: 3 },
      }}
      {...rest}
    >
      {children}
    </Container>
  );
}
