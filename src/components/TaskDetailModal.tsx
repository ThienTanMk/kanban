"use client";

import { useState } from "react";
import {
  Modal,
  Text,
  Badge,
  Stack,
  Group,
  Button,
  Divider,
  TextInput,
  Textarea,
  Select,
  ActionIcon,
  Avatar,
  Paper,
  ScrollArea,
  MultiSelect,
  NumberInput,
  FileInput,
  Card,
  Anchor,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  IconEdit,
  IconTrash,
  IconSend,
  IconTag,
  IconClock,
  IconUser,
  IconX,
  IconDownload,
  IconFile,
  IconUpload,
  IconUsers,
  IconCheck,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  attachments?: FileAttachment[];
}

interface HistoryEntry {
  id: string;
  action: string;
  author: string;
  createdAt: string;
  details?: string;
}

interface Task {
  id: string;
  content: string;
  title?: string;
  description?: string;
  priority?: string;
  assignees?: string[];
  authors?: string[];
  status: string;
  tags?: string[];
  comments?: Comment[];
  history?: HistoryEntry[];
  createdAt?: string;
  deadline?: string;
  actualTime?: number;
}

interface TaskDetailModalProps {
  opened: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskDetailModal({
  opened,
  onClose,
  task,
  onEdit,
  onDelete,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<"comments" | "history">(
    "comments"
  );
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  // Available users - in real app this would come from API
  const availableUsers = [
    "John Doe",
    "Jane Smith",
    "Bob Johnson",
    "Alice Brown",
    "Charlie Wilson",
    "Diana Prince",
  ];

  if (!task) return null;

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Backlog":
        return "gray";
      case "To Do":
        return "orange";
      case "In Progress":
        return "blue";
      case "Code Review":
        return "purple";
      case "Testing":
        return "cyan";
      case "Done":
        return "green";
      default:
        return "gray";
    }
  };

  const handleEdit = () => {
    setEditedTask(task);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedTask) {
      // Add history entry for edit
      const updatedTask = {
        ...editedTask,
        history: [
          ...(editedTask.history || []),
          {
            id: `h-${dayjs().valueOf()}`,
            action: "Updated task",
            author: "Current User",
            createdAt: dayjs().toISOString(),
            details: "Task details updated",
          },
        ],
      };
      onEdit(updatedTask);
      setIsEditing(false);
      setEditedTask(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTask(null);
  };

  const handleAddComment = () => {
    if (!newComment.trim() && commentFiles.length === 0) return;

    // Create file attachments (in real app, upload files to server first)
    const attachments: FileAttachment[] = commentFiles.map((file, index) => ({
      id: `att-${dayjs().valueOf()}-${index}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // In real app, this would be server URL
      uploadedAt: dayjs().toISOString(),
    }));

    const updatedTask = {
      ...task,
      comments: [
        ...(task.comments || []),
        {
          id: `c-${dayjs().valueOf()}`,
          text: newComment,
          author: "Current User",
          createdAt: dayjs().toISOString(),
          attachments: attachments.length > 0 ? attachments : undefined,
        },
      ],
      history: [
        ...(task.history || []),
        {
          id: `h-${dayjs().valueOf()}`,
          action:
            attachments.length > 0
              ? "Added comment with attachments"
              : "Added comment",
          author: "Current User",
          createdAt: dayjs().toISOString(),
          details: newComment || `${attachments.length} file(s) attached`,
        },
      ],
    };

    onEdit(updatedTask);
    setNewComment("");
    setCommentFiles([]);
  };

  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditedCommentText(currentText);
  };

  const handleSaveComment = (commentId: string) => {
    if (!task) return;

    const updatedTask = {
      ...task,
      comments: task.comments?.map((comment) =>
        comment.id === commentId
          ? { ...comment, text: editedCommentText }
          : comment
      ),
      history: [
        ...(task.history || []),
        {
          id: `h-${dayjs().valueOf()}`,
          action: "Edited comment",
          author: "Current User",
          createdAt: dayjs().toISOString(),
          details: "Comment was modified",
        },
      ],
    };

    onEdit(updatedTask);
    setEditingCommentId(null);
    setEditedCommentText("");
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditedCommentText("");
  };

  const handleDeleteComment = (commentId: string) => {
    if (!task) return;

    const updatedTask = {
      ...task,
      comments: task.comments?.filter((comment) => comment.id !== commentId),
      history: [
        ...(task.history || []),
        {
          id: `h-${dayjs().valueOf()}`,
          action: "Deleted comment",
          author: "Current User",
          createdAt: dayjs().toISOString(),
          details: "Comment was removed",
        },
      ],
    };

    onEdit(updatedTask);
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        tags: editedTask.tags?.filter((tag) => tag !== tagToRemove) || [],
      });
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM DD, YYYY HH:mm");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: "100%" }}>
          <Text fw={600} size="lg">
            Task Details
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              onClick={handleEdit}
              disabled={isEditing}
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={handleDelete}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Task Header */}
        <div>
          {isEditing ? (
            <Stack gap="sm">
              <TextInput
                label="Title"
                value={editedTask?.title || editedTask?.content || ""}
                onChange={(e) =>
                  setEditedTask(
                    editedTask ? { ...editedTask, title: e.target.value } : null
                  )
                }
              />
              <Textarea
                label="Description"
                value={editedTask?.description || ""}
                onChange={(e) =>
                  setEditedTask(
                    editedTask
                      ? { ...editedTask, description: e.target.value }
                      : null
                  )
                }
                rows={3}
              />
              <Group gap="sm">
                <Select
                  label="Priority"
                  value={editedTask?.priority || ""}
                  onChange={(value) =>
                    setEditedTask(
                      editedTask
                        ? { ...editedTask, priority: value || "" }
                        : null
                    )
                  }
                  data={[
                    { value: "high", label: "High" },
                    { value: "medium", label: "Medium" },
                    { value: "low", label: "Low" },
                  ]}
                  style={{ flex: 1 }}
                />
                <Select
                  label="Status"
                  value={editedTask?.status || ""}
                  onChange={(value) =>
                    setEditedTask(
                      editedTask
                        ? { ...editedTask, status: value || "Backlog" }
                        : null
                    )
                  }
                  data={[
                    { value: "Backlog", label: "Backlog" },
                    { value: "To Do", label: "To Do" },
                    { value: "In Progress", label: "In Progress" },
                    { value: "Code Review", label: "Code Review" },
                    { value: "Testing", label: "Testing" },
                    { value: "Done", label: "Done" },
                  ]}
                  style={{ flex: 1 }}
                />
              </Group>
              <MultiSelect
                label="Assignees"
                value={editedTask?.assignees || []}
                onChange={(value) =>
                  setEditedTask(
                    editedTask ? { ...editedTask, assignees: value } : null
                  )
                }
                data={availableUsers.map((user) => ({
                  value: user,
                  label: user,
                }))}
                searchable
              />
              <MultiSelect
                label="Authors"
                value={editedTask?.authors || []}
                onChange={(value) =>
                  setEditedTask(
                    editedTask ? { ...editedTask, authors: value } : null
                  )
                }
                data={availableUsers.map((user) => ({
                  value: user,
                  label: user,
                }))}
                searchable
                disabled
                description="Authors cannot be modified"
              />
              <Group gap="sm">
                <DateTimePicker
                  label="Deadline"
                  value={
                    editedTask?.deadline
                      ? dayjs(editedTask.deadline).toDate()
                      : null
                  }
                  onChange={(value) =>
                    setEditedTask(
                      editedTask
                        ? {
                            ...editedTask,
                            deadline: value
                              ? dayjs(value).toISOString()
                              : undefined,
                          }
                        : null
                    )
                  }
                  clearable
                  style={{ flex: 1 }}
                />
                <NumberInput
                  label="Actual Time (hours)"
                  value={editedTask?.actualTime || 0}
                  onChange={(value) =>
                    setEditedTask(
                      editedTask
                        ? { ...editedTask, actualTime: Number(value) || 0 }
                        : null
                    )
                  }
                  min={0}
                  step={0.5}
                  decimalScale={1}
                  style={{ flex: 1 }}
                />
              </Group>
              <MultiSelect
                label="Tags"
                value={editedTask?.tags || []}
                onChange={(value) =>
                  setEditedTask(
                    editedTask ? { ...editedTask, tags: value } : null
                  )
                }
                data={[
                  "urgent",
                  "bug",
                  "feature",
                  "enhancement",
                  "documentation",
                  "testing",
                  "design",
                  "backend",
                  "frontend",
                ]}
                searchable
              />
              <Group gap="sm" justify="end">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </Group>
            </Stack>
          ) : (
            <>
              <Text size="xl" fw={600} mb="xs">
                {task.title || task.content}
              </Text>
              {task.description && (
                <Text c="dimmed" mb="md">
                  {task.description}
                </Text>
              )}
              <Group gap="sm" mb="md">
                {task.priority && (
                  <Badge
                    color={getPriorityColor(task.priority)}
                    variant="light"
                  >
                    {task.priority}
                  </Badge>
                )}
                <Badge color={getStatusColor(task.status)} variant="outline">
                  {task.status}
                </Badge>
                {task.deadline && (
                  <Badge variant="light" leftSection={<IconClock size={12} />}>
                    Due: {formatDate(task.deadline)}
                  </Badge>
                )}
                {task.actualTime !== undefined && task.actualTime > 0 && (
                  <Badge variant="light" color="blue">
                    {task.actualTime}h spent
                  </Badge>
                )}
                {task.createdAt && (
                  <Badge variant="light" leftSection={<IconClock size={12} />}>
                    Created: {formatDate(task.createdAt)}
                  </Badge>
                )}
              </Group>

              {/* Assignees */}
              {task.assignees && task.assignees.length > 0 && (
                <Group gap="xs" mb="md">
                  <IconUser size={16} />
                  <Text size="sm" fw={500}>
                    Assignees:
                  </Text>
                  <Avatar.Group spacing="xs">
                    {task.assignees.map((assignee, idx) => (
                      <Badge key={idx} variant="light" color="blue">
                        {assignee}
                      </Badge>
                    ))}
                  </Avatar.Group>
                </Group>
              )}

              {/* Authors */}
              {task.authors && task.authors.length > 0 && (
                <Group gap="xs" mb="md">
                  <IconUsers size={16} />
                  <Text size="sm" fw={500}>
                    Authors:
                  </Text>
                  <Group gap="xs">
                    {task.authors.map((author, idx) => (
                      <Badge key={idx} variant="light" color="green">
                        {author}
                      </Badge>
                    ))}
                  </Group>
                </Group>
              )}
              {task.tags && task.tags.length > 0 && (
                <Group gap="xs" mb="md">
                  <IconTag size={16} />
                  {task.tags.map((tag) => (
                    <Badge key={tag} size="sm" variant="light" color="blue">
                      {tag}
                    </Badge>
                  ))}
                </Group>
              )}

              {/* Edit Button */}
              {!isEditing && (
                <Group justify="end" mt="md">
                  <Button
                    leftSection={<IconEdit size={16} />}
                    onClick={handleEdit}
                  >
                    Edit Task
                  </Button>
                </Group>
              )}
            </>
          )}
        </div>

        <Divider />

        {/* Tabs */}
        <Group gap="sm">
          <Button
            variant={activeTab === "comments" ? "filled" : "subtle"}
            size="sm"
            onClick={() => setActiveTab("comments")}
          >
            Comments ({task.comments?.length || 0})
          </Button>
          <Button
            variant={activeTab === "history" ? "filled" : "subtle"}
            size="sm"
            onClick={() => setActiveTab("history")}
          >
            History ({task.history?.length || 0})
          </Button>
        </Group>

        {/* Tab Content */}
        <ScrollArea.Autosize mah={300}>
          {activeTab === "comments" && (
            <Stack gap="md">
              {/* Add Comment */}
              <Paper p="md" withBorder>
                <Stack gap="sm">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <FileInput
                    placeholder="Attach files..."
                    value={commentFiles}
                    onChange={setCommentFiles}
                    multiple
                    leftSection={<IconUpload size={16} />}
                    clearable
                  />
                  {commentFiles.length > 0 && (
                    <Group gap="xs">
                      {commentFiles.map((file, idx) => (
                        <Badge key={idx} variant="light" color="gray">
                          {file.name} ({(file.size / 1024).toFixed(1)}KB)
                        </Badge>
                      ))}
                    </Group>
                  )}
                  <Group justify="end">
                    <Button
                      leftSection={<IconSend size={16} />}
                      onClick={handleAddComment}
                      disabled={!newComment.trim() && commentFiles.length === 0}
                      size="sm"
                    >
                      Add Comment
                    </Button>
                  </Group>
                </Stack>
              </Paper>

              {/* Comments List */}
              {task.comments && task.comments.length > 0 ? (
                <Stack gap="sm">
                  {task.comments.map((comment) => (
                    <Paper key={comment.id} p="md" withBorder>
                      <Group gap="sm" align="flex-start">
                        <Avatar size="sm" radius="xl">
                          {comment.author[0]}
                        </Avatar>
                        <div style={{ flex: 1 }}>
                          <Group
                            justify="space-between"
                            align="flex-start"
                            mb="xs"
                          >
                            <Group gap="xs">
                              <Text size="sm" fw={500}>
                                {comment.author}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {formatDate(comment.createdAt)}
                              </Text>
                            </Group>
                            <Group gap="xs">
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="blue"
                                onClick={() =>
                                  handleEditComment(comment.id, comment.text)
                                }
                              >
                                <IconEdit size={14} />
                              </ActionIcon>
                              <ActionIcon
                                size="sm"
                                variant="subtle"
                                color="red"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>
                          </Group>

                          {editingCommentId === comment.id ? (
                            <Stack gap="xs">
                              <Textarea
                                value={editedCommentText}
                                onChange={(e) =>
                                  setEditedCommentText(e.target.value)
                                }
                                rows={3}
                                autoFocus
                              />
                              <Group gap="xs" justify="end">
                                <ActionIcon
                                  size="sm"
                                  variant="filled"
                                  color="green"
                                  onClick={() => handleSaveComment(comment.id)}
                                  disabled={!editedCommentText.trim()}
                                >
                                  <IconCheck size={14} />
                                </ActionIcon>
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  color="gray"
                                  onClick={handleCancelEditComment}
                                >
                                  <IconX size={14} />
                                </ActionIcon>
                              </Group>
                            </Stack>
                          ) : (
                            comment.text && (
                              <Text size="sm" mb="xs">
                                {comment.text}
                              </Text>
                            )
                          )}

                          {/* File attachments */}
                          {comment.attachments &&
                            comment.attachments.length > 0 && (
                              <Stack gap="xs" mt="sm">
                                <Text size="xs" fw={500} c="dimmed">
                                  Attachments:
                                </Text>
                                {comment.attachments.map((file) => (
                                  <Card key={file.id} p="xs" withBorder>
                                    <Group gap="xs">
                                      <IconFile size={16} />
                                      <div style={{ flex: 1 }}>
                                        <Text size="xs" fw={500}>
                                          {file.name}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                          {(file.size / 1024).toFixed(1)}KB •{" "}
                                          {file.type}
                                        </Text>
                                      </div>
                                      <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        component="a"
                                        href={file.url}
                                        download={file.name}
                                      >
                                        <IconDownload size={14} />
                                      </ActionIcon>
                                    </Group>
                                  </Card>
                                ))}
                              </Stack>
                            )}
                        </div>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Text ta="center" c="dimmed" py="xl">
                  No comments yet
                </Text>
              )}
            </Stack>
          )}

          {activeTab === "history" && (
            <Stack gap="sm">
              {task.history && task.history.length > 0 ? (
                task.history.map((entry) => (
                  <Paper key={entry.id} p="md" withBorder>
                    <Group gap="sm" align="flex-start">
                      <Avatar size="sm" radius="xl">
                        {entry.author[0]}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Group gap="xs" mb="xs">
                          <Text size="sm" fw={500}>
                            {entry.author}
                          </Text>
                          <Text size="sm" c="blue">
                            {entry.action}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatDate(entry.createdAt)}
                          </Text>
                        </Group>
                        {entry.details && (
                          <Text size="xs" c="dimmed">
                            {entry.details}
                          </Text>
                        )}
                      </div>
                    </Group>
                  </Paper>
                ))
              ) : (
                <Text ta="center" c="dimmed" py="xl">
                  No history available
                </Text>
              )}
            </Stack>
          )}
        </ScrollArea.Autosize>

        <Divider />

        <Group justify="end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
