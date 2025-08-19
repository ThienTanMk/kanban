import { instance } from "./axios";

export async function getCommentByTaskId(taskId: string) {
  const res = await instance.get(`/comments/tasks/${taskId}`);
  return res.data;
}

export async function addComment(taskId: string, content: string) {
  const res = await instance.post(`/comments`, { taskId, content });
  return res.data;
}

export async function deleteComment(commentId: string) {
  const res = await instance.delete(`/comments/${commentId}`);
  return res.data;
}
export async function updateComment(commentId: string, content: string) {
  const res = await instance.put(`/comments/${commentId}`, { content });
  return res.data;
}
