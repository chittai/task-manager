import { Comment as TaskCommentModel } from './Comment'; // エイリアスを TaskCommentModel に変更

export type { TaskCommentModel }; // TaskCommentModel をエクスポート

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'inbox' | 'wait-on';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Project {
  id: string;
  name: string;
  // color?: string; // Optional: for UI differentiation
  // description?: string;
}

export interface TaskHistoryEntry {
  timestamp: string; // ISO date string reflecting when the change occurred
  change: string;    // Description of the change, e.g., "Status changed from 'todo' to 'in-progress'"
  userId?: string;   // Optional: ID of the user who made the change
  // field?: string; // Optional: The specific field that was changed
  // oldValue?: any; // Optional: The value before the change
  // newValue?: any; // Optional: The value after the change
}

/**
 * Represents a task.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  /**
   * Timestamp when the task was created.
   */
  createdAt: string; // ISO 8601 format
  /**
   * Timestamp when the task was last updated.
   */
  updatedAt: string; // ISO 8601 format
  /**
   * Optional: Date when the task is due.
   */
  dueDate?: string; // ISO 8601 format
  /**
   * Optional: ID of the project this task belongs to.
   */
  projectId?: string;
  /**
   * Optional: Denormalized project name for easier display, derived from projectId.
   */
  projectName?: string;
  /**
   * Optional: List of comments associated with the task.
   */
  comments?: TaskCommentModel[]; // TaskCommentModel を使用
  /**
   * Optional: Array of changes made to the task.
   */
  history?: TaskHistoryEntry[];
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'history' | 'projectName'>;