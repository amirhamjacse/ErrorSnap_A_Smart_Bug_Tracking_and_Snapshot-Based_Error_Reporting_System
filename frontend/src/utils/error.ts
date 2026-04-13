import { AxiosError } from "axios";

export const getFormattedError = (
  errorObject: AxiosError<{ message: string }> | Error
) => {
  return (
    (errorObject as AxiosError<{ message: string }>)?.response?.data?.message ||
    errorObject?.message
  );
};
