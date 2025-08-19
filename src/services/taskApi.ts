import { Task, TaskCreateRequest, TaskUpdateRequest } from "../types/api";
import { instance } from "./axios";

export const taskApi = {
  getTasksByProject: async (
    projectId: string,
    page = 1,
    limit = 50
  ): Promise<Task[]> => {
    const response = await instance.get(
      `/projects/${projectId}/tasks?page=${page}&limit=${limit}`
    );
    return response.data;
  },
  getTask: async (id: string): Promise<Task> => {
    const response = await instance.get(`/tasks/${id}`);
    return response.data;
  },
  createTask: async (data: TaskCreateRequest): Promise<Task> => {
    const response = await instance.post("/tasks", data);
    return response.data;
  },
  updateTask: async (id: string, data: TaskUpdateRequest): Promise<Task> => {
    const response = await instance.put(`/tasks/${id}`, data);
    return response.data;
  },
  deleteTask: async (id: string): Promise<{ id: string }> => {
    const response = await instance.delete(`/tasks/${id}`);
    return response.data;
  },
  updateTaskStatus: async (id: string, statusId: string): Promise<Task> => {
    const response = await instance.patch(`/tasks/${id}/status`, { statusId });
    return response.data;
  },
};
