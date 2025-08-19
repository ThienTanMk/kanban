import {
  addComment,
  deleteComment,
  getCommentByTaskId,
  updateComment,
} from "@/services/commentApi";
import { useAuth } from "./useAuth";

import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/services/queryClient";

export function useGetCommentByTaskId(taskId: string) {
  const { uid } = useAuth();
  return useQuery({
    queryKey: ["comments", uid, taskId],
    queryFn: () => getCommentByTaskId(taskId),
    enabled: !!uid && !!taskId,
  });
}

export function useAddComment(taskId: string) {
  const { uid } = useAuth();
  return useMutation({
    mutationFn: (content: string) => addComment(taskId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", uid, taskId],
      });
      queryClient.removeQueries({
        queryKey: ["events"],
      });
    },
  });
}

export function useDeleteComment(taskId: string) {
  const { uid } = useAuth();

  return useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", uid, taskId],
      });
      queryClient.removeQueries({
        queryKey: ["events"],
      });
    },
  });
}

export function useUpdateComment() {
  const { uid } = useAuth();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", uid],
      });
      queryClient.removeQueries({
        queryKey: ["events"],
      });
    },
  });
}
