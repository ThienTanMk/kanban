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
import { useGetAvailableUsers, useGetMe } from "@/hooks/user";
import { Priority, TaskCreateRequest } from "@/types/api";
interface AddTaskModalProps {
  opened: boolean;
  onClose: () => void;
  onAddTask: (task: TaskCreateRequest) => void;
}
export default function AddTaskModal({
  opened,
  onClose,
  onAddTask,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const { data: me } = useGetMe();
  const currentUser = me?.name || "";
  const { data: availableUsers } = useGetAvailableUsers();
  const authors = currentUser;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAddTask({
      name: title,
      description,
      priority,
      assignees,
      deadline: deadline ? dayjs(deadline).toISOString() : undefined,
      ownerId: me?.id || "",
    });

    setTitle("");
    setDescription("");
    setPriority(Priority.MEDIUM);
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
          onChange={(value) =>
            setPriority((value as Priority) || Priority.MEDIUM)
          }
          data={[
            { value: "LOW", label: "Low" },
            { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" },
          ]}
        />
        <MultiSelect
          label="Assignees"
          placeholder="Select assignees"
          value={assignees}
          onChange={setAssignees}
          data={
            availableUsers?.map((user) => ({
              value: user.id,
              label: user.name,
            })) || []
          }
          searchable
        />
        <div>
          <Text size="sm" fw={500} mb="xs">
            Authors
          </Text>
          <Text size="sm" c="dimmed">
            {authors}
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
