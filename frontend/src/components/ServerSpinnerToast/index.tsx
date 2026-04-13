import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import useAuthUser from "hooks/useAuthUser";

const ServerSpinnerToast = () => {
  const { isInitialized } = useAuthUser();
  const toastId = useRef(null);

  useEffect(() => {
    const COOKIE_NAME = "lastVisitTime";
    const COOKIE_EXPIRY_MINUTES = 15;

    const lastVisitTime = Cookies.get(COOKIE_NAME);

    if (!lastVisitTime) {
      toastId.current = toast.loading(
        "For the fist time it can take some time to spin up the server",
        { duration: 5000 }
      );
    }

    Cookies.set(COOKIE_NAME, new Date().toISOString(), {
      expires: COOKIE_EXPIRY_MINUTES / (24 * 60),
    });
  }, []);

  useEffect(() => {
    if (isInitialized) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }
  }, [isInitialized]);

  return null;
};

export default ServerSpinnerToast;
