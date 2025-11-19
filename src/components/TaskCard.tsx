import { Card, Text, Group, Badge, Avatar, Tooltip } from "@mantine/core";
import {
  IconClock,
  IconMessageCircle,
  IconPaperclip,
  IconLink,
  IconCircleCheck,
  IconAlertCircle,
  IconHexagon,
  IconStarFilled,
  IconCalendar,
  IconTags,
  IconSubtask,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Task } from "@/types/api";
import { memo } from "react";
import { formatDeadline, getPriorityColor } from "@/lib/utils";
import { Calendar } from "@mantine/dates";
import { useGetCommentByTaskId } from "@/hooks/comment";
import { useGetSubtasks } from "@/hooks/task";

interface TaskCardProps {
  card: Task;
  onViewTask: (task: Task) => void;
  isDragging?: boolean;
  isCalendarView?: boolean;
}

export default memo(function TaskCard({
  card,
  onViewTask,
  isDragging = false,
  isCalendarView = false,
}: TaskCardProps) {
  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return dayjs(deadline).isBefore(dayjs());
  };

  const isDeadlineNear = (deadline?: string) => {
    if (!deadline) return false;
    const hoursLeft = dayjs(deadline).diff(dayjs(), "hour", true);
    return hoursLeft < 24 && hoursLeft > 0;
  };

  const hasProgress = card.estimatedTime && card.actualTime !== undefined;
  const progressCompleted = card.actualTime || 0;
  const progressTotal = card.estimatedTime || 0;
  const isCompleted = hasProgress && progressCompleted >= progressTotal;

  const { data: comments } = useGetCommentByTaskId(card.id);
  const commentsCount = comments?.length ?? 0;

  const { data: subtasks } = useGetSubtasks(card.id);
  const subtaskCount = subtasks?.length ?? 0;

  // Calendar
  if (isCalendarView) {
    if (card.parentTaskId) return null;
    const priorityColor = getPriorityColor(card.priority);
    return (
      <Card
        shadow={isDragging ? "xl" : "sm"}
        className={`cursor-pointer w-full ${
          isDragging ? "ring-4 ring-blue-500" : "border border-gray-200"
        }`}
        style={{
          backgroundColor: "var(--monday-bg-card)",
          transform: isDragging ? "scale(1.02)" : "scale(1)",
          transition: isDragging ? "transform 200ms ease" : "none",
          willChange: isDragging ? "transform" : "auto",
          borderRadius: 8,
        }}
        onClick={() => onViewTask(card)}
        p={0}
      >
        <div style={{ padding: 10 }}>
          <Text fw={500} size="sm" c={priorityColor}>
            {card.name}
          </Text>
        </div>
      </Card>
    );
  }

  if (card.parentTaskId) return null;

  return (
    <Card
      shadow={isDragging ? "xl" : "sm"}
      className={`cursor-pointer w-full ${
        isDragging ? "ring-4 ring-blue-500" : "border border-gray-200"
      }`}
      style={{
        backgroundColor: "var(--monday-bg-card)",
        transform: isDragging ? "scale(1.02)" : "scale(1)",
        transition: isDragging ? "transform 200ms ease" : "none",
        willChange: isDragging ? "transform" : "auto",
        borderRadius: 8,
        overflow: "hidden",
      }}
      onClick={() => onViewTask(card)}
      p={0}
    >
      {/* Main content */}
      <div style={{ padding: "10px 12px" }}>
        <Group gap={8} mb={8} wrap="nowrap" align="flex-start">
          <div
            style={{
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--monday-bg-card)",
              borderRadius: 4,
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            <IconCircleCheck size={14} style={{ opacity: 0.6 }} />
          </div>

          <Text fw={500} size="sm" style={{ flex: 1, lineHeight: 1.4 }}>
            {card.name}
          </Text>

          {card.priority === "MEDIUM" && !isCompleted && (
            <IconStarFilled
              size={16}
              style={{ color: getPriorityColor("MEDIUM"), flexShrink: 0 }}
            />
          )}
          {card.priority === "HIGH" && !isCompleted && (
            <IconAlertCircle
              size={16}
              style={{ color: getPriorityColor("HIGH"), flexShrink: 0 }}
            />
          )}
          {card.priority === "LOW" && !isCompleted && (
            <IconHexagon
              size={16}
              style={{ color: getPriorityColor("LOW"), flexShrink: 0 }}
            />
          )}
          {isCompleted && (
            <IconCircleCheck
              size={16}
              style={{ color: getPriorityColor("completed"), flexShrink: 0 }}
            />
          )}
        </Group>

        {card.description && (
          <Text
            size="xs"
            c="dimmed"
            mb={12}
            lineClamp={2}
            style={{ lineHeight: 1.4 }}
          >
            {card.description}
          </Text>
        )}

        {card.priority && (
          <Group gap={6} mb={0}>
            <Badge
              size="xs"
              variant="light"
              color={getPriorityColor(card.priority)}
              style={{
                fontSize: 10,
                paddingLeft: 6,
                paddingRight: 6,
                height: 20,
                fontWeight: 500,
              }}
            >
              {card.priority}
            </Badge>
          </Group>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px dashed var(--mantine-color-gray-6)",
        }}
      >
        <Group justify="space-between" wrap="wrap" gap={8}>
          <Group gap={12} style={{ fontSize: 12 }}>
            {card.deadline && (
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
                leftSection={<IconCalendar size={10} />}
              >
                {formatDeadline(card.deadline)}
              </Badge>
              // <div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
              //   <IconCalendar className="size-3" />
              //   <span>{formatDeadline(card.deadline)}</span>
              // </div>
            )}

            {/* Comments */}
            {commentsCount > 0 && (
              <Group
                gap={6}
                style={{
                  border: "1px solid var(--mantine-color-gray-3)",
                  borderRadius: 4,
                  padding: "4px 8px",
                }}
              >
                <IconMessageCircle size={12} style={{ opacity: 0.6 }} />
                <Text size="xs" c="dimmed">
                  {commentsCount}
                </Text>
              </Group>
            )}

            {/* subtask */}
            {subtaskCount > 0 && (
              <Group
                gap={6}
                style={{
                  border: "1px solid var(--mantine-color-gray-3)",
                  borderRadius: 4,
                  padding: "4px 8px",
                }}
              >
                <IconSubtask size={12} style={{ opacity: 0.6 }} />
                <Text size="xs" c="dimmed">
                  {subtaskCount}
                </Text>
              </Group>
            )}

            {hasProgress && (
              <Group
                gap={6}
                style={{
                  border: "1px solid var(--mantine-color-gray-3)",
                  borderRadius: 4,
                  padding: "4px 8px",
                }}
              >
                {isCompleted ? (
                  <IconCircleCheck
                    size={12}
                    style={{ color: getPriorityColor("completed") }}
                  />
                ) : (
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      border: `2px solid ${getPriorityColor("completed")}`,
                      borderTopColor: "transparent",
                    }}
                  />
                )}
                <Text size="xs" c="dimmed">
                  {progressCompleted}/{progressTotal}
                </Text>
              </Group>
            )}
          </Group>

          {card.assignees && card.assignees.length > 0 && (
            <Avatar.Group spacing="xs">
              {card.assignees.slice(0, 3).map((assignee, idx) => (
                <Tooltip
                  key={idx}
                  label={assignee?.user?.name ?? assignee?.userId ?? "Unknown"}
                  position="top"
                >
                  <Avatar
                    size="xs"
                    radius="xl"
                    src={assignee?.user?.avatar ?? undefined}
                  >
                    {(
                      assignee?.user?.name?.charAt(0) ??
                      assignee?.userId?.charAt(0) ??
                      "R"
                    ).toUpperCase()}
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
      </div>
    </Card>
  );
});
