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
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // --- Data Persistence --- 

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const storedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      } else {
        setProjects([]); // 明示的に空配列を設定
      }
    } catch (err) {
      console.error('Error loading projects from LocalStorage:', err);
      setError('Failed to load projects.');
      setProjects([]);
    } finally {
      setLoading(false);
      setIsInitialLoadComplete(true); // 初回ロード完了をマーク
    }
  }, []);

  // Load projects on initial mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Save projects to localStorage when 'projects' state changes after initial load
  useEffect(() => {
    if (isInitialLoadComplete) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
        setError(null); // 以前の保存エラーがあればクリア
      } catch (err) {
        console.error('Error saving projects to LocalStorage on change:', err);
        setError('Failed to save project changes.');
      }
    }
  }, [projects, isInitialLoadComplete]);

  // --- CRUD Operations --- 

  const createProject = useCallback(
    async (projectData: ProjectFormData): Promise<Project> => {
      const newProject: Project = {
        ...projectData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProjects(prevProjects => [...prevProjects, newProject]);
      // setError(null); // create操作自体のエラーは別途管理
      return newProject; // optimistic update
    },
    [] // 依存配列から projects と saveProjects を削除
  );

  const updateProject = useCallback(async (projectId: string, projectData: ProjectFormData): Promise<Project | null> => {
    let updatedProjectRef: Project | null = null;
    setProjects(prevProjects => {
      const updatedProjects = prevProjects.map(p => {
        if (p.id === projectId) {
          updatedProjectRef = {
            ...p,
            ...projectData,
            updatedAt: new Date().toISOString(),
          };
          return updatedProjectRef;
        }
        return p;
      });
      // localStorage.setItem は useEffect で処理
      return updatedProjects;
    });
    // setError(null); // update操作自体のエラーは別途管理
    return updatedProjectRef; // optimistic update
  }, []);

  const deleteProject = useCallback(
    async (projectId: string): Promise<void> => {
      setProjects(prevProjects => prevProjects.filter((p) => p.id !== projectId));
      // setError(null); // delete操作自体のエラーは別途管理
    },
    [] // 依存配列から projects と saveProjects を削除
  );

  const getProjectById = useCallback(
    (idToFind: string): Project | null => {
        console.log('[useProjects] getProjectById called. Searching for:', idToFind);
        console.log('[useProjects] Current projects state for getProjectById:', projects);
        const foundProject = projects.find((p) => p.id === idToFind) || null;
        console.log('[useProjects] Project found by getProjectById:', foundProject);
        return foundProject;
    },
    [projects]
  );

  return {
    projects,
    loading, // これは主に初回ロードのローディング状態
    error,   // ロード時または保存時のエラー
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    refreshProjects: loadProjects, 
  };
};
