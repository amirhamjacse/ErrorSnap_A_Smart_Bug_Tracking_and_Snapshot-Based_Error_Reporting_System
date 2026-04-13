import React, { useEffect, ReactNode } from "react";
import useAuthUser from "hooks/useAuthUser";
import { useNavigate } from "react-router-dom";

const AuthGuard = ({ children = null }: { children: ReactNode }) => {
  const { user } = useAuthUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return user ? <>{children}</> : null;
};

export default AuthGuard;
