"use client";

import { Paper, Text, Group, Badge, Button } from "@mantine/core";
import { Droppable, DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { IconPlus, IconGripVertical } from "@tabler/icons-react";
import TaskCard from "./TaskCard";

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

interface Column {
  id: string;
  title: string;
  cards: Task[];
}

interface KanbanColumnProps {
  column: Column;
  onViewTask: (task: Task) => void;
  onAddTask: () => void;
  onDeleteColumn?: () => void;
  onRenameColumn?: (newTitle: string) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

export default function KanbanColumn({
  column,
  onViewTask,
  onAddTask,
  onDeleteColumn,
  onRenameColumn,
  dragHandleProps,
}: KanbanColumnProps) {
  return (
    <Paper
      key={column.id}
      shadow="md"
      radius="md"
      p="md"
      className="bg-gray-100 min-w-[240px] w-[240px]"
    >
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing"
          >
            <IconGripVertical size={16} color="#666" />
          </div>
          <Text fw={700} size="lg">
            {column.title}
          </Text>
        </Group>
        <Badge variant="outline" size="sm">
          {column.cards.length}
        </Badge>
      </Group>
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-col gap-2 min-h-[100px]"
          >
            {column.cards.map((card, idx) => (
              <TaskCard
                key={card.id}
                card={card}
                index={idx}
                onViewTask={onViewTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <Button
        variant="light"
        leftSection={<IconPlus size={16} />}
        fullWidth
        mt="md"
        onClick={onAddTask}
      >
        Add Task
      </Button>
    </Paper>
  );
}
