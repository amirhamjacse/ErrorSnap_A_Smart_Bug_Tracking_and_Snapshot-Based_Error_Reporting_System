import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { queryStringParse, queryStringStringify } from "utils/querystring";

type filterValue = string | number;
type handleChangeValue = filterValue | Record<string, filterValue>;

const useFilterChange = (name: string, defaultValue: string | number) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryString = useMemo(
    () => queryStringParse(location.search),
    [location.search],
  );
  const queryValue = String(queryString?.[name] ?? defaultValue);

  const handleChange = useCallback(
    (value: handleChangeValue) => {
      const prevQueryObject = queryStringParse(location.search);
      const nextValues =
        typeof value === "object" && value !== null ? value : { [name]: value };

      const queryObject = {
        ...prevQueryObject,
        ...nextValues,
      };

      Object.keys(nextValues).forEach((key) => {
        const currentValue = queryObject[key];
        if (
          typeof currentValue === "undefined" ||
          currentValue === null ||
          String(currentValue) === ""
        ) {
          delete queryObject[key];
        }
      });

      if (String(queryObject?.[name]) === String(defaultValue)) {
        delete queryObject[name];
      }

      const previousSearch = queryStringStringify(prevQueryObject);
      const nextSearch = queryStringStringify(queryObject);
      if (previousSearch !== nextSearch) {
        navigate(
          `${location.pathname}${nextSearch ? `?${nextSearch}` : ""}`,
          {
            replace: true,
          }
        );
      }
    },
    [
      name,
      location.search,
      location.pathname,
      defaultValue,
      navigate,
    ],
  );

  return {
    value:
      typeof defaultValue === "number" ? parseFloat(queryValue) : queryValue,
    handleChange,
  };
};

export default useFilterChange;
