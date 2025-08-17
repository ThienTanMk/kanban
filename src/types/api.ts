// This file contains all types for the Kanban API
// Can be shared with Frontend team

// --- DATABASE MODELS ---
export interface User {
  id: number;
  email: string;
  username: string;
  fullName: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date | null;
  endDate: Date | null;
  ownerId: number;
}

export interface UsersOnProject {
  userId: number;
  projectId: number;
  role: ProjectRole;
  joinedAt: Date;
}

export interface StatusTask {
  id: number;
  name: string;
  color: string | null;
  order: number;
  projectId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tags {
  id: number;
  name: string;
  color: string | null;
  projectId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagOnTask {
  taskId: number;
  tagId: number;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  projectId: number;
  statusId: number;
  assigneeId: number | null;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: number;
  authorId: number;
}

export interface Event {
  id: number;
  type: EventType;
  description: string | null;
  createdAt: Date;
  projectId: number;
  userId: number;
  taskId: number | null;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  userId: number;
  eventId: number | null;
}

// --- ENUMS for FE ---
export enum ProjectRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum EventType {
  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_DELETED = "TASK_DELETED",
  COMMENT_ADDED = "COMMENT_ADDED",
  COMMENT_UPDATED = "COMMENT_UPDATED",
  COMMENT_DELETED = "COMMENT_DELETED",
}

// --- API RESPONSE TYPES ---
// Base response structure
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Paginated response
export interface PaginatedResponse<T = any> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- USER CRUD RESPONSES ---
export interface UserCreateRequest {
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
}

export interface UserUpdateRequest {
  username?: string;
  fullName?: string;
  avatar?: string;
}

export type UserResponse = ApiResponse<User>;
export type UserListResponse = PaginatedResponse<User>;
export type UserCreateResponse = ApiResponse<User>;
export type UserUpdateResponse = ApiResponse<User>;
export type UserDeleteResponse = ApiResponse<{ id: number }>;

// --- PROJECT CRUD RESPONSES ---
export interface ProjectCreateRequest {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export type ProjectResponse = ApiResponse<Project>;
export type ProjectListResponse = PaginatedResponse<Project>;
export type ProjectCreateResponse = ApiResponse<Project>;
export type ProjectUpdateResponse = ApiResponse<Project>;
export type ProjectDeleteResponse = ApiResponse<{ id: number }>;

// --- TASK CRUD RESPONSES ---
export interface TaskCreateRequest {
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: Date;
  projectId: number;
  statusId: number;
  assigneeId?: number;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
  statusId?: number;
  assigneeId?: number;
}

export type TaskResponse = ApiResponse<Task>;
export type TaskListResponse = PaginatedResponse<Task>;
export type TaskCreateResponse = ApiResponse<Task>;
export type TaskUpdateResponse = ApiResponse<Task>;
export type TaskDeleteResponse = ApiResponse<{ id: number }>;

// --- STATUS TASK CRUD RESPONSES ---
export interface StatusTaskCreateRequest {
  name: string;
  color?: string;
  order: number;
  projectId: number;
}

export interface StatusTaskUpdateRequest {
  name?: string;
  color?: string;
  order?: number;
}

export type StatusTaskResponse = ApiResponse<StatusTask>;
export type StatusTaskListResponse = PaginatedResponse<StatusTask>;
export type StatusTaskCreateResponse = ApiResponse<StatusTask>;
export type StatusTaskUpdateResponse = ApiResponse<StatusTask>;
export type StatusTaskDeleteResponse = ApiResponse<{ id: number }>;

// --- TAGS CRUD RESPONSES ---
export interface TagsCreateRequest {
  name: string;
  color?: string;
  projectId: number;
}

export interface TagsUpdateRequest {
  name?: string;
  color?: string;
}

export type TagsResponse = ApiResponse<Tags>;
export type TagsListResponse = PaginatedResponse<Tags>;
export type TagsCreateResponse = ApiResponse<Tags>;
export type TagsUpdateResponse = ApiResponse<Tags>;
export type TagsDeleteResponse = ApiResponse<{ id: number }>;

// --- COMMENT CRUD RESPONSES ---
export interface CommentCreateRequest {
  content: string;
  taskId: number;
}

export interface CommentUpdateRequest {
  content: string;
}

export type CommentResponse = ApiResponse<Comment>;
export type CommentListResponse = PaginatedResponse<Comment>;
export type CommentCreateResponse = ApiResponse<Comment>;
export type CommentUpdateResponse = ApiResponse<Comment>;
export type CommentDeleteResponse = ApiResponse<{ id: number }>;

// --- PROJECT MEMBER MANAGEMENT ---
export interface AddMemberRequest {
  userId: number;
  role: ProjectRole;
}

export interface UpdateMemberRoleRequest {
  role: ProjectRole;
}

export type MemberResponse = ApiResponse<UsersOnProject>;
export type MemberListResponse = PaginatedResponse<UsersOnProject>;
export type AddMemberResponse = ApiResponse<UsersOnProject>;
export type UpdateMemberResponse = ApiResponse<UsersOnProject>;
export type RemoveMemberResponse = ApiResponse<{
  userId: number;
  projectId: number;
}>;

// --- NOTIFICATION RESPONSES ---
export type NotificationResponse = ApiResponse<Notification>;
export type NotificationListResponse = PaginatedResponse<Notification>;
export type MarkNotificationReadResponse = ApiResponse<Notification>;

// --- EVENT RESPONSES ---
export type EventResponse = ApiResponse<Event>;
export type EventListResponse = PaginatedResponse<Event>;
