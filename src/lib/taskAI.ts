import { taskApi } from "@/services/taskApi";
import { GeneratedTask } from "@/components/agent/GenerativeTaskModal";
import { Priority } from "@/types/api";

export const generateTasksAI = async (
  descriptions: string[],
  projectId: string
): Promise<GeneratedTask[]> => {
  const tasksFromAI = await Promise.all(
    descriptions.map((desc) =>
      taskApi.createTaskWithAI({ description: desc, projectId })
    )
  );

  return tasksFromAI.map((task) => ({
    id: task.id,
    name: task.name || "",
    description: task.description || "",
    priority: task.priority || (Priority.MEDIUM as Priority),
    deadline: task.deadline || "",
    estimatedTime: task.estimatedTime || 0,
    assigned:
      task.assignees?.map((a) => a.user.name || a.user.email || a.userId) || [],
  }));
};
