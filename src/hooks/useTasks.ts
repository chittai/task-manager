import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority, TaskCommentModel } from '../models/Task';
import { v4 as uuidv4 } from 'uuid';

// ローカルストレージのキー
const STORAGE_KEY = 'tasks';

// --- TaskFormData Type ---
export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // ISO string
  projectId?: string;
  assigneeId?: string;
  context?: string[];
  // commentsはここでは直接編集しない想定
}

// --- Internal Task Type (uses Date objects for dates) ---
export interface InternalTask extends Omit<Task, 'dueDate' | 'createdAt' | 'updatedAt' | 'comments'> {
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  comments?: InternalTaskComment[];
}

export interface InternalTaskComment extends Omit<TaskCommentModel, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt?: Date;
}

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
  priority?: TaskPriority;
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
          const parsedTasks = JSON.parse(savedTasks) as Task[]; // Task[] from storage
          const internalTasks = parsedTasks.map((task): InternalTask => ({
            ...task, 
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            comments: task.comments?.map((c: TaskCommentModel) => ({ 
              ...c, 
              createdAt: new Date(c.createdAt),
              updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
            } as InternalTaskComment))
          }));
          setTasks(internalTasks);
        }
      } catch (err) {
        console.error('Failed to parse tasks from localStorage:', err);
        setError('Failed to load tasks.');
        setTasks([]); // Fallback to empty array
      }
      setLoading(false);
    };

    loadTasks();
  }, []);

  useEffect(() => {
    if (!loading) {
      try {
        // When saving, Date objects are automatically converted to ISO strings by JSON.stringify
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.map(fromInternalTask)));
        setError(null); // Clear error on successful save
      } catch (err) {
        console.error('Failed to save tasks to localStorage:', err);
        setError('Failed to save tasks.');
      }
    }
  }, [tasks, loading]);

  // --- CRUD Operations ---
  const addTask = useCallback((taskData: TaskFormData): Promise<InternalTask | null> => {
    const now = new Date();
    const newTask: InternalTask = {
      id: uuidv4(),
      title: taskData.title,
      description: taskData.description || '', // undefinedの場合に空文字列を設定
      status: taskData.status || 'inbox',
      priority: taskData.priority,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      createdAt: now,
      updatedAt: now,
      projectId: taskData.projectId,
      comments: [], 
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    return Promise.resolve(newTask);
  }, []);

  const updateTask = useCallback((id: string, taskData: Partial<TaskFormData>): Promise<InternalTask | null> => {
    let updatedTaskResult: InternalTask | null = null;
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === id) {
          const { dueDate, ...restOfTaskData } = taskData;
          const updatedInternalTask: InternalTask = {
            ...task,
            ...restOfTaskData,
            updatedAt: new Date(),
          };
          // Only update dueDate if it's explicitly passed in taskData
          if (taskData.hasOwnProperty('dueDate')) {
            updatedInternalTask.dueDate = dueDate ? new Date(dueDate) : undefined;
          }
          updatedTaskResult = updatedInternalTask;
          return updatedInternalTask;
        }
        return task;
      })
    );
    return Promise.resolve(updatedTaskResult);
  }, []);

  const deleteTask = useCallback((id: string): Promise<void> => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.filter(task => task.id !== id);
      try {
        // タスク削除時に即座にlocalStorageを更新
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks.map(fromInternalTask)));
        // setError(null); // setError は useEffect に任せるか、別途管理
      } catch (err) {
        console.error('Failed to save tasks to localStorage after delete:', err);
        // setError('Failed to save tasks after deletion.'); // 同上
      }
      return updatedTasks;
    });
    return Promise.resolve();
  }, []);

  const changeTaskStatus = useCallback((id: string, status: TaskStatus): Promise<InternalTask | null> => {
    return updateTask(id, { status });
  }, [updateTask]);

  // --- Comment Operations ---
  const addCommentToTask = useCallback((taskId: string, content: string): Promise<InternalTask | null> => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      setError('Task not found for adding comment.');
      return Promise.resolve(null);
    }

    const newComment: InternalTaskComment = {
      id: uuidv4(),
      taskId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      // userId and author can be added here if auth is integrated
    };

    const updatedTaskInstance: InternalTask = {
      ...tasks[taskIndex],
      comments: [...(tasks[taskIndex].comments || []), newComment],
      updatedAt: new Date(),
    };

    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      newTasks[taskIndex] = updatedTaskInstance;
      return newTasks;
    });

    return Promise.resolve(updatedTaskInstance);
  }, [tasks]);

  const updateTaskComment = useCallback(async (taskId: string, commentId: string, content: string): Promise<InternalTask | null> => {
    setLoading(true);
    try {
      let updatedTaskInstance: InternalTask | null = null;
      setTasks(prevTasks => {
        const newTasks = prevTasks.map(task => {
          if (task.id === taskId) {
            const updatedComments = task.comments?.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  content,
                  updatedAt: new Date(),
                } as InternalTaskComment;
              }
              return comment;
            });
            updatedTaskInstance = {
              ...task,
              comments: updatedComments,
              updatedAt: new Date(),
            };
            return updatedTaskInstance;
          }
          return task;
        });
        setTasks(newTasks); // Keep tasks in sync
        return newTasks;
      });
      setError(null);
      setLoading(false);
      return updatedTaskInstance;
    } catch (err) {
      console.error('Failed to update task comment:', err);
      setError('Failed to update task comment.');
      setLoading(false);
      return null;
    }
  }, []);

  const deleteTaskComment = useCallback((taskId: string, commentId: string): Promise<InternalTask | null> => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      setError('Task not found for deleting comment.');
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
      newTasks[taskIndex] = updatedTaskInstance;
      return newTasks;
    });

    return Promise.resolve(updatedTaskInstance);
  }, [tasks]);

  // --- Utility functions for data conversion ---
  const toInternalTask = (task: Task): InternalTask => {
    const { comments, dueDate, createdAt, updatedAt, ...restOfTask } = task;
    return {
      ...restOfTask,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
      comments: comments?.map((c: TaskCommentModel) => ({ 
        ...c, 
        createdAt: new Date(c.createdAt),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
      } as InternalTaskComment)) 
    };
  };

  const fromInternalTask = (internalTask: InternalTask): Task => {
    const { comments, dueDate, createdAt, updatedAt, ...restOfTask } = internalTask;
    return {
      ...restOfTask,
      dueDate: dueDate?.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      comments: comments?.map((c: InternalTaskComment) => ({ 
        ...c, 
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt?.toISOString(),
      } as TaskCommentModel)) 
    };
  };

  // --- Filtering and Sorting Logic ---
  const priorityOrder: Record<Task['priority'], number> = {
    low: 0,
    medium: 1,
    high: 2,
  };

  const displayTasks = useMemo(() => {
    let tempTasks = [...tasks]; // tasks are InternalTask[]

    // Filtering
    if (filterCriteria.status) {
      tempTasks = tempTasks.filter(task => task.status === filterCriteria.status);
    }
    if (filterCriteria.projectId) {
      tempTasks = tempTasks.filter(task => task.projectId === filterCriteria.projectId);
    }
    if (filterCriteria.priority) {
      tempTasks = tempTasks.filter(task => task.priority === filterCriteria.priority);
    }
    if (filterCriteria.searchTerm) {
      const searchTermLower = filterCriteria.searchTerm.toLowerCase();
      tempTasks = tempTasks.filter(task => 
        task.title.toLowerCase().includes(searchTermLower) || 
        (task.description && task.description.toLowerCase().includes(searchTermLower))
      );
    }

    // Sorting
    if (sortCriteria) {
      tempTasks.sort((a, b) => {
        const field = sortCriteria.field;
        const direction = sortCriteria.direction === 'asc' ? 1 : -1;

        if (field === 'priority') {
          const priorityA = priorityOrder[a.priority];
          const priorityB = priorityOrder[b.priority];
          return (priorityA - priorityB) * direction;
        }

        let valA = a[field];
        let valB = b[field];

        if (valA instanceof Date && valB instanceof Date) {
          return (valA.getTime() - valB.getTime()) * direction;
        } else if (valA instanceof Date) { // valB is undefined or not a Date
          return -1 * direction; // Dates first
        } else if (valB instanceof Date) { // valA is undefined or not a Date
          return 1 * direction;  // Dates first
        }

        // Handle undefined or null for string or other comparisons
        const strValA = valA === undefined || valA === null ? '' : String(valA);
        const strValB = valB === undefined || valB === null ? '' : String(valB);

        if (typeof strValA === 'string' && typeof strValB === 'string') {
          return strValA.localeCompare(strValB) * direction;
        }
        // Fallback for other types, though typically covered by Date/string above
        if (strValA < strValB) return -1 * direction;
        if (strValA > strValB) return 1 * direction;
        return 0;
      });
    }

    return tempTasks;
  }, [tasks, filterCriteria, sortCriteria, priorityOrder]); 

  // --- Return Values ---
  return {
    tasks: displayTasks, 
    allTasks: tasks, 
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    filterCriteria,
    setFilterCriteria,
    sortCriteria,
    setSortCriteria,
    addCommentToTask,
    updateTaskComment,
    deleteTaskComment,
  };
};