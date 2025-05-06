import { Comment } from './Comment';

/**
 * Represents the status of a task.
 */
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'inbox' | 'wait-on';

/**
 * Represents a task.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  /**
   * Optional: Date when the task is due.
   */
  dueDate?: string; // ISO 8601 format
  /**
   * Timestamp when the task was created.
   */
  createdAt: string; // ISO 8601 format
  /**
   * Timestamp when the task was last updated.
   */
  updatedAt: string; // ISO 8601 format
  /**
   * Optional: ID of the project this task belongs to.
   */
  projectId?: string;
  /**
   * Optional: List of comments associated with the task.
   */
  comments?: Comment[];
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;