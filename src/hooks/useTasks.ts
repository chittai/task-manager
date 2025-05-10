import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskFormData, TaskStatus, TaskCommentModel } from '../models/Task';
import { v4 as uuidv4 } from 'uuid';

// ローカルストレージのキー
const STORAGE_KEY = 'tasks';

// --- Internal Task Type (uses Date objects for dates) ---
export interface InternalTask extends Omit<Task, 'dueDate' | 'createdAt' | 'updatedAt' | 'comments'> {
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  comments?: TaskCommentModel[];
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
          const parsedTasks = JSON.parse(savedTasks) as Task[]; // Task[] from storage
          const internalTasks = parsedTasks.map((task): InternalTask => ({
            ...task, // task.comments は TaskCommentModel[] | undefined のはず
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            // comments: task.comments ? task.comments.map(c => ({...c})) : [], // 念のため再マップするなら。基本不要なはず
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
  const addTask = useCallback((taskData: TaskFormData): Promise<InternalTask | null> => {
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
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
  const addCommentToTask = useCallback((taskId: string, commentContent: string, userId?: string, author?: string): Promise<InternalTask | null> => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      console.error(`[useTasks.ts] addCommentToTask: Task with id ${taskId} not found`);
      return Promise.resolve(null); 
    }

    const originalTask = tasks[taskIndex];

    const now = new Date(); 
    const newComment: TaskCommentModel = {
      id: uuidv4(),
      taskId: taskId,
      content: commentContent,
      createdAt: now.toISOString(), // Store as ISO string
      userId: userId, 
      author: author,
    };

    const updatedComments = [...(originalTask.comments || []), newComment];
    const updatedTaskInstance: InternalTask = {
      ...originalTask,
      comments: updatedComments,
      updatedAt: now,
    };
    
    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      newTasks[taskIndex] = updatedTaskInstance;
      return newTasks;
    });

    return Promise.resolve(updatedTaskInstance);
  }, [tasks]);

  const updateTaskComment = useCallback((taskId: string, commentId: string, newContent: string): Promise<InternalTask | null> => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      console.error(`[useTasks.ts] updateTaskComment: Task with id ${taskId} not found`);
      return Promise.resolve(null);
    }

    const originalTask = tasks[taskIndex];
    let commentUpdated = false;
    const updatedComments = (originalTask.comments || []).map(comment => {
      if (comment.id === commentId) {
        commentUpdated = true;
        return {
          ...comment,
          content: newContent,
          updatedAt: new Date().toISOString(), // Store as ISO string
        };
      }
      return comment;
    });

    if (!commentUpdated) {
      console.warn(`[useTasks.ts] updateTaskComment: Comment with id ${commentId} not found in task ${taskId}`);
      return Promise.resolve(originalTask); // Or null if we want to indicate no update occurred
    }

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

  const deleteTaskComment = useCallback((taskId: string, commentId: string): Promise<InternalTask | null> => {
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
      newTasks[taskIndex] = updatedTaskInstance;
      return newTasks;
    });

    return Promise.resolve(updatedTaskInstance);
  }, [tasks]);

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