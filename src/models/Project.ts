/**
 * Represents a project that tasks can belong to.
 */
export interface Project {
  /** Unique identifier for the project. */
  id: string;
  /** The name of the project. */
  name: string;
  /** Optional description for the project. */
  description?: string;
  /** Timestamp when the project was created. */
  createdAt: string; // ISO 8601 format
  /** Timestamp when the project was last updated. */
  updatedAt: string; // ISO 8601 format
}
