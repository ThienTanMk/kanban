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
} from "@mantine/core";
import { IconBrandGoogle, IconBrandGithub } from "@tabler/icons-react";

// Zod schema for login form validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long"),
});

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const router = useRouter();

  // Initialize form with Zod validation
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => {
        const result = z.string().email().safeParse(value);
        return result.success ? null : "Please enter a valid email address";
      },
      password: (value) => {
        const result = z.string().min(6).safeParse(value);
        return result.success
          ? null
          : "Password must be at least 6 characters long";
      },
    },
  });

  const handleLogin = async (values: typeof form.values) => {
    setLoading(true);
    try {
      // Simulate API call
      console.log("Login attempt with:", values);
      setTimeout(() => {
        setLoading(false);
        // Navigate to home page after successful login
        router.push("/");
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.error("Login failed:", error);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setSocialLoading(provider);
    try {
      // Simulate social login API call
      console.log(`${provider} login attempt`);
      setTimeout(() => {
        setSocialLoading(null);
        // Navigate to home page after successful social login
        router.push("/");
      }, 1500);
    } catch (error) {
      setSocialLoading(null);
      console.error(`${provider} login failed:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <Container size="sm" px="md">
        <Paper shadow="md" p="xl" radius="md" w={420}>
          <form onSubmit={form.onSubmit(handleLogin)}>
            <Stack gap="md">
              <div className="text-center">
                <Title order={2} mb="xs">
                  Welcome Back
                </Title>
                <Text size="sm" c="dimmed">
                  Sign in to your account to continue
                </Text>
              </div>

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

              <Button fullWidth type="submit" loading={loading} size="md">
                Sign In
              </Button>

              <Divider
                label={
                  <Text size="sm" c="dimmed">
                    or continue with
                  </Text>
                }
                labelPosition="center"
              />

              <Group grow>
                <Button
                  variant="default"
                  leftSection={<IconBrandGoogle size={16} />}
                  onClick={() => handleSocialLogin("google")}
                  loading={socialLoading === "google"}
                  disabled={socialLoading !== null}
                >
                  Google
                </Button>
                <Button
                  variant="default"
                  leftSection={<IconBrandGithub size={16} />}
                  onClick={() => handleSocialLogin("github")}
                  loading={socialLoading === "github"}
                  disabled={socialLoading !== null}
                >
                  GitHub
                </Button>
              </Group>

              <Group justify="center" gap="xs">
                <Text size="sm" c="dimmed">
                  Don't have an account?
                </Text>
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => router.push("/signup")}
                >
                  Sign up
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
