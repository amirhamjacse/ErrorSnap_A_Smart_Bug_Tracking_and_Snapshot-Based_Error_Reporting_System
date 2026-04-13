import { ReactNode } from "react";
import { Outlet } from "react-router-dom";

export default function ProjectSettings({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <>
      <Outlet />
      {children}
    </>
  );
}
