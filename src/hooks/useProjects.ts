import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectFormData } from '../models/Project';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_KEY = 'taskManagerProjects';

/**
 * Custom hook for managing projects with LocalStorage persistence.
 */
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Persistence ---

  const loadProjects = useCallback(async () => {
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
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProjects = useCallback(async (projectsToSave: Project[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectsToSave));
    } catch (err) {
      console.error('Error saving projects to LocalStorage:', err);
      setError('Failed to save projects.');
      throw err;
    }
  }, []);

  // Load projects on initial mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // --- CRUD Operations ---

  const createProject = useCallback(
    async (projectData: ProjectFormData): Promise<Project> => {
      setLoading(true);
      try {
        const newProject: Project = {
          ...projectData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updatedProjects = [...projects, newProject];
        setProjects(updatedProjects);
        await saveProjects(updatedProjects);
        return newProject;
      } catch (err) {
        setError('Failed to create project.');
        console.error('Create project error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projects, saveProjects]
  );

  const updateProject = useCallback(
    async (id: string, projectData: Partial<ProjectFormData>): Promise<Project | null> => {
      setLoading(true);
      try {
        let updatedProject: Project | null = null;
        const updatedProjects = projects.map((p) => {
          if (p.id === id) {
            updatedProject = {
              ...p, 
              ...projectData, 
              updatedAt: new Date().toISOString(),
            };
            return updatedProject;
          }
          return p;
        });

        if (updatedProject) {
          setProjects(updatedProjects);
          await saveProjects(updatedProjects);
          return updatedProject;
        } else {
          setError(`Project with ID ${id} not found for update.`);
          console.error(`Project with ID ${id} not found for update.`);
          return null;
        }
      } catch (err) {
        setError('Failed to update project.');
        console.error('Update project error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projects, saveProjects]
  );

  const deleteProject = useCallback(
    async (projectId: string): Promise<void> => {
      setLoading(true);
      try {
        const projectExists = projects.some(p => p.id === projectId);
        if (!projectExists) {
          setError(`Project with ID ${projectId} not found for deletion.`);
          console.error(`Project with ID ${projectId} not found for deletion.`);
          return;
        }
        const updatedProjects = projects.filter((p) => p.id !== projectId);
        setProjects(updatedProjects);
        await saveProjects(updatedProjects);
      } catch (err) {
        setError('Failed to delete project.');
        console.error('Delete project error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projects, saveProjects]
  );

  const getProjectById = useCallback(
    (projectId: string): Project | null => {
        return projects.find((p) => p.id === projectId) || null;
    },
    [projects]
  );

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    refreshProjects: loadProjects, 
  };
};
