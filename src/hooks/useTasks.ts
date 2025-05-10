import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskFormData, TaskStatus } from '../models/Task';
import { Comment } from '../models/Comment';
import { v4 as uuidv4 } from 'uuid';

// ローカルストレージのキー
const STORAGE_KEY = 'tasks';

// --- Internal Task Type (uses Date objects for dates) ---
export interface InternalTask extends Omit<Task, 'dueDate' | 'createdAt' | 'updatedAt' | 'projectName'> { 
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  // projectId は Task から継承される
}

// Helper function to convert InternalTask to Task for the UI
const toAppTask = (internalTask: InternalTask, projects: {id: string, name: string}[] = []): Task => {
  const project = projects.find(p => p.id === internalTask.projectId);
  return {
    ...internalTask,
    createdAt: internalTask.createdAt.toISOString(),
    updatedAt: internalTask.updatedAt.toISOString(),
    dueDate: internalTask.dueDate?.toISOString(),
    projectName: project ? project.name : undefined,
  };
};

// --- Types for Filtering and Sorting ---
export type TaskSortableField = 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export interface SortCriteria {
  field: TaskSortableField;
  direction: SortDirection;
}

export interface FilterCriteria {
  status?: TaskStatus;
  projectId?: string;
  priority?: Task['priority'];
  searchTerm?: string;
}

// --- Hook Implementation ---
export const useTasks = () => {
  const [tasks, setTasks] = useState<InternalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 

  // State for filtering and sorting
  const [filterCriteria, setFilterCriteria] = useState<Partial<FilterCriteria>>({});
  const [sortCriteria, setSortCriteria] = useState<SortCriteria | null>(null);

  // --- Data Loading and Persistence ---
  useEffect(() => {
    const loadTasks = () => {
      setLoading(true);
      setError(null);
      try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks) as Task[]; 
          const internalTasks = parsedTasks.map((task): InternalTask => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            // projectId will be spread from task
          }));
          setTasks(internalTasks);
        } else {
          // ローカルストレージが空の場合、初期サンプルデータを設定
          const now = new Date();
          const initialInternalTasks: InternalTask[] = [
            {
              id: uuidv4(),
              title: 'ドキュメントを読む', 
              description: '新しいライブラリのドキュメントを確認する。',
              status: 'todo',
              priority: 'medium',
              createdAt: now,
              updatedAt: now,
              projectId: 'project-1', // サンプルプロジェクトID
              comments: [],
            },
            {
              id: uuidv4(),
              title: 'UIコンポーネント設計',
              description: '新しいダッシュボードのUIコンポーネントを設計する。',
              status: 'in-progress',
              priority: 'high',
              createdAt: new Date(now.getTime() - 86400000), // 1日前
              updatedAt: now,
              projectId: 'project-2', // サンプルプロジェクトID
              comments: [],
            },
            {
              id: uuidv4(),
              title: 'バグ修正',
              description: '報告されたログイン関連のバグを修正する。',
              status: 'done',
              priority: 'high',
              createdAt: new Date(now.getTime() - 172800000), // 2日前
              updatedAt: new Date(now.getTime() - 86400000), // 1日前
              comments: [], // プロジェクトなし
            },
          ];
          setTasks(initialInternalTasks);
        }
      } catch (err) {
        console.error('Failed to parse tasks from localStorage:', err);
        setError('Failed to load tasks.');
        setTasks([]); 
      }
      setLoading(false);
    };

    loadTasks();
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        // InternalTask を Task (文字列日付) に変換して保存
        const tasksToSave = tasks.map(internalTask => toAppTask(internalTask)); // use dummy projects array for now
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
        setError(null); 
      } catch (err) {
        console.error('Failed to save tasks to localStorage:', err);
        setError('Failed to save tasks.');
      }
    }
  }, [tasks, loading]);

  // --- CRUD Operations ---
  const addTask = useCallback((taskData: TaskFormData): Promise<Task | null> => { 
    const now = new Date();
    const newTask: InternalTask = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description,
      status: taskData.status || 'inbox',
      priority: taskData.priority,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      createdAt: now,
      updatedAt: now,
      projectId: taskData.projectId, 
      comments: [], 
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    return Promise.resolve(toAppTask(newTask)); 
  }, []);

  const updateTask = useCallback((id: string, taskData: Partial<TaskFormData>): Promise<Task | null> => { 
    let updatedAppTask: Task | null = null;
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === id) {
          const { dueDate, projectId, ...restOfTaskData } = taskData;
          const updatedInternalTask: InternalTask = {
            ...task,
            ...restOfTaskData,
            updatedAt: new Date(),
          };
          if (taskData.hasOwnProperty('dueDate')) {
            updatedInternalTask.dueDate = dueDate ? new Date(dueDate) : undefined;
          }
          if (taskData.hasOwnProperty('projectId')) { 
            updatedInternalTask.projectId = projectId;
          }
          updatedAppTask = toAppTask(updatedInternalTask); 
          return updatedInternalTask;
        }
        return task;
      })
    );
    return Promise.resolve(updatedAppTask);
  }, []);

  const deleteTask = useCallback((id: string): Promise<void> => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.filter(task => task.id !== id);
      // localStorageへの保存はuseEffectに任せる
      return updatedTasks;
    });
    return Promise.resolve();
  }, []);

  const changeTaskStatus = useCallback(async (id: string, status: TaskStatus): Promise<Task | null> => { 
    return updateTask(id, { status });
  }, [updateTask]);

  // --- Comment Operations ---
  const addCommentToTask = useCallback(async (taskId: string, commentContent: string): Promise<Task | null> => { 
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      console.error(`[useTasks.ts] addCommentToTask: Task with id ${taskId} not found`);
      return Promise.resolve(null); 
    }
    const originalTask = tasks[taskIndex];

    const newComment: Comment = {
      id: uuidv4(),
      taskId,
      content: commentContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOwnComment: true, 
    };

    const updatedComments = [...(originalTask.comments || []), newComment];

    const updatedTaskInstance: InternalTask = {
      ...originalTask,
      comments: updatedComments,
      updatedAt: new Date(),
    };

    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const currentTaskIndex = newTasks.findIndex(t => t.id === taskId);
      if (currentTaskIndex !== -1) {
        newTasks[currentTaskIndex] = updatedTaskInstance;
      }
      return newTasks;
    });

    return Promise.resolve(toAppTask(updatedTaskInstance)); 
  }, [tasks]);

  const updateTaskComment = useCallback(async (taskId: string, commentId: string, newContent: string): Promise<Task | null> => { 
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      console.error(`[useTasks.ts] updateTaskComment: Task with id ${taskId} not found`);
      return Promise.resolve(null);
    }
    const originalTask = tasks[taskIndex];

    const updatedComments = (originalTask.comments || []).map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          content: newContent,
          updatedAt: new Date().toISOString(),
        };
      }
      return comment;
    });

    const updatedTaskInstance: InternalTask = {
      ...originalTask,
      comments: updatedComments,
      updatedAt: new Date(),
    };

    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const currentTaskIndex = newTasks.findIndex(t => t.id === taskId);
      if (currentTaskIndex !== -1) {
        newTasks[currentTaskIndex] = updatedTaskInstance;
      }
      return newTasks;
    });

    return Promise.resolve(toAppTask(updatedTaskInstance)); 
  }, [tasks]);

  const deleteTaskComment = useCallback(async (taskId: string, commentId: string): Promise<Task | null> => { 
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      console.error(`[useTasks.ts] deleteTaskComment: Task with id ${taskId} not found`);
      return Promise.resolve(null);
    }
    const originalTask = tasks[taskIndex];

    const updatedComments = (originalTask.comments || []).filter(comment => comment.id !== commentId);

    const updatedTaskInstance: InternalTask = {
      ...originalTask,
      comments: updatedComments,
      updatedAt: new Date(),
    };

    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const currentTaskIndex = newTasks.findIndex(t => t.id === taskId);
      if (currentTaskIndex !== -1) {
        newTasks[currentTaskIndex] = updatedTaskInstance;
      }
      return newTasks;
    });
    return Promise.resolve(toAppTask(updatedTaskInstance)); 
  }, [tasks]);

  // --- Filtering and Sorting Logic ---
  const filteredAndSortedTasks = useMemo(() => {
    let processedTasks = [...tasks]; 

    // Filtering
    if (filterCriteria.status) {
      processedTasks = processedTasks.filter(task => task.status === filterCriteria.status);
    }
    if (filterCriteria.priority) {
      processedTasks = processedTasks.filter(task => task.priority === filterCriteria.priority);
    }
    if (filterCriteria.projectId) {
      processedTasks = processedTasks.filter(task => task.projectId === filterCriteria.projectId);
    }
    if (filterCriteria.searchTerm) {
      const searchTermLower = filterCriteria.searchTerm.toLowerCase();
      processedTasks = processedTasks.filter(task => 
        task.title.toLowerCase().includes(searchTermLower) || 
        task.description.toLowerCase().includes(searchTermLower)
      );
    }

    // Sorting
    if (sortCriteria) {
      processedTasks.sort((a, b) => {
        const field = sortCriteria.field;
        const direction = sortCriteria.direction === 'asc' ? 1 : -1;

        // Handle undefined or null values for sorting, placing them at the end for 'asc'
        // and at the beginning for 'desc'. For dates, null/undefined means 'far in the future' or 'not set'.
        const valA = a[field];
        const valB = b[field];

        if (valA == null && valB == null) return 0;
        if (valA == null) return 1 * direction; 
        if (valB == null) return -1 * direction;

        if (field === 'dueDate' || field === 'createdAt' || field === 'updatedAt') {
          // Ensure dates are compared correctly
          const dateA = (valA as Date).getTime();
          const dateB = (valB as Date).getTime();
          return (dateA - dateB) * direction;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB) * direction;
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * direction;
        }
        // Fallback for other types or mixed types (less ideal but prevents crashes)
        return String(valA).localeCompare(String(valB)) * direction;
      });
    }
    return processedTasks; 
  }, [tasks, filterCriteria, sortCriteria]);

  return {
    tasks: filteredAndSortedTasks.map(internalTask => toAppTask(internalTask)), 
    loading,
    error,
    filterCriteria,
    setFilterCriteria,
    sortCriteria,
    setSortCriteria,
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    addCommentToTask,
    updateTaskComment,
    deleteTaskComment,
  };
};