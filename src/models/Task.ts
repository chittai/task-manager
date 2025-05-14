import { Comment as TaskCommentModel } from './Comment'; // エイリアスを TaskCommentModel に変更

export type { TaskCommentModel }; // TaskCommentModel をエクスポート

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'inbox' | 'wait-on' | 'someday-maybe' | 'reference';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type TimeEstimate = 'quick' | 'medium' | 'long';
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
  
  // GTDメソッドに基づく拡張属性
  /**
   * Optional: Name or email of the person this task is delegated to.
   */
  delegatedTo?: string;
  /**
   * Optional: Reason or person you're waiting for (for wait-on tasks).
   */
  waitingFor?: string;
  /**
   * Optional: Context tags for the task (location, tool, situation, etc.).
   */
  contextTag?: string[];
  /**
   * Optional: Flag indicating if this task is actually a project (contains multiple actions).
   */
  isProject?: boolean;
  /**
   * Optional: Flag indicating if this is the next action that should be done.
   */
  nextAction?: boolean;
  /**
   * Optional: Energy level required to complete this task.
   */
  energy?: EnergyLevel;
  /**
   * Optional: Estimated time required to complete this task.
   */
  time?: TimeEstimate;
  /**
   * Optional: Task category (e.g., work, personal, etc.).
   */
  category?: string;
  /**
   * Optional: Task subcategory (e.g., work: meeting, personal: shopping, etc.).
   */
  subcategory?: string;
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'history' | 'projectName'>;