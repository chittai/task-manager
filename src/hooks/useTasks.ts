import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '../models/Task';
import { v4 as uuidv4 } from 'uuid';

// ローカルストレージのキー
const STORAGE_KEY = 'tasks';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // 初期化時にローカルストレージからタスクを読み込む
  useEffect(() => {
    const loadTasks = () => {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        try {
          const parsedTasks = JSON.parse(savedTasks);
          // 日付文字列をDate型に変換
          const tasksWithDates = parsedTasks.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          }));
          setTasks(tasksWithDates);
        } catch (error) {
          console.error('Failed to parse tasks from localStorage:', error);
          setTasks([]);
        }
      }
      setLoading(false);
    };

    loadTasks();
  }, []);

  // タスクが変更されたらローカルストレージに保存
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, loading]);

  // 新しいタスクを追加
  const addTask = (taskData: TaskFormData): Task => {
    const now = new Date();
    const newTask: Task = {
      id: uuidv4(),
      ...taskData,
      createdAt: now,
      updatedAt: now,
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    return newTask;
  };

  // タスクを更新
  const updateTask = (id: string, taskData: Partial<TaskFormData>): Task | null => {
    let updatedTask: Task | null = null;
    
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === id) {
          updatedTask = {
            ...task,
            ...taskData,
            updatedAt: new Date()
          };
          return updatedTask;
        }
        return task;
      })
    );
    
    return updatedTask;
  };

  // タスクを削除
  const deleteTask = (id: string): void => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  // タスクのステータスを変更
  const changeTaskStatus = (id: string, status: Task['status']): Task | null => {
    return updateTask(id, { status });
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus
  };
};