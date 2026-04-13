import { useSelector } from "react-redux";
import { RootState } from "store/index";

const useAuthUser = () => {
  const data = useSelector((state: RootState) => state.authUser);
  return data;
};

export default useAuthUser;
