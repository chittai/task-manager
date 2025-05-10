import { Comment } from './Comment';
export type { Comment };

/**
 * Represents the status of a task.
 */
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'inbox' | 'wait-on';

/**
 * Represents the priority of a task.
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Represents a task history entry.
 * TODO: Define the actual structure of a task history entry.
 */
export interface TaskHistoryEntry {}

/**
 * Represents a task in the system.
 */
export interface Task {
  /**
   * Unique identifier for the task.
   */
  id: string;
  /**
   * Title of the task.
   */
  title: string;
  /**
   * Detailed description of the task.
   */
  description: string;
  /**
   * Current status of the task.
   */
  status: TaskStatus;
  /**
   * Priority level of the task.
   */
  priority: TaskPriority;
  /**
   * Optional: Due date for the task, in ISO 8601 format.
   */
  dueDate?: string;
  /**
   * Creation timestamp of the task, in ISO 8601 format.
   */
  createdAt: string;
  /**
   * Last update timestamp of the task, in ISO 8601 format.
   */
  updatedAt: string;
  /**
   * Optional: Identifier of the project this task belongs to.
   */
  projectId?: string;
  /**
   * Optional: Name of the project this task belongs to (for display purposes).
   */
  projectName?: string;
  /**
   * Optional: List of comments associated with the task.
   */
  comments?: Comment[];
  /**
   * Optional: Task history entries.
   */
  history?: TaskHistoryEntry[];
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;