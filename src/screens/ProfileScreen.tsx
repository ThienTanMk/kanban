"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Paper,
  TextInput,
  Button,
  Title,
  Text,
  Avatar,
  Group,
  Stack,
  Divider,
  Select,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

export default function ProfileScreen() {
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [role, setRole] = useState("member");
  const [bio, setBio] = useState("Frontend Developer at Tech Corp");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdateProfile = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Handle update logic here
    }, 1000);
  };

  const handleBack = () => {
    router.push("/");
  };

  const handleLogout = () => {
    // Clear user session/token here
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container size="md" py="xl">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          mb="md"
          onClick={handleBack}
        >
          Back to Kanban
        </Button>

        <Paper shadow="md" p="xl" radius="md">
          <Stack gap="lg">
            <div className="text-center">
              <Avatar
                size={80}
                radius="xl"
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80"
                alt="Profile"
                mx="auto"
                mb="md"
              />
              <Title order={2}>Profile Settings</Title>
              <Text size="sm" c="dimmed">
                Manage your account information
              </Text>
            </div>

            <Divider />

            <Stack gap="md">
              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <TextInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />

              <TextInput
                label="Phone Number"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
              />

              <Select
                label="Role"
                placeholder="Select your role"
                value={role}
                onChange={(value) => setRole(value || "member")}
                data={[
                  { value: "admin", label: "Admin" },
                  { value: "member", label: "Member" },
                  { value: "viewer", label: "Viewer" },
                ]}
              />

              <TextInput
                label="Bio"
                placeholder="Tell us about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </Stack>

            <Group justify="space-between">
              <Button variant="outline" color="red" onClick={handleLogout}>
                Logout
              </Button>

              <Group gap="sm">
                <Button variant="outline" onClick={handleBack}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProfile} loading={loading}>
                  Update Profile
                </Button>
              </Group>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
