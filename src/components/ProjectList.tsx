import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { Project } from '../models/Project';
import { ProjectForm } from './ProjectForm'; // Import the form component

interface ProjectListProps {
  // Add any specific props needed for the list, e.g., filtering
}

export const ProjectList: React.FC<ProjectListProps> = () => {
  const {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setShowCreateForm(false); // Hide create form if editing
  };

  const handleDeleteClick = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(projectId);
    }
  };

  const handleFormSubmit = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
      setEditingProject(undefined); // Exit edit mode
    } else {
      createProject(projectData);
      setShowCreateForm(false); // Hide create form after adding
    }
  };

  const handleCancelForm = () => {
    setEditingProject(undefined);
    setShowCreateForm(false);
  };

  if (loading) {
    return <p>Loading projects...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error loading projects: {error}</p>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Projects</h2>
      <button onClick={() => { setShowCreateForm(true); setEditingProject(undefined); }} style={{ marginBottom: '1rem' }}>
        Add New Project
      </button>

      {/* Display Create or Edit Form */} 
      {(showCreateForm || editingProject) && (
        <ProjectForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          projectToEdit={editingProject}
        />
      )}

      {/* Project List */}
      {projects.length === 0 && !loading ? (
        <p>No projects found. Add one to get started!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {projects.map((project) => (
            <li key={project.id} style={{ border: '1px solid #eee', padding: '1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{project.name}</h3>
                <p style={{ margin: 0, color: '#555' }}>{project.description || 'No description'}</p>
              </div>
              <div>
                <button onClick={() => handleEditClick(project)} style={{ marginRight: '0.5rem' }}>Edit</button>
                <button onClick={() => handleDeleteClick(project.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
