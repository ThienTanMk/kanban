"use client";

import { useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Select,
  Stack,
  MultiSelect,
  NumberInput,
  Text,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import dayjs from "dayjs";

interface AddTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onAddTask: (task: {
    title: string;
    description: string;
    priority: string;
    assignees: string[];
    deadline?: string;
    authors: string[];
  }) => void;
}

export default function AddTaskModal({
  opened,
  onClose,
  onAddTask,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date | null>(null);

  // Authors mặc định là người đang đăng nhập và không thể thay đổi
  const currentUser = "John Doe"; // In real app, get from auth context
  const authors = [currentUser];

  // Available users - in real app this would come from API
  const availableUsers = [
    "John Doe",
    "Jane Smith",
    "Bob Johnson",
    "Alice Brown",
    "Charlie Wilson",
    "Diana Prince",
  ];

  const handleSubmit = () => {
    if (!title.trim()) return;

    onAddTask({
      title,
      description,
      priority,
      assignees,
      deadline: deadline ? dayjs(deadline).toISOString() : undefined,
      authors,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setAssignees([]);
    setDeadline(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add New Task"
      size="md"
      centered
    >
      <Stack gap="md">
        <TextInput
          label="Task Title"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minRows={3}
        />

        <Select
          label="Priority"
          value={priority}
          onChange={(value) => setPriority(value || "medium")}
          data={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
          ]}
        />

        <MultiSelect
          label="Assignees"
          placeholder="Select assignees"
          value={assignees}
          onChange={setAssignees}
          data={availableUsers.map((user) => ({ value: user, label: user }))}
          searchable
        />

        <div>
          <Text size="sm" fw={500} mb="xs">
            Authors
          </Text>
          <Text size="sm" c="dimmed">
            {authors.join(", ")}
          </Text>
          <Text size="xs" c="dimmed" mt="xs">
            Authors are automatically set to the current user and cannot be
            changed.
          </Text>
        </div>

        <DateTimePicker
          label="Deadline"
          placeholder="Select deadline"
          value={deadline}
          onChange={(value) =>
            setDeadline(value ? dayjs(value).toDate() : null)
          }
          clearable
        />

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Add Task
          </Button>
        </div>
      </Stack>
    </Modal>
  );
}
