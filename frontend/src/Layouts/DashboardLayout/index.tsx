import Navbar from "components/Navbar";
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";

export default function DashboardLayout({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Outlet />
      {children}
    </>
  );
}
