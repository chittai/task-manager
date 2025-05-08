import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskFormData, TaskStatus } from '../models/Task';
import { Comment } from '../models/Comment';
import { v4 as uuidv4 } from 'uuid';

// ローカルストレージのキー
const STORAGE_KEY = 'tasks';

// --- Internal Task Type (uses Date objects for dates) ---
export interface InternalTask extends Omit<Task, 'dueDate' | 'createdAt' | 'updatedAt'> {
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
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
          const parsedTasks = JSON.parse(savedTasks) as Task[]; // Tasks from storage have string dates
          const internalTasks = parsedTasks.map((task): InternalTask => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        setError(null); // Clear error on successful save
      } catch (err) {
        console.error('Failed to save tasks to localStorage:', err);
        setError('Failed to save tasks.');
      }
    }
  }, [tasks, loading]);

  // --- CRUD Operations ---
  const addTask = useCallback((taskData: TaskFormData): InternalTask => {
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
      // comments: taskData.comments, // Assuming TaskFormData doesn't handle comments here directly
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, taskData: Partial<TaskFormData>): InternalTask | null => {
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
    return updatedTaskResult;
  }, []);

  const deleteTask = useCallback((id: string): void => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, []);

  const changeTaskStatus = useCallback((id: string, status: TaskStatus): InternalTask | null => {
    return updateTask(id, { status });
  }, [updateTask]);

  // --- Comment Operations ---
  const addCommentToTask = useCallback((taskId: string, content: string): InternalTask | null => {
    let updatedTask: InternalTask | null = null;
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const now = new Date().toISOString();
          const newComment: Comment = {
            id: uuidv4(),
            taskId,
            content,
            createdAt: now,
            updatedAt: now, // 作成時もupdatedAtを設定
            // userId: string; // TODO: Add when auth is implemented
          };
          updatedTask = {
            ...task,
            comments: [...(task.comments || []), newComment],
            updatedAt: new Date(), // Update the task's updatedAt timestamp
          };
          return updatedTask;
        }
        return task;
      })
    );
    return updatedTask;
  }, []);

  const updateTaskComment = useCallback((taskId: string, commentId: string, newContent: string): InternalTask | null => {
    let updatedTask: InternalTask | null = null;
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedComments = (task.comments || []).map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                content: newContent,
                updatedAt: new Date().toISOString(), 
              };
            }
            return comment;
          });
          updatedTask = {
            ...task,
            comments: updatedComments,
            updatedAt: new Date(), // Update the task's updatedAt timestamp
          };
          return updatedTask;
        }
        return task;
      })
    );
    return updatedTask;
  }, []);

  const deleteTaskComment = useCallback((taskId: string, commentId: string): InternalTask | null => {
    let updatedTask: InternalTask | null = null;
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const filteredComments = (task.comments || []).filter(comment => comment.id !== commentId);
          updatedTask = {
            ...task,
            comments: filteredComments,
            updatedAt: new Date(), // Update the task's updatedAt timestamp
          };
          return updatedTask;
        }
        return task;
      })
    );
    return updatedTask;
  }, []);

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
  }, [tasks, filterCriteria, sortCriteria, priorityOrder]); // priorityOrder added as dependency

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