import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { queryStringParse, queryStringStringify } from "utils/querystring";

const useFilterChange = (name: string, defaultValue: string | number) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryString = useMemo(
    () => queryStringParse(location.search),
    [location.search]
  );
  const queryValue = String(queryString?.[name] ?? defaultValue);

  const handleChange = useCallback(
    (value: string | number) => {
      if (value !== queryValue) {
        const queryObject = {
          ...queryStringParse(location.search),
          [name]: value,
        };
        if (String(queryObject?.[name]) === String(defaultValue)) {
          delete queryObject[name];
        }

        const search = queryStringStringify(queryObject);
        navigate(`${location.pathname}?${search}`, { replace: true });
      }
    },
    [queryValue, name, location.search, location.pathname]
  );

  return {
    value:
      typeof defaultValue === "number" ? parseFloat(queryValue) : queryValue,
    handleChange,
  };
};

export default useFilterChange;
