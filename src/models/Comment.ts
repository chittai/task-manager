/**
 * Represents a comment associated with a task.
 */
export interface Comment {
  /** Unique identifier for the comment. */
  id: string;
  /** ID of the task this comment belongs to. */
  taskId: string;
  /** The content of the comment. */
  content: string;
  /** Timestamp when the comment was created. */
  createdAt: string; // ISO 8601 format
  /** Optional: ID of the user who created the comment. */
  userId?: string;
}
