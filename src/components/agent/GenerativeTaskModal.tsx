"use client";
import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Select,
  Stack,
  MultiSelect,
  Text,
  Paper,
  Group,
  ActionIcon,
  ScrollArea,
  Badge,
} from "@mantine/core";
import dayjs from "dayjs";
import { DateTimePicker } from "@mantine/dates";
import { Priority, Task } from "@/types/api";
import { notifications } from "@mantine/notifications";
import { IconSparkles, IconUser } from "@tabler/icons-react";
import { useProjectStore } from "@/stores/projectStore";
import { useCreateTaskWithAI } from "@/hooks/task";
import { getPriorityColor } from "@/lib/utils";

export interface GeneratedTask {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  deadline: string;
  estimatedTime: number;
  assigned?: string[];
}

interface GenerativeTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onPrefer: () => void;
  initialTitle: string;
  initialDescription: string;
  initialPriority: Priority;
  initialAssignees: string[];
  initialDeadline: Date | null;
  projectName?: string;
  compact?: boolean;
  onAIFilled?: (task: Task) => void;
}

export default function GenerativeTaskModal({
  opened,
  onClose,
  onPrefer,
  initialTitle,
  initialDescription,
  initialPriority,
  initialAssignees,
  initialDeadline,
  projectName,
  compact = false,
  onAIFilled,
}: GenerativeTaskModalProps) {
  const { currentProjectId } = useProjectStore();
  const createTaskWithAI = useCreateTaskWithAI();

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState<Priority>(
    initialPriority || Priority.MEDIUM
  );
  const [assignees, setAssignees] = useState<string[]>(initialAssignees || []);
  const [deadline, setDeadline] = useState<string | null>(
    initialDeadline ? dayjs(initialDeadline).toISOString() : null
  );
  const [selectedTask, setSelectedTask] = useState<GeneratedTask | null>(null);

  const handleGenerateWithAI = () => {
    if (!currentProjectId) {
      notifications.show({
        color: "red",
        message: "Vui lòng chọn project trước",
      });
      return;
    }

    const desc =
      description.trim() ||
      initialDescription.trim() ||
      `Tạo task cho project${
        projectName ? ` "${projectName}"` : ""
      }. Hãy đề xuất chi tiết name, priority, deadline, estimated time và assignees nếu có thể.`;

    createTaskWithAI.mutate(
      {
        description: desc,
        projectId: currentProjectId,
      },
      {
        onSuccess: (task: Task) => {
          const gen: GeneratedTask = {
            id: task.id,
            name: task.name || "",
            description: task.description || "",
            priority: task.priority || Priority.MEDIUM,
            deadline: task.deadline || "",
            estimatedTime: task.estimatedTime || 0,
            assigned:
              task.assignees?.map(
                (a) => a.user.name || a.user.email || a.userId
              ) || [],
          };

          setSelectedTask(gen);
          setTitle(gen.name);
          setDescription(gen.description);
          setPriority(gen.priority);
          setDeadline(gen.deadline);
          setAssignees(gen.assigned!);

          notifications.show({
            color: "green",
            message:
              "AI đã điền gợi ý vào form. Bạn có thể chỉnh sửa rồi tạo task.",
          });
        },
        onError: (error) => {
          notifications.show({
            color: "red",
            title: "Lỗi",
            message: "Không thể tạo gợi ý với AI: " + error.message,
          });
        },
      }
    );
  };

  useEffect(() => {
    if (opened && initialDescription && !selectedTask === null) {
      handleGenerateWithAI();
    }
  }, [opened, initialDescription]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Task with AI"
      size="lg"
    >
      <Stack gap="lg">
        {/* Nút Generate với AI*/}
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            Nhấn để AI gợi ý toàn bộ thông tin task
          </Text>
          <Button
            size="sm"
            variant="filled"
            color="grape"
            leftSection={<IconSparkles size={16} />}
            loading={createTaskWithAI.isPending}
            onClick={handleGenerateWithAI}
          >
            Generate with AI
          </Button>
        </Group>

        <TextInput
          label="Task Title"
          placeholder="AI sẽ gợi ý..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          size="lg"
        />
        <Textarea
          label="Description"
          placeholder="Mô tả chi tiết yêu cầu (AI sẽ dựa vào đây)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={3}
          size="lg"
        />
        <Select
          label="Priority"
          value={priority}
          onChange={(value) =>
            setPriority((value as Priority) || Priority.MEDIUM)
          }
          data={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
          ]}
          size="lg"
        />
        <MultiSelect
          label="Assignees"
          placeholder="AI có thể gợi ý..."
          value={assignees}
          onChange={setAssignees}
          data={[]}
          searchable
          size="lg"
        />
        <DateTimePicker
          label="Deadline"
          placeholder="AI có thể gợi ý..."
          value={deadline}
          onChange={setDeadline}
          clearable
          size="lg"
        />

        {selectedTask && (
          <Paper p="sm" withBorder style={{ backgroundColor: "#f0f9ff" }}>
            <Text size="xs" c="dimmed" mb={4}>
              ✨ Đã điền từ gợi ý AI
            </Text>
            <Text size="sm" fw={500}>
              Estimated time ước tính: {selectedTask.estimatedTime} giờ
            </Text>
          </Paper>
        )}

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button size="lg" onClick={onPrefer} disabled={!title}>
            Create Task
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
