import Cookies from "js-cookie";

export const setToken = (token) => {
  Cookies.set("token", token, { expires: 1 });
};

export const removeToken = () => {
  Cookies.remove("token");
};
