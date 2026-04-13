import {
  RouterProvider as RouterProviderDOM,
  createBrowserRouter,
} from "react-router-dom";
import { memo, ReactNode } from "react";
import routesConfig from "../index";

export interface RouterProviderProps {
  children?: ReactNode | ReactNode[];
}

const router = createBrowserRouter(routesConfig);

const RoutProvider = () => {
  return <RouterProviderDOM router={router} />;
};

export default memo(RoutProvider);
