"use client";
import { useState, useMemo } from "react";
import {
  Group,
  SegmentedControl,
  Button,
  TextInput,
  Select,
  Badge,
  Loader,
  Alert,
  Container,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { DropResult } from "@hello-pangea/dnd";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import AddTaskModal from "./AddTaskModal";
import TaskDetailModal from "./TaskDetailModal";
import KanbanTableView from "./KanbanTableView";
import Kanban from "./Kanban";
import { useProjectStore } from "../stores/projectStore";
import {
  useCreateTask,
  useCurrentProjectTasks,
  useTasksByProject,
  useUpdateTaskStatus,
} from "../hooks/task";
import {
  useAddStatus,
  useGetStatuses,
  useUpdateStatus,
  useDeleteStatus,
} from "@/hooks/status";
import { Task, TaskCreateRequest } from "@/types/api";
import { unionBy } from "lodash";
interface Column {
  id: string;
  title: string;
  cards: Task[];
}
export default function KanbanBoard() {
  const { currentProjectId } = useProjectStore();

  const { data: statuses } = useGetStatuses();
  const { mutateAsync: addStatus } = useAddStatus();
  const { mutateAsync: updateStatus } = useUpdateStatus();
  const { mutateAsync: deleteStatus } = useDeleteStatus();

  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useTasksByProject(currentProjectId as string);

  const { mutateAsync: createTask } = useCreateTask();
  const [view, setView] = useState<"board" | "table">("board");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  // const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [addTaskModalOpened, setAddTaskModalOpened] = useState(false);
  const [taskDetailModalOpened, setTaskDetailModalOpened] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [addTaskToColumnId, setAddTaskToColumnId] = useState<string | null>(
    null
  );
  const { mutateAsync: updateTaskStatus } = useUpdateTaskStatus();

  const columns: Column[] = useMemo(() => {
    return (
      statuses?.map((status) => ({
        id: status.id,
        title: status.name,
        cards: tasks?.filter((task) => task.statusId === status.id) || [],
      })) || []
    );
  }, [statuses, tasks]);
  const filteredColumns = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      cards: column.cards.filter((task) => {
        const matchesSearch = task.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesPriority =
          !selectedPriority || task.priority === selectedPriority;
        const matchesAssignee =
          !selectedAssignee ||
          task.assignees?.map((a) => a.user.id).includes(selectedAssignee);

        return matchesSearch && matchesPriority && matchesAssignee;
      }),
    }));
  }, [columns, searchTerm, selectedPriority, selectedAssignee]);
  const allTasks = columns.flatMap((col) => col.cards);
  const priorities = unionBy(
    allTasks.flatMap((task) => task.priority),
    (o) => o
  );
  const assignees = unionBy(
    allTasks.flatMap((task) => task.assignees || []),
    (o) => o.userId
  );
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    try {
      await updateTaskStatus({
        id: draggableId,
        statusId: destination.droppableId,
      });
    } catch (error) {
      console.error("Error handling drag end:", error);
    }
  };
  const handleAddTask = async (data: TaskCreateRequest) => {
    try {
      await createTask({
        ...data,
        statusId: addTaskToColumnId || statuses?.[0]?.id || "",
      });
    } catch (error) {
      console.error("Failed to create task:", error);
    }
    setAddTaskToColumnId(null);
    setAddTaskModalOpened(false);
  };
  const handleAddTaskToColumn = (columnId: string) => {
    setAddTaskToColumnId(columnId);
    setAddTaskModalOpened(true);
  };
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailModalOpened(true);
  };
  const handleEditTask = (updatedTask: Task) => {
    console.log("Edit task:", updatedTask);
  };
  const handleDeleteTask = (taskId: string) => {
    modals.openConfirmModal({
      title: "Delete Task",
      children: (
        <Text size="sm">
          Are you sure you want to delete this task? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        console.log("Delete task:", taskId);
      },
    });
  };
  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    try {
      await addStatus(newColumnTitle);
      setNewColumnTitle("");
      setIsAddingColumn(false);
    } catch (error) {
      console.error("Failed to add column:", error);
    }
  };
  const handleDeleteColumn = async (columnId: string) => {
    const column = statuses?.find((s) => s.id === columnId);
    const tasksInColumn =
      tasks?.filter((task) => task.statusId === columnId) || [];

    if (tasksInColumn.length > 0) {
      // Show warning if column has tasks
      modals.openConfirmModal({
        title: "Cannot Delete Column",
        children: (
          <Text size="sm">
            This column contains {tasksInColumn.length} task(s). Please move or
            delete all tasks before deleting the column.
          </Text>
        ),
        labels: { confirm: "OK", cancel: "Cancel" },
        onConfirm: () => {},
      });
      return;
    }

    modals.openConfirmModal({
      title: "Delete Column",
      children: (
        <Text size="sm">
          Are you sure you want to delete "{column?.name}"? This action cannot
          be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteStatus(columnId);
        } catch (error) {
          console.error("Failed to delete column:", error);
        }
      },
    });
  };
  const handleRenameColumn = async (columnId: string, newTitle: string) => {
    try {
      await updateStatus({ id: columnId, name: newTitle });
    } catch (error) {
      console.error("Failed to rename column:", error);
    }
  };
  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus({
        id: taskId,
        statusId: newStatus,
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedPriority(null);
    setSelectedAssignee(null);
    // setSelectedTag(null);
  };
  const hasActiveFilters = searchTerm || selectedPriority || selectedAssignee;
  if (tasksLoading) {
    return (
      <Container fluid>
        <Group justify="center" py="xl">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }
  if (tasksError) {
    return (
      <Container fluid>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error Loading Tasks"
          color="red"
          variant="light"
        >
          {tasksError.toString()}
          <Button mt="sm" size="xs" onClick={() => refetchTasks()}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }
  if (!currentProjectId) {
    return (
      <Container fluid>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="No Project Selected"
          color="blue"
          variant="light"
        >
          Please select a project from the sidebar to view tasks.
        </Alert>
      </Container>
    );
  }
  return (
    <div className="h-full">
      <div className="mb-6 space-y-4">
        <Group justify="space-between">
          <SegmentedControl
            value={view}
            onChange={(value) => setView(value as "board" | "table")}
            data={[
              { label: "Board View", value: "board" },
              { label: "Table View", value: "table" },
            ]}
          />
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setAddTaskModalOpened(true)}
          >
            Add Task
          </Button>
        </Group>

        <Group gap="sm">
          <TextInput
            placeholder="Search tasks..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Priority"
            leftSection={<IconFilter size={16} />}
            data={priorities.map((priority) => ({
              value: priority,
              label: priority.charAt(0).toUpperCase() + priority.slice(1),
            }))}
            value={selectedPriority}
            onChange={setSelectedPriority}
            clearable
          />
          <Select
            placeholder="Assignee"
            leftSection={<IconFilter size={16} />}
            data={assignees.map((assignee) => ({
              value: assignee.user.id,
              label: assignee.user.name,
            }))}
            value={selectedAssignee}
            onChange={setSelectedAssignee}
            clearable
          />
          {hasActiveFilters && (
            <Button
              variant="light"
              color="gray"
              leftSection={<IconX size={16} />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          )}
        </Group>

        {hasActiveFilters && (
          <Group gap="xs">
            {searchTerm && (
              <Badge variant="light" color="blue">
                Search: {searchTerm}
              </Badge>
            )}
            {selectedPriority && (
              <Badge variant="light" color="orange">
                Priority: {selectedPriority}
              </Badge>
            )}
            {selectedAssignee && (
              <Badge variant="light" color="green">
                Assignee:{" "}
                {
                  assignees.find((a) => a.userId === selectedAssignee)?.user
                    ?.name
                }
              </Badge>
            )}
          </Group>
        )}
      </div>

      {view === "board" ? (
        <Kanban
          columns={filteredColumns}
          onDragEnd={handleDragEnd}
          onTaskClick={handleTaskClick}
          onViewTask={handleTaskClick}
          onAddTask={handleAddTaskToColumn}
          onAddColumn={handleAddColumn}
          onDeleteColumn={handleDeleteColumn}
          onRenameColumn={handleRenameColumn}
          isAddingColumn={isAddingColumn}
          setIsAddingColumn={setIsAddingColumn}
          newColumnTitle={newColumnTitle}
          setNewColumnTitle={setNewColumnTitle}
        />
      ) : (
        <KanbanTableView
          tasks={filteredColumns.flatMap((col) => col.cards)}
          onViewTask={handleTaskClick}
          onTaskStatusChange={handleTaskStatusChange}
          statuses={statuses}
        />
      )}
      <AddTaskModal
        opened={addTaskModalOpened}
        onClose={() => setAddTaskModalOpened(false)}
        onAddTask={handleAddTask}
      />
      <TaskDetailModal
        opened={taskDetailModalOpened}
        onClose={() => setTaskDetailModalOpened(false)}
        taskId={selectedTask?.id as string}
      />
    </div>
  );
}
