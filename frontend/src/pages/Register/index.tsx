import {
  Box,
  Button,
  CircularProgress,
  Grid2 as Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import AuthFormWrapper from "components/AuthFormWrapper";
import useHookForm from "hooks/useHookForm";
import { Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "store/features/auth";
import { apiClient } from "utils/axios";
import Cookies from "js-cookie";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

const schema = z
  .object({
    username: z.string(),
    email: z.string().email(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." })
      .regex(/[a-zA-Z]/, {
        message: "Password must contain at least one letter.",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Password must contain at least one special character.",
      }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutate, isPending } = useMutation({
    mutationFn: async (projectData: z.infer<typeof schema>) => {
      return await apiClient.post("/auth/register", projectData);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useHookForm({
    schema,
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    onSubmit: async (data) => {
      mutate(data, {
        onSuccess: ({ data }) => {
          reset();
          dispatch(setUser(data?.data));
          navigate("/projects");
          Cookies.set("token", data?.data?.token, { expires: 1 });
        },
        onError: (error: AxiosError<{ message: string }>) => {
          const errorMessage = error?.response?.data?.message;
          console.error("Error adding project:", errorMessage);
          toast.error(errorMessage);
        },
      });
    },
  });

  return (
    <AuthFormWrapper>
      <Grid size={12}>
        <Typography color="white" textAlign="center">
          Register
        </Typography>
      </Grid>
      <Grid size={12}>
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Username"
              placeholder="enter your username"
              fullWidth
              error={!!errors?.username}
              helperText={errors?.username?.message}
            />
          )}
        />
      </Grid>
      <Grid size={12}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              placeholder="enter your email"
              fullWidth
              error={!!errors?.email}
              helperText={errors?.email?.message}
            />
          )}
        />
      </Grid>
      <Grid size={12}>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="password"
              label="Password"
              placeholder="enter your password"
              fullWidth
              error={!!errors?.password}
              helperText={errors?.password?.message}
            />
          )}
        />
      </Grid>
      <Grid size={12}>
        <Controller
          name="confirm_password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="password"
              label="Confirm password"
              placeholder="enter your password again"
              fullWidth
              error={!!errors?.confirm_password}
              helperText={errors?.confirm_password?.message}
            />
          )}
        />
      </Grid>
      <Grid size={12}>
        <Button
          startIcon={isPending ? <CircularProgress size={15} /> : null}
          disabled={isPending}
          fullWidth
          variant="contained"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Grid>
      <Grid size={12} mt={1}>
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={1}>
          <Typography>Already have a account?</Typography>
          <Button
            variant="text"
            onClick={() => {
              navigate("/login");
            }}
            sx={{ p: 0, minWidth: "auto" }}
          >
            <Typography sx={{ textDecoration: "underline" }}>login</Typography>
          </Button>
        </Box>
      </Grid>
    </AuthFormWrapper>
  );
}
