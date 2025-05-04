import React, { useState, useEffect } from 'react';
import { Project } from '../models/Project';

interface ProjectFormProps {
  /** Function to call when the form is submitted. */
  onSubmit: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  /** Function to call when the cancel button is clicked. */
  onCancel: () => void;
  /** Optional project data to pre-fill the form for editing. */
  projectToEdit?: Project;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, onCancel, projectToEdit }) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Pre-fill form if projectToEdit is provided
  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description || '');
    } else {
      // Reset form when switching from edit to create mode
      setName('');
      setDescription('');
    }
  }, [projectToEdit]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      // Basic validation: ensure name is not empty
      alert('Project name cannot be empty.');
      return;
    }
    onSubmit({ name: name.trim(), description: description.trim() });
    // Optionally reset form after submission if not editing
    if (!projectToEdit) {
        setName('');
        setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '1rem' }}>
      <h2>{projectToEdit ? 'Edit Project' : 'Create New Project'}</h2>
      <div style={{ marginBottom: '0.5rem' }}>
        <label htmlFor="projectName" style={{ display: 'block', marginBottom: '0.2rem' }}>Project Name:</label>
        <input
          type="text"
          id="projectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="projectDescription" style={{ display: 'block', marginBottom: '0.2rem' }}>Description (Optional):</label>
        <textarea
          id="projectDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
        />
      </div>
      <div>
        <button type="submit" style={{ padding: '0.5rem 1rem', marginRight: '0.5rem' }}>
          {projectToEdit ? 'Save Changes' : 'Create Project'}
        </button>
        <button type="button" onClick={onCancel} style={{ padding: '0.5rem 1rem' }}>
          Cancel
        </button>
      </div>
    </form>
  );
};
