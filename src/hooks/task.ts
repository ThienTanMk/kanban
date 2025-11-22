import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../services/taskApi";
import { useProjectStore } from "../stores/projectStore";
import { Task, CreateTaskDto, CreateSubtaskDto, UpdateTaskDto } from "../types/api";
import { queryClient } from "@/services/queryClient";
import { useAuth } from "./useAuth";
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: Record<string, any>, uid?: string) =>
    [...taskKeys.lists(), { filters, uid }] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string, uid?: string) =>
    [...taskKeys.details(), id, uid] as const,
  byProject: (projectId: string, uid?: string) =>
    [...taskKeys.all, "project", projectId, uid] as const,
  subtasks: (parentTaskId: string, uid?: string) =>
    [...taskKeys.all, "subtasks", parentTaskId, uid] as const,
};
export const useTasksByProject = (projectId?: string) => {
  const { uid } = useAuth();
  return useQuery({
    queryKey: taskKeys.byProject(projectId as string, uid),
    queryFn: () => taskApi.getTasksByProject(projectId as string),
    enabled: !!projectId && !!uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
export const useCurrentProjectTasks = () => {
  const { currentProjectId } = useProjectStore();
  return useTasksByProject(currentProjectId as string);
};
export const useTask = (id: string) => {
  const { uid } = useAuth();
  return useQuery({
    queryKey: taskKeys.detail(id, uid),
    queryFn: () => taskApi.getTask(id),
    enabled: !!id && !!uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
export const useCreateTask = () => {
  const { currentProjectId } = useProjectStore();
  const { uid } = useAuth();
  return useMutation({
    mutationFn: async (data: CreateTaskDto) => {
      const res = await taskApi.createTask(data);
      return res;
    },
    onSuccess: (response) => {
      if (currentProjectId && uid) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byProject(currentProjectId, uid),
        });
      }
    },
  });
};
// export const useUpdateTask = () => {
//   const { currentProjectId } = useProjectStore();
//   const { uid } = useAuth();
//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: CreateTaskDto }) =>
//       taskApi.updateTask(id, data),
//     onSuccess: (response, variables) => {
//       queryClient.invalidateQueries({
//         queryKey: taskKeys.detail(variables.id, uid),
//       });
//       if (currentProjectId && uid) {
//         queryClient.invalidateQueries({
//           queryKey: taskKeys.byProject(currentProjectId, uid),
//         });
//       }
//       queryClient.invalidateQueries({ queryKey: taskKeys.all });
//     },
//   });
// };
export const useUpdateTask = () => {
  const { currentProjectId } = useProjectStore();
  const { uid } = useAuth();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskDto }) => {
      if (!currentProjectId) return;
      const queryKey = taskKeys.byProject(currentProjectId, uid);
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

      if (previousTasks) {
        const updatedTasks = previousTasks.map((task) =>
          task.id === id ? { ...task, ...data } : task
        );
        queryClient.setQueryData(queryKey, updatedTasks);
      }

      return await taskApi.updateTask(id, data);
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.id, uid),
      });
      if (currentProjectId && uid) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byProject(currentProjectId, uid),
        });
      }
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
    onError: (error, variables) => {
      if (currentProjectId && uid) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byProject(currentProjectId, uid),
        });
      }
      console.error("Failed to update task:", error);
    },
  });
};
export const useDeleteTask = () => {
  const { currentProjectId } = useProjectStore();
  const { uid } = useAuth();
  return useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: (response) => {
      if (currentProjectId && uid) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byProject(currentProjectId, uid),
        });
      }
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};
// export const useUpdateTaskStatus = () => {
//   const { currentProjectId } = useProjectStore();
//   const { uid } = useAuth();

//   return useMutation({
//     mutationFn: async ({ id, statusId }: { id: string; statusId: string }) => {
//       // Optimistic update: Set data vào cache trước khi call API
//       if (currentProjectId && uid) {
//         const queryKey = taskKeys.byProject(currentProjectId, uid);
//         const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

//         if (previousTasks) {
//           const updatedTasks = previousTasks.map((task) =>
//             task.id === id ? { ...task, statusId: statusId } : task
//           );
//           queryClient.setQueryData(queryKey, updatedTasks);
//         }
//       }

//       return await taskApi.updateTaskStatus(id, statusId);
//     },
//     onSuccess: () => {
//       if (currentProjectId && uid) {
//         queryClient.invalidateQueries({
//           queryKey: taskKeys.byProject(currentProjectId, uid),
//         });
//       }
//     },
//     onError: (error, variables) => {
//       // Rollback optimistic update nếu API call thất bại
//       if (currentProjectId && uid) {
//         queryClient.invalidateQueries({
//           queryKey: taskKeys.byProject(currentProjectId, uid),
//         });
//       }
//       console.error("Failed to update task status:", error);
//     },
//   });
// };
export const useUpdateTaskStatus = () => {
  const { currentProjectId } = useProjectStore();
  const { uid } = useAuth();

  return useMutation({
    mutationFn: async ({ id, statusId }: { id: string; statusId: string }) => {
      if (currentProjectId && uid) {
        const queryKey = taskKeys.byProject(currentProjectId, uid);
        const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

        if (previousTasks) {
          const updatedTasks = previousTasks.map((task) =>
            task.id === id ? { ...task, statusId: statusId } : task
          );
          queryClient.setQueryData(queryKey, updatedTasks);
        }
      }
      return taskApi.updateTaskStatus(id, statusId);
    },
    onSuccess: () => {
      if (currentProjectId && uid) {
        queryClient.refetchQueries({
          queryKey: taskKeys.byProject(currentProjectId, uid),
        });
      }
    },
    onError: (error, variables) => {
      if (currentProjectId && uid) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byProject(currentProjectId, uid),
        });
      }
      console.error("Failed to update task status:", error);
    },
  });
};
export const useCreateSubtask = (parentTaskId: string) => {
  const { uid } = useAuth();
  return useMutation({
    mutationFn: (data: CreateSubtaskDto) => taskApi.createSubtask(parentTaskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(parentTaskId, uid),
      });
      queryClient.invalidateQueries({
        queryKey: taskKeys.subtasks(parentTaskId, uid),
      });
    },
  });
};

export const useGetSubtasks = (parentTaskId: string) => {
  const { uid } = useAuth();
  return useQuery({
    queryKey: taskKeys.subtasks(parentTaskId, uid),
    queryFn: () => taskApi.getSubtasks(parentTaskId),
    enabled: !!parentTaskId && !!uid,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateTaskWithAI = () => {
  const { currentProjectId } = useProjectStore();
  const { uid } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => taskApi.createTaskWithAI(data),
    onSuccess: () => {
      if (currentProjectId && uid) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byProject(currentProjectId, uid),
        });
      }
    },
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();
  const { uid } = useAuth();

  return useMutation({
    mutationFn: ({ taskId, userId }: { taskId: string; userId: string }) =>
      taskApi.assignTask(taskId, userId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId, uid) });
      const { currentProjectId } = useProjectStore.getState();
      if (currentProjectId && uid) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byProject(currentProjectId, uid),
        });
      }
    },
  });
};

export const useAssignTaskWithAI = () => {
  const queryClient = useQueryClient();
  const { uid } = useAuth();

  return useMutation({
    mutationFn: (taskId: string) => taskApi.assignTaskWithAI(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId, uid) });
      const { currentProjectId } = useProjectStore.getState();
      if (currentProjectId && uid) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byProject(currentProjectId, uid),
        });
      }
    },
  });
};

export const useBreakDownTask = () => {
  const queryClient = useQueryClient();
  const { uid } = useAuth();

  return useMutation({
    mutationFn: (taskId: string) => taskApi.breakDownTask(taskId),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId, uid) });
      queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(taskId, uid) });
      const { currentProjectId } = useProjectStore.getState();
      if (currentProjectId && uid) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byProject(currentProjectId, uid),
        });
      }
    },
  });
};