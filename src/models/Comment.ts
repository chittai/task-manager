/**
 * Represents a comment on a task.
 */
export interface Comment {
  id: string;
  taskId: string; // ID of the task this comment belongs to
  content: string;
  createdAt: string; // ISO 8601 format
  updatedAt?: string; // ISO 8601 format, optional as it might not be updated
  userId?: string;    // Optional: ID of the user who wrote the comment
  author?: string;    // Optional: Display name of the user
  isOwnComment?: boolean; // Added this line
}
