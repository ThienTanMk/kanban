"use client";
import { useMemo, useState } from "react";
import {
  Table,
  Paper,
  Text,
  Badge,
  Group,
  ActionIcon,
  Menu,
  Stack,
  Box,
  Container,
  Collapse,
  Tooltip,
} from "@mantine/core";
import {
  IconDots,
  IconEye,
  IconGripVertical,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import dayjs from "dayjs";
import { Task, StatusTask } from "@/types/api";

interface KanbanTableViewProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, newStatus: string) => void;
  statuses?: StatusTask[];
}

const getSubtasksForTask = (taskId: string): Task[] => {
  return [
    {
      id: `${taskId}-sub-1`,
      name: `Subtask for ${taskId}`,
      description: "Example subtask",
      priority: "HIGH",
      deadline: dayjs().add(1, "day").toISOString(),
      statusId: "todo",
      actualTime: 2,
    },
    {
      id: `${taskId}-sub-2`,
      name: `Another subtask for ${taskId}`,
      description: "Example subtask 2",
      priority: "LOW",
      deadline: dayjs().add(2, "day").toISOString(),
      statusId: "done",
      actualTime: 1,
    },
  ];
};
export default function KanbanTableView({
  tasks,
  onViewTask,
  onTaskStatusChange,
  statuses = [],
}: KanbanTableViewProps) {
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>(
    {}
  );
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
  const taskGroups = useMemo(() => {
    // Use statuses from props if available, otherwise fall back to hardcoded values
    const statusOrder =
      statuses.length > 0
        ? statuses.sort((a, b) => a.order - b.order).map((s) => s.name)
        : [];

    const grouped = tasks.reduce((acc, task) => {
      const status = task.status.name;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    return statusOrder.map((status) => ({
      status,
      tasks: grouped[status] || [],
      color: getStatusColor(status),
    }));
  }, [tasks, statuses]);
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "red";
      case "MEDIUM":
        return "yellow";
      case "LOW":
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
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    console.log(destination, source);
    const sourceGroupIndex = taskGroups.findIndex(
      (group) => `table-${group.status}` === source.droppableId
    );
    const destGroupIndex = taskGroups.findIndex(
      (group) => `table-${group.status}` === destination.droppableId
    );
    if (sourceGroupIndex === -1 || destGroupIndex === -1) return;
    const sourceGroup = taskGroups[sourceGroupIndex];
    const destGroup = taskGroups[destGroupIndex];
    const taskToMove = sourceGroup.tasks.find(
      (task) => task.id === draggableId
    );

    if (!taskToMove) return;
    let newTasks = [...tasks];
    newTasks = newTasks.filter((task) => task.id !== draggableId);
    if (sourceGroup.status !== destGroup.status) {
      const deskId = statuses.find(
        (task) => task.name === destGroup.status
      )?.id;

      if (onTaskStatusChange && deskId) {
        onTaskStatusChange(taskToMove.id, deskId);
      }
    }
  };
  const toggleTaskExpansion = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const SubtaskRow = ({ subtask }: { subtask: Task }) => (
    <Table.Tr
      // className="bg-gray-50 border-l-[3px] border-l-[#228be6]"
      style={{
        backgroundColor: "var(--monday-bg-tertiary)",
        borderLeft: "3px solid #0073EA",
      }}
    >
      <Table.Td>
        <Group gap="sm" align="center" ml={40}>
          <Box
            // className="w-1 h-1 rounded-full bg-[#228be6]"
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              backgroundColor: "#0073EA",
            }}
          />
          <div>
            <Text fw={500} size="sm" c="dimmed">
              {subtask.name}
            </Text>
            {subtask.description && (
              <Text size="xs" c="dimmed" className="truncate max-w-[180px]">
                {subtask.description}
              </Text>
            )}
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color="blue" variant="dot" size="md">
          Subtask
        </Badge>
      </Table.Td>
      <Table.Td>
        {subtask.priority && (
          <Badge
            color={getPriorityColor(subtask.priority)}
            variant="outline"
            size="sm"
          >
            {subtask.priority?.toUpperCase()}
          </Badge>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {subtask.assignees && subtask.assignees.length > 0
            ? subtask.assignees.map((a) => a.user.name).join(", ")
            : "-"}
        </Text>
      </Table.Td>
      <Table.Td>{formatDeadline(subtask.deadline)}</Table.Td>
      <Table.Td>
        <Text size="sm">
          {subtask.actualTime !== undefined && subtask.actualTime > 0
            ? `${subtask.actualTime}h`
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
              onClick={() => onViewTask(subtask)}
            >
              View
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  );
  const TaskRow = ({
    task,
    index,
    groupStatus,
  }: {
    task: Task;
    index: number;
    groupStatus: string;
  }) => {
    const subtasks = getSubtasksForTask(task.id);
    const isExpanded = expandedTasks[task.id] || false;
    const hasSubtasks = subtasks.length > 0;
    return (
      <>
        <Draggable key={task.id} draggableId={task.id} index={index}>
          {(provided, snapshot) => (
            <Table.Tr
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={`${
                snapshot.isDragging ? "bg-gray-50 opacity-80" : "opacity-100"
              } transition-all`}
              style={provided.draggableProps.style}
            >
              <Table.Td>
                <Group gap="sm" align="center">
                  <div
                    {...provided.dragHandleProps}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <IconGripVertical size={16} color="#999" />
                  </div>
                  {hasSubtasks && (
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={(e) => toggleTaskExpansion(task.id, e)}
                      color="blue"
                    >
                      {isExpanded ? (
                        <IconChevronDown size={16} />
                      ) : (
                        <IconChevronRight size={16} />
                      )}
                    </ActionIcon>
                  )}
                  {!hasSubtasks && <Box style={{ width: 28 }} />}
                  <div>
                    <Text fw={500} size="sm" className="truncate max-w-[200px]">
                      {task.name}
                    </Text>
                    {task.description && (
                      <Text
                        size="xs"
                        c="dimmed"
                        className="truncate max-w-[200px]"
                      >
                        {task.description}
                      </Text>
                    )}
                  </div>
                </Group>
              </Table.Td>
              <Table.Td>
                {hasSubtasks ? (
                  <Tooltip label={`${subtasks.length} subtask(s)`}>
                    <Badge
                      color="blue"
                      variant="light"
                      size="md"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => toggleTaskExpansion(task.id, e)}
                    >
                      {subtasks.length}
                    </Badge>
                  </Tooltip>
                ) : (
                  <Text size="sm" c="dimmed">
                    -
                  </Text>
                )}
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
                    ? task.assignees.map((a) => a.user.name).join(", ")
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
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          )}
        </Draggable>
        {isExpanded && hasSubtasks && (
          <>
            {subtasks.map((subtask) => (
              <SubtaskRow key={subtask.id} subtask={subtask} />
            ))}
          </>
        )}
      </>
    );
  };
  return (
    <Container
      fluid
      className="bg-[var(--monday-bg-board)] text-[var(--monday-text-primary)]"
      style={{
        width: "100vw",
        maxWidth: "100%",
        paddingLeft: 0,
        paddingRight: 0,
        margin: 0,
      }}
    >
      <div className="mb-4 p-1">
        <Text size="lg" fw={600} c="var(--monday-text-primary)">
          Tasks Table View by Status
        </Text>
        <Text size="sm" c="var(--monday-text-secondary)">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} total across{" "}
          {taskGroups.filter((group) => group.tasks.length > 0).length} status
          groups
        </Text>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Stack>
          {taskGroups.map((group) => (
            <Paper
              key={group.status}
              shadow="sm"
              p="md"
              className="rounded-lg shadow-sm transition-all"
              style={{
                backgroundColor: "var(--monday-bg-card)",
                border: `1px solid var(--monday-border-primary)`,
              }}
            >
              <Group justify="space-between" mb="md">
                <Group gap="sm">
                  <Badge
                    color={group.color}
                    variant="light"
                    size="lg"
                    style={{ fontWeight: 600 }}
                  >
                    {group.status}
                  </Badge>
                  <Text size="sm" c="var(--monday-text-secondary)">
                    {group.tasks.length} task
                    {group.tasks.length !== 1 ? "s" : ""}
                  </Text>
                </Group>
              </Group>
              <Droppable droppableId={`table-${group.status}`}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      backgroundColor: snapshot.isDraggingOver
                        ? `var(--mantine-color-${group.color}-0)`
                        : "transparent",
                      borderRadius: "4px",
                      minHeight: group.tasks.length === 0 ? "60px" : "auto",
                      padding: snapshot.isDraggingOver ? "8px" : "0",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {group.tasks.length > 0 ? (
                      <Table
                        // striped
                        highlightOnHover={false}
                        // className="w-full table-fixed border-collapse"
                        // [&_tbody_tr]:bg-[var(--monday-bg-card)]
                        className="
                          [&_thead_tr_th]:bg-[var(--monday-bg-tertiary)]
                          [&_tbody_tr]:transition-colors
                          [&_tbody_tr:hover]:bg-[var(--monday-bg-hover)] 
                          [&_th]:text-[var(--monday-text-secondary)] 
                          [&_td]:text-[var(--monday-text-primary)] 
                          border-collapse
                        "
                      >
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th className="w-[20%]">Task</Table.Th>
                            <Table.Th className="w-[10%]">Subtasks</Table.Th>
                            <Table.Th className="w-[10%]">Priority</Table.Th>
                            <Table.Th className="w-[25%]">Assignees</Table.Th>
                            <Table.Th className="w-[15%]">Deadline</Table.Th>
                            <Table.Th className="w-[15%]">Actual Time</Table.Th>
                            <Table.Th className="w-[10%]">Actions</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {group.tasks.map((task, index) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              index={index}
                              groupStatus={group.status}
                            />
                          ))}
                        </Table.Tbody>
                      </Table>
                    ) : (
                      <Box
                        p="xl"
                        style={{
                          textAlign: "center",
                          border: snapshot.isDraggingOver
                            ? `2px dashed var(--mantine-color-${group.color}-4)`
                            : `1px dashed var(--monday-border-primary)`,
                          borderRadius: "8px",
                          backgroundColor: snapshot.isDraggingOver
                            ? "var(--monday-bg-hover)"
                            : "var(--monday-bg-card)",
                        }}
                      >
                        <Text c="var(--monday-text-secondary)" size="sm">
                          {snapshot.isDraggingOver
                            ? `Drop task here to move to ${group.status}`
                            : `No tasks in ${group.status}`}
                        </Text>
                      </Box>
                    )}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          ))}
        </Stack>
      </DragDropContext>
    </Container>
  );
}
