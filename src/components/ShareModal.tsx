"use client";

import { useState } from "react";
import {
  Modal,
  TextInput,
  Button,
  Select,
  Stack,
  Group,
  Text,
  Paper,
  Avatar,
  Badge,
  ActionIcon,
} from "@mantine/core";
import { IconTrash, IconSend, IconCopy } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";

interface TeamMember {
  id: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "declined";
  avatar?: string;
  name?: string;
}

interface ShareModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function ShareModal({ opened, onClose }: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [inviteLink] = useState("https://kanban-app.com/invite/abc123xyz");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      email: "john.doe@example.com",
      name: "John Doe",
      role: "admin",
      status: "accepted",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40",
    },
    {
      id: "2",
      email: "jane.smith@example.com",
      name: "Jane Smith",
      role: "member",
      status: "accepted",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40",
    },
    {
      id: "3",
      email: "bob.johnson@example.com",
      role: "viewer",
      status: "pending",
    },
  ]);

  const handleSendInvite = () => {
    if (!email) return;

    const newMember: TeamMember = {
      id: `member-${dayjs().valueOf()}`,
      email,
      role,
      status: "pending",
    };

    setTeamMembers([...teamMembers, newMember]);
    setEmail("");
    setRole("member");

    notifications.show({
      title: "Invite sent!",
      message: `Invitation sent to ${email}`,
      color: "green",
    });
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== memberId));
    notifications.show({
      title: "Member removed",
      message: "Team member has been removed from the project",
      color: "red",
    });
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    notifications.show({
      title: "Link copied!",
      message: "Invite link copied to clipboard",
      color: "blue",
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Share Project" size="md">
      <Stack gap="lg">
        <div>
          <Text size="sm" fw={500} mb="xs">
            Invite by email
          </Text>
          <Stack gap="sm">
            <TextInput
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendInvite();
                }
              }}
            />
            <Group gap="sm">
              <Select
                value={role}
                onChange={(value) => setRole(value || "member")}
                data={[
                  { value: "admin", label: "Admin" },
                  { value: "member", label: "Member" },
                  { value: "viewer", label: "Viewer" },
                ]}
                style={{ flex: 1 }}
              />
              <Button
                leftSection={<IconSend size={16} />}
                onClick={handleSendInvite}
                disabled={!email}
              >
                Send Invite
              </Button>
            </Group>
          </Stack>
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Or share link
          </Text>
          <Group gap="sm">
            <TextInput value={inviteLink} readOnly style={{ flex: 1 }} />
            <Button
              variant="outline"
              leftSection={<IconCopy size={16} />}
              onClick={copyInviteLink}
            >
              Copy
            </Button>
          </Group>
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Team Members ({teamMembers.length})
          </Text>
          <Stack gap="xs">
            {teamMembers.map((member) => (
              <Paper key={member.id} p="sm" withBorder>
                <Group justify="space-between">
                  <Group gap="sm">
                    <Avatar src={member.avatar} size="sm" radius="xl">
                      {member.name ? member.name[0] : member.email[0]}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500}>
                        {member.name || member.email}
                      </Text>
                      {member.name && (
                        <Text size="xs" c="dimmed">
                          {member.email}
                        </Text>
                      )}
                    </div>
                  </Group>
                  <Group gap="xs">
                    <Badge
                      color={
                        member.status === "accepted"
                          ? "green"
                          : member.status === "pending"
                          ? "yellow"
                          : "red"
                      }
                      variant="light"
                      size="sm"
                    >
                      {member.status}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {member.role}
                    </Badge>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </div>
      </Stack>
    </Modal>
  );
}
