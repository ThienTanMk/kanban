"use client";
import { useState } from "react";
import {
  Group,
  SegmentedControl,
  Button,
  TextInput,
  Select,
  Badge,
  Menu,
} from "@mantine/core";
import { DropResult } from "@hello-pangea/dnd";
import { IconPlus, IconSearch, IconFilter, IconX } from "@tabler/icons-react";
import AddTaskModal from "./AddTaskModal";
import TaskDetailModal from "./TaskDetailModal";
import KanbanTableView from "./KanbanTableView";
import Kanban from "./Kanban";
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
  assignees?: string[]; // Changed from assignee to assignees (multiple)
  authors?: string[]; // Added multiple authors
  status: string;
  tags?: string[];
  comments?: Comment[];
  history?: HistoryEntry[];
  createdAt?: string;
  deadline?: string; // Added deadline
  actualTime?: number; // Added actual time in hours
}

interface Column {
  id: string;
  title: string;
  cards: Task[];
}

const initialData: Column[] = [
  {
    id: "column-1",
    title: "Backlog",
    cards: [
      {
        id: "card-1",
        content: "Task 1",
        title: "Complete project setup",
        description: "Set up the initial project structure and dependencies",
        priority: "high",
        assignees: ["John Doe", "Jane Smith"],
        authors: ["John Doe"],
        status: "Backlog",
        tags: ["urgent", "setup"],
        deadline: "2025-08-20T23:59:59Z",
        actualTime: 0,
        comments: [],
        history: [
          {
            id: "h1",
            action: "Created task",
            author: "John Doe",
            createdAt: "2025-08-14T10:00:00Z",
          },
        ],
        createdAt: "2025-08-14T10:00:00Z",
      },
    ],
  },
  {
    id: "column-2",
    title: "To Do",
    cards: [
      {
        id: "card-2",
        content: "Task 2",
        title: "Design review",
        description: "Review the UI/UX designs with the team",
        priority: "medium",
        assignees: ["Jane Smith"],
        authors: ["Jane Smith", "Bob Johnson"],
        status: "To Do",
        tags: ["design", "review"],
        deadline: "2025-08-18T17:00:00Z",
        actualTime: 2.5,
        comments: [],
        history: [
          {
            id: "h2",
            action: "Created task",
            author: "Jane Smith",
            createdAt: "2025-08-14T10:30:00Z",
          },
        ],
        createdAt: "2025-08-14T10:30:00Z",
      },
    ],
  },
  {
    id: "column-3",
    title: "In Progress",
    cards: [
      {
        id: "card-3",
        content: "Task 3",
        title: "Implement authentication",
        description: "Add login and registration functionality",
        priority: "high",
        assignees: ["Bob Johnson"],
        authors: ["Bob Johnson", "Alice Brown"],
        status: "In Progress",
        tags: ["auth", "backend"],
        deadline: "2025-08-22T12:00:00Z",
        actualTime: 8.5,
        comments: [
          {
            id: "c1",
            text: "Started working on the OAuth integration",
            author: "Bob Johnson",
            createdAt: "2025-08-14T11:00:00Z",
            attachments: [
              {
                id: "att1",
                name: "oauth-config.json",
                size: 1024,
                type: "application/json",
                url: "/files/oauth-config.json",
                uploadedAt: "2025-08-14T11:00:00Z",
              },
            ],
          },
        ],
        history: [
          {
            id: "h3",
            action: "Created task",
            author: "Bob Johnson",
            createdAt: "2025-08-14T09:00:00Z",
          },
          {
            id: "h4",
            action: "Moved to In Progress",
            author: "Bob Johnson",
            createdAt: "2025-08-14T11:00:00Z",
          },
        ],
        createdAt: "2025-08-14T09:00:00Z",
      },
    ],
  },
  {
    id: "column-4",
    title: "Code Review",
    cards: [],
  },
  {
    id: "column-5",
    title: "Testing",
    cards: [],
  },
  {
    id: "column-6",
    title: "Done",
    cards: [
      {
        id: "card-4",
        content: "Task 4",
        title: "Setup database",
        description: "Configure PostgreSQL database",
        priority: "medium",
        assignees: ["Alice Brown"],
        authors: ["Alice Brown"],
        status: "Done",
        tags: ["database", "setup"],
        deadline: "2025-08-15T18:00:00Z",
        actualTime: 6.0,
        comments: [
          {
            id: "c2",
            text: "Database configured successfully",
            author: "Alice Brown",
            createdAt: "2025-08-14T12:00:00Z",
            attachments: [
              {
                id: "att2",
                name: "database-schema.sql",
                size: 2048,
                type: "application/sql",
                url: "/files/database-schema.sql",
                uploadedAt: "2025-08-14T12:00:00Z",
              },
              {
                id: "att3",
                name: "setup-screenshot.png",
                size: 512000,
                type: "image/png",
                url: "/files/setup-screenshot.png",
                uploadedAt: "2025-08-14T12:05:00Z",
              },
            ],
          },
        ],
        history: [
          {
            id: "h5",
            action: "Created task",
            author: "Alice Brown",
            createdAt: "2025-08-14T08:00:00Z",
          },
          {
            id: "h6",
            action: "Completed task",
            author: "Alice Brown",
            createdAt: "2025-08-14T12:00:00Z",
          },
        ],
        createdAt: "2025-08-14T08:00:00Z",
      },
    ],
  },
];

export default function KanbanBoard() {
  const [columns, setColumns] = useState(initialData);
  const [viewMode, setViewMode] = useState<string>("board");
  const [addTaskModalOpened, setAddTaskModalOpened] = useState(false);
  const [taskDetailModalOpened, setTaskDetailModalOpened] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedDeadlineFilter, setSelectedDeadlineFilter] = useState<
    string | null
  >(null);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Handle column reordering
    if (type === "COLUMN") {
      const newColumns = Array.from(columns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);
      setColumns(newColumns);
      return;
    }

    // Handle task reordering (existing logic)
    const sourceColIdx = columns.findIndex(
      (col) => col.id === source.droppableId
    );
    const destColIdx = columns.findIndex(
      (col) => col.id === destination.droppableId
    );
    const sourceCol = columns[sourceColIdx];
    const destCol = columns[destColIdx];
    const sourceCards = Array.from(sourceCol.cards);
    const [removed] = sourceCards.splice(source.index, 1);

    if (sourceCol === destCol) {
      sourceCards.splice(destination.index, 0, removed);
      const newColumns = [...columns];
      newColumns[sourceColIdx] = { ...sourceCol, cards: sourceCards };
      setColumns(newColumns);
    } else {
      const destCards = Array.from(destCol.cards);
      destCards.splice(destination.index, 0, removed);
      const newColumns = [...columns];
      newColumns[sourceColIdx] = { ...sourceCol, cards: sourceCards };
      newColumns[destColIdx] = { ...destCol, cards: destCards };
      setColumns(newColumns);
    }
  };

  const handleAddTask = (taskData: {
    title: string;
    description: string;
    priority: string;
    assignees: string[];
    deadline?: string;
    authors: string[];
  }) => {
    const newTask: Task = {
      id: `card-${dayjs().valueOf()}`,
      content: taskData.title,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      assignees: taskData.assignees,
      authors: taskData.authors, // Use authors from modal (current user)
      status: "Backlog",
      tags: [],
      deadline: taskData.deadline,
      actualTime: 0,
      comments: [],
      history: [
        {
          id: `history-${dayjs().valueOf()}`,
          action: "Task created",
          author: taskData.authors[0] || "Unknown", // Use first author
          createdAt: dayjs().toISOString(),
        },
      ],
      createdAt: dayjs().toISOString(),
    };

    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === "column-1" ? { ...col, cards: [...col.cards, newTask] } : col
      )
    );
    setAddTaskModalOpened(false);
  };

  const handleAddTaskToColumn = (columnId: string) => {
    // For now, open the modal - in a real app you might want a quick add feature
    setAddTaskModalOpened(true);
  };

  const handleEditTask = (task: Task) => {
    // Implement edit functionality
    console.log("Edit task:", task);
  };

  const handleDeleteTask = (taskId: string) => {
    const newColumns = columns.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => card.id !== taskId),
    }));
    setColumns(newColumns);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailModalOpened(true);
  };

  const handleReorderTasks = (
    reorderedTasks: (Task & { status: string })[]
  ) => {
    // Simply reorder all tasks and redistribute them to columns
    // This maintains the drag and drop order
    const allTasks = getAllTasks();

    // Create a position map from the reordered tasks
    const positionMap = new Map(
      reorderedTasks.map((task, index) => [task.id, index])
    );

    // Sort all tasks based on the new order
    const sortedTasks = allTasks.sort((a, b) => {
      const posA = positionMap.get(a.id) ?? 0;
      const posB = positionMap.get(b.id) ?? 0;
      return posA - posB;
    });

    // Keep the original column structure but update the task order
    let taskIndex = 0;
    const newColumns = columns.map((column) => {
      const columnTaskCount = column.cards.length;
      const columnTasks = sortedTasks.slice(
        taskIndex,
        taskIndex + columnTaskCount
      );
      taskIndex += columnTaskCount;

      return {
        ...column,
        cards: columnTasks.map((task) => ({
          ...task,
          status: column.title, // Ensure status matches column title
        })),
      };
    });

    setColumns(newColumns);
  };

  const getAllTasks = () => {
    return columns.flatMap((column) =>
      column.cards.map((card) => ({
        ...card,
        status: column.title,
      }))
    );
  };

  // Get unique values for filter options
  const getUniqueAssignees = () => {
    const assignees = new Set<string>();
    columns.forEach((column) => {
      column.cards.forEach((card) => {
        if (card.assignees) {
          card.assignees.forEach((assignee) => assignees.add(assignee));
        }
      });
    });
    return Array.from(assignees).map((assignee) => ({
      value: assignee,
      label: assignee,
    }));
  };

  const getUniqueTags = () => {
    const tags = new Set<string>();
    columns.forEach((column) => {
      column.cards.forEach((card) => {
        if (card.tags) {
          card.tags.forEach((tag) => tags.add(tag));
        }
      });
    });
    return Array.from(tags).map((tag) => ({ value: tag, label: tag }));
  };

  const priorities = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const deadlineFilters = [
    { value: "overdue", label: "Overdue" },
    { value: "today", label: "Due Today" },
    { value: "thisWeek", label: "Due This Week" },
    { value: "nextWeek", label: "Due Next Week" },
    { value: "noDeadline", label: "No Deadline" },
  ];

  // Filter function
  const filterTask = (task: Task) => {
    // Search term filter
    if (
      searchTerm &&
      !task.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !task.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !task.content?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Priority filter
    if (
      selectedPriority &&
      task.priority &&
      task.priority !== selectedPriority
    ) {
      return false;
    }

    // Assignee filter
    if (selectedAssignee) {
      if (!task.assignees || !task.assignees.includes(selectedAssignee)) {
        return false;
      }
    }

    // Tags filter
    if (selectedTag) {
      if (!task.tags || !task.tags.includes(selectedTag)) {
        return false;
      }
    }

    // Deadline filter
    if (selectedDeadlineFilter) {
      const now = dayjs();
      const taskDeadline = task.deadline ? dayjs(task.deadline) : null;

      switch (selectedDeadlineFilter) {
        case "overdue":
          if (!taskDeadline || !taskDeadline.isBefore(now)) return false;
          break;
        case "today":
          if (!taskDeadline || !taskDeadline.isSame(now, "day")) return false;
          break;
        case "thisWeek":
          if (!taskDeadline || !taskDeadline.isSame(now, "week")) return false;
          break;
        case "nextWeek":
          const nextWeek = now.add(1, "week");
          if (!taskDeadline || !taskDeadline.isSame(nextWeek, "week"))
            return false;
          break;
        case "noDeadline":
          if (taskDeadline) return false;
          break;
      }
    }

    return true;
  };

  // Get filtered columns
  const getFilteredColumns = () => {
    if (
      !searchTerm &&
      !selectedPriority &&
      !selectedAssignee &&
      !selectedTag &&
      !selectedDeadlineFilter
    ) {
      return columns;
    }

    return columns.map((column) => ({
      ...column,
      cards: column.cards.filter(filterTask),
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedPriority(null);
    setSelectedAssignee(null);
    setSelectedTag(null);
    setSelectedDeadlineFilter(null);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      searchTerm !== "" ||
      selectedPriority !== null ||
      selectedAssignee !== null ||
      selectedTag !== null ||
      selectedDeadlineFilter !== null
    );
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumn: Column = {
      id: `column-${dayjs().valueOf()}`,
      title: newColumnTitle.trim(),
      cards: [],
    };

    setColumns([...columns, newColumn]);
    setNewColumnTitle("");
    setIsAddingColumn(false);
  };

  const handleDeleteColumn = (columnId: string) => {
    setColumns(columns.filter((col) => col.id !== columnId));
  };

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    setColumns(
      columns.map((col) =>
        col.id === columnId ? { ...col, title: newTitle } : col
      )
    );
  };

  return (
    <div className="p-4">
      {/* Controls */}
      <div className="mb-6">
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <SegmentedControl
              value={viewMode}
              onChange={setViewMode}
              data={[
                { label: "Board", value: "board" },
                { label: "Table", value: "table" },
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
            <Menu shadow="md" width={400} position="bottom-end">
              <Menu.Target>
                <Button
                  variant="subtle"
                  leftSection={<IconFilter size={16} />}
                  color={hasActiveFilters() ? "blue" : "gray"}
                >
                  Filters
                  {hasActiveFilters() && (
                    <Badge size="xs" color="blue" ml="xs">
                      {
                        [
                          searchTerm !== "",
                          selectedPriority !== null,
                          selectedAssignee !== null,
                          selectedTag !== null,
                          selectedDeadlineFilter !== null,
                        ].filter(Boolean).length
                      }
                    </Badge>
                  )}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <div className="p-4">
                  <div className="mb-3">
                    <TextInput
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      leftSection={<IconSearch size={16} />}
                      rightSection={
                        searchTerm && (
                          <IconX
                            size={16}
                            style={{ cursor: "pointer" }}
                            onClick={() => setSearchTerm("")}
                          />
                        )
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <Select
                      placeholder="Priority"
                      data={priorities}
                      value={selectedPriority}
                      onChange={setSelectedPriority}
                      clearable
                    />
                  </div>

                  <div className="mb-3">
                    <Select
                      placeholder="Assignees"
                      data={getUniqueAssignees()}
                      value={selectedAssignee}
                      onChange={setSelectedAssignee}
                      clearable
                    />
                  </div>

                  <div className="mb-3">
                    <Select
                      placeholder="Tags"
                      data={getUniqueTags()}
                      value={selectedTag}
                      onChange={setSelectedTag}
                      clearable
                    />
                  </div>

                  <div className="mb-3">
                    <Select
                      placeholder="Deadline"
                      data={deadlineFilters}
                      value={selectedDeadlineFilter}
                      onChange={setSelectedDeadlineFilter}
                      clearable
                    />
                  </div>

                  {hasActiveFilters() && (
                    <Button
                      size="xs"
                      variant="subtle"
                      color="gray"
                      onClick={clearAllFilters}
                      leftSection={<IconX size={14} />}
                      fullWidth
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </div>

      {/* Content */}
      {viewMode === "board" ? (
        <Kanban
          columns={getFilteredColumns()}
          onDragEnd={onDragEnd}
          onTaskClick={handleViewTask}
          onViewTask={handleViewTask}
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
          tasks={getAllTasks().filter(filterTask)}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onViewTask={handleViewTask}
          onReorderTasks={handleReorderTasks}
        />
      )}

      {/* Modals */}
      <AddTaskModal
        opened={addTaskModalOpened}
        onClose={() => setAddTaskModalOpened(false)}
        onAddTask={handleAddTask}
      />

      <TaskDetailModal
        opened={taskDetailModalOpened}
        onClose={() => setTaskDetailModalOpened(false)}
        task={selectedTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
