"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
import { z } from "zod";
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Group,
  Stack,
  Divider,
  Checkbox,
} from "@mantine/core";
import { IconBrandGoogle, IconBrandGithub } from "@tabler/icons-react";

// Zod schema for signup form validation
const signupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms and conditions"),
});

export default function SignupScreen() {
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const router = useRouter();

  // Initialize form with Zod validation
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
    validate: {
      name: (value) => {
        const result = z.string().min(2).safeParse(value);
        return result.success
          ? null
          : "Name must be at least 2 characters long";
      },
      email: (value) => {
        const result = z.string().email().safeParse(value);
        return result.success ? null : "Please enter a valid email address";
      },
      password: (value) => {
        const passwordSchema = z
          .string()
          .min(8, "Password must be at least 8 characters long")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[a-z]/, "Password must contain at least one lowercase letter")
          .regex(/[0-9]/, "Password must contain at least one number");

        const result = passwordSchema.safeParse(value);
        return result.success ? null : result.error.issues[0].message;
      },
      confirmPassword: (value, values) => {
        if (!value) return "Please confirm your password";
        if (value !== values.password) return "Passwords do not match";
        return null;
      },
      agreeToTerms: (value) => {
        return value ? null : "You must accept the terms and conditions";
      },
    },
  });

  const handleSignup = async (values: typeof form.values) => {
    setLoading(true);
    try {
      // Simulate API call
      console.log("Signup attempt with:", values);
      setTimeout(() => {
        setLoading(false);
        // Navigate to home page or login page after successful signup
        router.push("/login");
      }, 1500);
    } catch (error) {
      setLoading(false);
      console.error("Signup failed:", error);
    }
  };

  const handleSocialSignup = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    try {
      // Simulate social signup API call
      console.log(`${provider} signup attempt`);
      setTimeout(() => {
        setSocialLoading(null);
        // Navigate to home page after successful social signup
        router.push("/");
      }, 1500);
    } catch (error) {
      setSocialLoading(null);
      console.error(`${provider} signup failed:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <Container size="sm" px="md">
        <Paper shadow="md" p="xl" radius="md" maw={420}>
          <form onSubmit={form.onSubmit(handleSignup)}>
            <Stack gap="md">
              <div className="text-center">
                <Title order={2} mb="xs">
                  Create Account
                </Title>
                <Text size="sm" c="dimmed">
                  Sign up to get started with your kanban board
                </Text>
              </div>

              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                key={form.key("name")}
                {...form.getInputProps("name")}
                required
              />

              <TextInput
                label="Email"
                placeholder="Enter your email"
                key={form.key("email")}
                {...form.getInputProps("email")}
                required
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                key={form.key("password")}
                {...form.getInputProps("password")}
                required
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                key={form.key("confirmPassword")}
                {...form.getInputProps("confirmPassword")}
                required
              />

              <Checkbox
                label={
                  <Text size="sm">
                    I agree to the{" "}
                    <Text
                      component="span"
                      c="blue"
                      td="underline"
                      style={{ cursor: "pointer" }}
                    >
                      Terms of Service
                    </Text>{" "}
                    and{" "}
                    <Text
                      component="span"
                      c="blue"
                      td="underline"
                      style={{ cursor: "pointer" }}
                    >
                      Privacy Policy
                    </Text>
                  </Text>
                }
                key={form.key("agreeToTerms")}
                {...form.getInputProps("agreeToTerms", { type: "checkbox" })}
              />

              <Button fullWidth type="submit" loading={loading} size="md">
                Create Account
              </Button>

              <Divider
                label={
                  <Text size="sm" c="dimmed">
                    or sign up with
                  </Text>
                }
                labelPosition="center"
              />

              <Group grow>
                <Button
                  variant="default"
                  leftSection={<IconBrandGoogle size={16} />}
                  onClick={() => handleSocialSignup("google")}
                  loading={socialLoading === "google"}
                  disabled={socialLoading !== null}
                >
                  Google
                </Button>
                <Button
                  variant="default"
                  leftSection={<IconBrandGithub size={16} />}
                  onClick={() => handleSocialSignup("github")}
                  loading={socialLoading === "github"}
                  disabled={socialLoading !== null}
                >
                  GitHub
                </Button>
              </Group>

              <Group justify="center" gap="xs">
                <Text size="sm" c="dimmed">
                  Already have an account?
                </Text>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => router.push("/login")}
                >
                  Sign in
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
