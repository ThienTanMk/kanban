"use client";

import { useState } from "react";
import {
  Table,
  Paper,
  Button,
  Text,
  Badge,
  Group,
  ActionIcon,
  Menu,
} from "@mantine/core";
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconEye,
  IconGripVertical,
} from "@tabler/icons-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import dayjs from "dayjs";

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

interface KanbanTableViewProps {
  tasks: (Task & { status: string })[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onViewTask: (task: Task) => void;
  onReorderTasks: (reorderedTasks: (Task & { status: string })[]) => void;
}

export default function KanbanTableView({
  tasks,
  onEditTask,
  onDeleteTask,
  onViewTask,
  onReorderTasks,
}: KanbanTableViewProps) {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("MMM DD, YYYY");
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return "-";
    const date = dayjs(deadline);
    const now = dayjs();

    if (date.isBefore(now)) {
      return (
        <Badge color="red" variant="light" size="xs">
          Overdue
        </Badge>
      );
    } else if (date.diff(now, "hour") < 24) {
      return (
        <Badge color="orange" variant="light" size="xs">
          {date.diff(now, "hour")}h left
        </Badge>
      );
    } else {
      return <Text size="sm">{date.format("MMM DD, YYYY")}</Text>;
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedTasks = Array.from(tasks);
    const [movedTask] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, movedTask);

    onReorderTasks(reorderedTasks);
  };

  const rows = tasks.map((task, index) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Table.Tr
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            backgroundColor: snapshot.isDragging ? "#f8f9fa" : "transparent",
          }}
        >
          <Table.Td>
            <Group gap="sm" align="center">
              <div
                {...provided.dragHandleProps}
                className="cursor-grab active:cursor-grabbing"
              >
                <IconGripVertical size={16} color="#999" />
              </div>
              <div>
                <Text fw={500} size="sm" className="truncate max-w-[200px]">
                  {task.title || task.content}
                </Text>
                {task.description && (
                  <Text size="xs" c="dimmed" className="truncate max-w-[200px]">
                    {task.description}
                  </Text>
                )}
              </div>
            </Group>
          </Table.Td>
          <Table.Td>
            <Badge
              color={getStatusColor(task.status)}
              variant="light"
              size="sm"
            >
              {task.status}
            </Badge>
          </Table.Td>
          <Table.Td>
            {task.priority && (
              <Badge
                color={getPriorityColor(task.priority)}
                variant="outline"
                size="sm"
              >
                {task.priority?.toUpperCase()}
              </Badge>
            )}
          </Table.Td>
          <Table.Td>
            <Text size="sm">
              {task.assignees && task.assignees.length > 0
                ? task.assignees.join(", ")
                : "-"}
            </Text>
          </Table.Td>
          <Table.Td>{formatDeadline(task.deadline)}</Table.Td>
          <Table.Td>
            <Text size="sm">
              {task.actualTime !== undefined && task.actualTime > 0
                ? `${task.actualTime}h`
                : "-"}
            </Text>
          </Table.Td>
          <Table.Td>
            <Menu shadow="md" width={120}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEye size={14} />}
                  onClick={() => onViewTask(task)}
                >
                  View
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={() => onEditTask(task)}
                >
                  Edit
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={() => onDeleteTask(task.id)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Table.Td>
        </Table.Tr>
      )}
    </Draggable>
  ));

  return (
    <Paper shadow="sm" p="md">
      <div className="mb-4">
        <Text size="lg" fw={600}>
          Tasks Table View
        </Text>
        <Text size="sm" c="dimmed">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
        </Text>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Task</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Priority</Table.Th>
              <Table.Th>Assignees</Table.Th>
              <Table.Th>Deadline</Table.Th>
              <Table.Th>Actual Time</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Droppable droppableId="table-tasks">
            {(provided) => (
              <Table.Tbody ref={provided.innerRef} {...provided.droppableProps}>
                {rows.length > 0 ? (
                  rows
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={7} className="text-center">
                      <Text c="dimmed" size="sm">
                        No tasks found
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
                {provided.placeholder}
              </Table.Tbody>
            )}
          </Droppable>
        </Table>
      </DragDropContext>
    </Paper>
  );
}
