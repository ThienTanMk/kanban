"use client";
import { Paper, Group, Text, ActionIcon, ScrollArea, Stack, Badge } from "@mantine/core";
import { IconX, IconClock } from "@tabler/icons-react";
import dayjs from "dayjs";
import { GeneratedSubtask, getPriorityColor } from "../GenerativeSubtask";

interface GeneratedSubtasksPanelProps {
  generatedSubtasks: GeneratedSubtask[];
  onClose: () => void;
}

export function GeneratedSubtasksPanel({
  generatedSubtasks,
  onClose,
}: GeneratedSubtasksPanelProps) {
  return (
    <Paper
      p="md"
      withBorder
      h="100%"
      // style={{
      //   backgroundColor: "var(--mantine-color-gray-10)",
      // }}
    >
      <Group justify="space-between" mb="md">
        <Text fw={600} size="lg" c="blue">
          Generated Subtasks ({generatedSubtasks.length})
        </Text>
        <ActionIcon variant="subtle" color="gray" onClick={onClose}>
          <IconX size={16} />
        </ActionIcon>
      </Group>

      <ScrollArea h={500}>
        <Stack gap="xs">
          {generatedSubtasks.map((sub) => (
            <Paper key={sub.id} p="sm" withBorder radius="md">
              <Text fw={600} size="sm" mb={4}>
                {sub.name}
              </Text>
              <Text size="xs" c="dimmed" mb="xs" lineClamp={2}>
                {sub.description || "No description"}
              </Text>
              <Group gap="xs">
                <Badge
                  size="xs"
                  color={getPriorityColor(sub.priority)}
                  variant="light"
                >
                  {sub.priority}
                </Badge>
                <Badge
                  size="xs"
                  variant="light"
                  leftSection={<IconClock size={12} />}
                >
                  {sub.estimatedTime}h
                </Badge>
                <Badge size="xs" variant="light" color="gray">
                  {dayjs(sub.deadline).format("MMM DD")}
                </Badge>
              </Group>
            </Paper>
          ))}
        </Stack>
      </ScrollArea>
    </Paper>
  );
}