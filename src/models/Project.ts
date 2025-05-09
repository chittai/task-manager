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

/**
 * Represents the data required to create or update a project.
 * It omits the 'id', 'createdAt', and 'updatedAt' fields from the Project interface,
 * as these are typically managed by the system.
 */
export type ProjectFormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
