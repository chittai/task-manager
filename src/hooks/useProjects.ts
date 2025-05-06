import { useState, useEffect, useCallback } from 'react';
import { Project } from '../models/Project';

const LOCAL_STORAGE_KEY = 'taskManagerProjects';

/**
 * Custom hook for managing projects with LocalStorage persistence.
 */
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Persistence ---

  const loadProjects = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const storedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } catch (err) {
      console.error('Error loading projects from LocalStorage:', err);
      setError('Failed to load projects.');
      // Fallback to empty array if parsing fails
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProjects = useCallback((projectsToSave: Project[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectsToSave));
    } catch (err) {
      console.error('Error saving projects to LocalStorage:', err);
      setError('Failed to save projects.');
    }
  }, []);

  // Load projects on initial mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // --- CRUD Operations ---

  const addProject = useCallback(
    (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newProject: Project = {
        ...projectData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      saveProjects(updatedProjects);
      return newProject;
    },
    [projects, saveProjects]
  );

  const updateProject = useCallback(
    (updatedProject: Project) => {
      const updatedProjects = projects.map((p) =>
        p.id === updatedProject.id
          ? { ...updatedProject, updatedAt: new Date().toISOString() }
          : p
      );
      if (projects.length === updatedProjects.length && projects.some(p => p.id === updatedProject.id)) {
        setProjects(updatedProjects);
        saveProjects(updatedProjects);
      } else {
         setError(`Project with ID ${updatedProject.id} not found for update.`);
         console.error(`Project with ID ${updatedProject.id} not found for update.`);
      }
    },
    [projects, saveProjects]
  );

  const deleteProject = useCallback(
    (projectId: string) => {
      const updatedProjects = projects.filter((p) => p.id !== projectId);
      if (projects.length !== updatedProjects.length) {
          setProjects(updatedProjects);
          saveProjects(updatedProjects);
      } else {
          setError(`Project with ID ${projectId} not found for deletion.`);
          console.error(`Project with ID ${projectId} not found for deletion.`);
      }

    },
    [projects, saveProjects]
  );

  const getProjectById = useCallback(
    (projectId: string): Project | undefined => {
        return projects.find((p) => p.id === projectId);
    },
    [projects]
    );

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    refreshProjects: loadProjects, // Provide a way to manually refresh
  };
};
