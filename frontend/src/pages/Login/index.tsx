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
import { useNavigate } from "react-router-dom";
import { setUser } from "store/features/auth";
import { apiClient } from "utils/axios";
import { setToken } from "utils/token";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mutate, isPending } = useMutation({
    mutationFn: async (projectData: z.infer<typeof schema>) => {
      return await apiClient.post("/auth/login", projectData);
    },
  });

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useHookForm({
    schema,
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async (data) => {
      mutate(data, {
        onSuccess: ({ data }) => {
          reset();
          dispatch(setUser(data?.data));
          navigate("/projects");
          setToken(data?.data?.token);
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
        <Typography color="white" textAlign="center" variant="h5">
          Login
        </Typography>
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
              label="Password"
              type="password"
              placeholder="enter your password"
              fullWidth
              error={!!errors?.password}
              helperText={errors?.password?.message}
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
          <Typography>New here?</Typography>
          <Button
            variant="text"
            onClick={() => {
              navigate("/register");
            }}
            sx={{ p: 0, minWidth: "auto" }}
          >
            <Typography sx={{ textDecoration: "underline" }}>
              register
            </Typography>
          </Button>
        </Box>
      </Grid>
    </AuthFormWrapper>
  );
}
