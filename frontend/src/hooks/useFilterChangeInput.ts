import { useState, useEffect, useCallback } from "react";
import useFilterChange from "./useFilterChange"; // Assuming this is your existing hook

const useFilterChangeInput = (
  name: string,
  defaultValue: string | number,
  delay = 300,
  onAfterDebouncedChange?: (value: string | number) => void
) => {
  const { value: queryValue, handleChange } = useFilterChange(
    name,
    defaultValue
  );
  const [debouncedValue, setDebouncedValue] = useState(queryValue);

  useEffect(() => {
    setDebouncedValue(queryValue);
  }, [queryValue]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDebouncedValue(event.target.value);
    },
    []
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedValue !== queryValue) {
        handleChange(debouncedValue);
        if (onAfterDebouncedChange) {
          onAfterDebouncedChange(debouncedValue);
        }
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [
    debouncedValue,
    queryValue,
    handleChange,
    delay,
    onAfterDebouncedChange,
  ]);

  return {
    value: debouncedValue,
    handleChange: handleInputChange,
  };
};

export default useFilterChangeInput;
