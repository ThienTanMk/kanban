"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Group, Button, Text, Avatar, Menu } from "@mantine/core";
import { IconUser, IconLogout, IconShare } from "@tabler/icons-react";
import KanbanBoard from "../components/KanbanBoard";
import ShareModal from "../components/ShareModal";
import NotificationDropdown from "../components/NotificationDropdown";

export default function KanbanScreen() {
  const router = useRouter();
  const [shareModalOpened, setShareModalOpened] = useState(false);

  const handleNavigateToProfile = () => {
    router.push("/profile");
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <Group justify="space-between">
            <div>
              <Text size="xl" fw={700} c="blue">
                TaskBoard
              </Text>
              <Text size="sm" c="dimmed">
                Manage your tasks efficiently
              </Text>
            </div>

            <Group gap="sm">
              <Button
                variant="outline"
                leftSection={<IconShare size={16} />}
                onClick={() => setShareModalOpened(true)}
              >
                Share
              </Button>

              <NotificationDropdown />

              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button
                    variant="subtle"
                    leftSection={
                      <Avatar size="sm" radius="xl">
                        JD
                      </Avatar>
                    }
                  >
                    John Doe
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>john.doe@example.com</Menu.Label>
                  <Menu.Divider />

                  <Menu.Item
                    leftSection={<IconUser size={14} />}
                    onClick={handleNavigateToProfile}
                  >
                    Profile
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<IconLogout size={14} />}
                    color="red"
                    onClick={handleLogout}
                  >
                    Logout
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </div>
      </div>

      {/* Main Content */}
      <KanbanBoard />

      {/* Share Modal */}
      <ShareModal
        opened={shareModalOpened}
        onClose={() => setShareModalOpened(false)}
      />
    </div>
  );
}
