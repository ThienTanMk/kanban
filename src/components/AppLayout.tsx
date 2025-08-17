import { useState } from "react";
import { AppShell, Group, Button, Text, Avatar, Menu } from "@mantine/core";
import { IconUser, IconSettings, IconLogout } from "@tabler/icons-react";

interface AppLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  onNavigateToProfile: () => void;
  currentUser?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function AppLayout({
  children,
  onLogout,
  onNavigateToProfile,
  currentUser = { name: "John Doe", email: "john.doe@example.com" },
}: AppLayoutProps) {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Text size="xl" fw={700} c="blue">
              TaskBoard
            </Text>
          </Group>

          <Group gap="sm">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button
                  variant="subtle"
                  leftSection={
                    <Avatar size="sm" src={currentUser.avatar} radius="xl">
                      {currentUser.name.charAt(0)}
                    </Avatar>
                  }
                >
                  {currentUser.name}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{currentUser.email}</Menu.Label>
                <Menu.Divider />

                <Menu.Item
                  leftSection={<IconUser size={14} />}
                  onClick={onNavigateToProfile}
                >
                  Profile
                </Menu.Item>

                <Menu.Item leftSection={<IconSettings size={14} />}>
                  Settings
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                  leftSection={<IconLogout size={14} />}
                  color="red"
                  onClick={onLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
