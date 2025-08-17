"use client";

import { Card, Text, Group, Badge, Avatar, Tooltip } from "@mantine/core";
import { Draggable } from "@hello-pangea/dnd";
import { IconClock } from "@tabler/icons-react";
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

interface TaskCardProps {
  card: Task;
  index: number;
  onViewTask: (task: Task) => void;
}

export default function TaskCard({ card, index, onViewTask }: TaskCardProps) {
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

  const isDeadlineNear = (deadline?: string) => {
    if (!deadline) return false;
    const deadlineDate = dayjs(deadline);
    const now = dayjs();
    const hoursLeft = deadlineDate.diff(now, "hour", true);
    return hoursLeft < 24 && hoursLeft > 0;
  };

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    const deadlineDate = dayjs(deadline);
    const now = dayjs();
    return deadlineDate.isBefore(now);
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return "";
    const date = dayjs(deadline);
    const now = dayjs();
    const diffInHours = date.diff(now, "hour", true);

    if (diffInHours < 0) {
      return "Overdue";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h left`;
    } else {
      return date.format("MM/DD/YYYY");
    }
  };

  return (
    <Draggable key={card.id} draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          shadow={snapshot.isDragging ? "xl" : "sm"}
          className={`bg-white cursor-pointer w-[200px] ${
            snapshot.isDragging ? "ring-2 ring-blue-400" : ""
          }`}
          onClick={() => onViewTask(card)}
        >
          <Text fw={500} size="sm" mb="xs">
            {card.title || card.content}
          </Text>
          {card.description && (
            <Text size="xs" c="dimmed" mb="xs" className="line-clamp-2">
              {card.description}
            </Text>
          )}
          {card.tags && card.tags.length > 0 && (
            <Group gap="xs" mb="xs">
              {card.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} size="xs" variant="light" color="blue">
                  {tag}
                </Badge>
              ))}
              {card.tags.length > 2 && (
                <Badge size="xs" variant="outline">
                  +{card.tags.length - 2}
                </Badge>
              )}
            </Group>
          )}

          {/* Deadline */}
          {card.deadline && (
            <Group gap="xs" mb="xs">
              <Badge
                size="xs"
                variant="light"
                color={
                  isDeadlinePassed(card.deadline)
                    ? "red"
                    : isDeadlineNear(card.deadline)
                    ? "orange"
                    : "gray"
                }
                leftSection={<IconClock size={10} />}
              >
                {formatDeadline(card.deadline)}
              </Badge>
            </Group>
          )}

          {/* Bottom section with priority and assignees */}
          <Group justify="space-between" align="flex-end" mt="xs">
            <Group gap="xs">
              {card.priority && (
                <Badge
                  color={getPriorityColor(card.priority)}
                  variant="light"
                  size="xs"
                >
                  {card.priority}
                </Badge>
              )}
              {card.actualTime !== undefined && card.actualTime > 0 && (
                <Badge size="xs" variant="outline" color="blue">
                  {card.actualTime}h
                </Badge>
              )}
            </Group>

            {/* Assignees avatars */}
            {card.assignees && card.assignees.length > 0 && (
              <Avatar.Group spacing="xs">
                {card.assignees.slice(0, 3).map((assignee, idx) => (
                  <Tooltip key={idx} label={assignee} position="top">
                    <Avatar size="xs" radius="xl">
                      {assignee
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </Avatar>
                  </Tooltip>
                ))}
                {card.assignees.length > 3 && (
                  <Avatar size="xs" radius="xl">
                    +{card.assignees.length - 3}
                  </Avatar>
                )}
              </Avatar.Group>
            )}
          </Group>
        </Card>
      )}
    </Draggable>
  );
}
