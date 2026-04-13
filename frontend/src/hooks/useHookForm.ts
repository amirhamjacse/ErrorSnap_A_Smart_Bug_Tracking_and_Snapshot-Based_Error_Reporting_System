import { DefaultValues, UseFormProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type hookFormOptions<T> = {
  schema: z.ZodSchema<T>;
  defaultValues?: T;
  onSubmit?: (data: T) => void;
} & UseFormProps<T>;

const useHookForm = <V>({
  schema,
  defaultValues,
  onSubmit,
  ...options
}: hookFormOptions<V>) => {
  const form = useForm<V>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: defaultValues as DefaultValues<V>,
    ...options,
  });

  return {
    ...form,
    handleSubmit: form.handleSubmit(onSubmit),
  };
};

export default useHookForm;
