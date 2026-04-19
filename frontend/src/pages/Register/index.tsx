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
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "store/features/auth";
import { apiClient } from "utils/axios";
import Cookies from "js-cookie";
import { z } from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

type InvitationData = {
  email: string;
  projectId: string;
  projectName: string;
  invitedByUsername: string;
  expiresAt: string;
};

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
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get("invitationToken") || "";
  const invitationEmailParam = searchParams.get("email") || "";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutate, isPending } = useMutation({
    mutationFn: async (
      projectData: z.infer<typeof schema> & { invitationToken?: string },
    ) => {
      return await apiClient.post("/auth/register", projectData);
    },
  });

  const invitationQuery = useQuery({
    queryKey: ["invitation-token", invitationToken],
    queryFn: async (): Promise<InvitationData> => {
      const response = await apiClient.get(
        `/auth/invitation/${invitationToken}`,
      );
      return response.data?.data;
    },
    enabled: !!invitationToken,
    retry: false,
  });

  const {
    control,
    handleSubmit,
    setValue,
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
      mutate(
        {
          ...data,
          ...(invitationToken ? { invitationToken } : {}),
        },
        {
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
        },
      );
    },
  });

  useEffect(() => {
    if (invitationEmailParam) {
      setValue("email", invitationEmailParam, {
        shouldValidate: true,
      });
    }
  }, [invitationEmailParam, setValue]);

  useEffect(() => {
    if (invitationQuery.data?.email) {
      setValue("email", invitationQuery.data.email, {
        shouldValidate: true,
      });
    }
  }, [invitationQuery.data?.email, setValue]);

  const invitationErrorMessage = invitationQuery.isError
    ? (invitationQuery.error as AxiosError<{ message: string }>)?.response?.data
        ?.message || "Invitation link is invalid or expired."
    : "";

  return (
    <AuthFormWrapper>
      <Grid size={12}>
        <Typography color="white" textAlign="center">
          Register
        </Typography>
      </Grid>
      {invitationQuery.data ? (
        <Grid size={12}>
          <Typography color="text.secondary" variant="body2">
            You were invited by{" "}
            {invitationQuery.data.invitedByUsername || "a team member"} to join{" "}
            {invitationQuery.data.projectName}. Complete registration within 10
            minutes.
          </Typography>
        </Grid>
      ) : null}
      {invitationErrorMessage ? (
        <Grid size={12}>
          <Typography color="error" variant="body2">
            {invitationErrorMessage}
          </Typography>
        </Grid>
      ) : null}
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
              disabled={!!invitationToken || !!invitationEmailParam}
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
          disabled={
            isPending ||
            invitationQuery.isLoading ||
            (!!invitationToken && !!invitationErrorMessage)
          }
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
