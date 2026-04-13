import DashboardLayout from "Layouts/DashboardLayout";
import ProjectSettings from "pages/ProjectSettings";
import Login from "pages/Login";
import ProjectErrorDetails from "pages/ProjectErrorDetails";
import ProjectErrors from "pages/ProjectErrors";
import Projects from "pages/Projects";
import Register from "pages/Register";
import { Navigate } from "react-router-dom";
import Invitations from "pages/Invitations";
import AuthGuard from "components/AuthGuard";
import AssignedErrors from "pages/AssignedErrors";

const routesConfig = [
  {
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      {
        path: "/projects",
        element: <Projects />,
      },
      {
        path: "/projects/:projectId/errors",
        element: <ProjectErrors />,
      },
      {
        path: "/projects/:projectId/errors/:errorId",
        element: <ProjectErrorDetails />,
      },
      {
        path: "/projects/:projectId/settings/team",
        element: <ProjectSettings />,
      },
      {
        path: "/projects/:projectId/settings/general",
        element: <ProjectSettings />,
      },
      {
        path: "/projects/:projectId/settings/integration",
        element: <ProjectSettings />,
      },
      {
        path: "/invitations",
        element: <Invitations />,
      },
      {
        path: "/assigned-errors",
        element: <AssignedErrors />,
      },
    ],
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/Login",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/projects" replace />,
  },
];

export default routesConfig;
