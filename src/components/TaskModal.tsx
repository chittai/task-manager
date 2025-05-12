import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Modal,
  Box,
  SpaceBetween,
  Tabs,
} from '@cloudscape-design/components';
import { Task, TaskFormData, Project } from '../models/Task';
import { Comment as CommentType } from '../models/Comment'; 
import TaskForm from './TaskForm';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
// import { AuthContext } from '../context/AuthContext'; 
import { InternalTask, InternalTaskComment } from '../hooks/useTasks';

interface TaskModalProps {
  visible: boolean;
  onDismiss: () => void;
  onAddTask?: (formData: TaskFormData) => Promise<InternalTask | null>;
  onUpdateTask?: (id: string, formData: TaskFormData) => Promise<InternalTask | null>;
  onAddComment?: (taskId: string, commentContent: string) => Promise<InternalTask | null>; 
  onUpdateComment?: (taskId: string, commentId: string, commentContent: string) => Promise<InternalTask | null>;
  onDeleteComment?: (taskId: string, commentId: string) => Promise<InternalTask | null>;
  task?: Task | null;
  projects?: Project[];
}

const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  onDismiss,
  task: existingTask,
  onAddTask,
  onUpdateTask,
  onAddComment, 
  onUpdateComment, 
  onDeleteComment, 
  projects,
}) => {
  const [activeTabId, setActiveTabId] = useState('task-details');
  const [currentTask, setCurrentTask] = useState<Task | InternalTask | null | undefined>(existingTask);
  // const { auth } = useContext(AuthContext); 

  useEffect(() => {
    if (visible) {
      setCurrentTask(existingTask);
      setActiveTabId('task-details'); 
    } else {
      // setCurrentTask(null); 
    }
  }, [visible, existingTask]);

  const handleTaskFormSubmit = async (formData: TaskFormData) => {
    let resultTask: InternalTask | null = null;
    if (currentTask && currentTask.id && onUpdateTask) {
      resultTask = await onUpdateTask(currentTask.id, formData);
    } else if (onAddTask) {
      resultTask = await onAddTask(formData);
    }
    if (resultTask) {
      setCurrentTask(resultTask); 
      // onDismiss(); 
    }
  };

  const handleAddComment = async (commentContent: string) => { 
    if (currentTask && currentTask.id && onAddComment) {
      const updatedTask = await onAddComment(currentTask.id, commentContent); 
      if (updatedTask) {
        setCurrentTask(updatedTask);
      }
    }
  };

  const handleUpdateCommentForList = async (taskId: string, commentId: string, commentContent: string): Promise<InternalTask | null> => {
    if (onUpdateComment) {
      const updatedTask = await onUpdateComment(taskId, commentId, commentContent);
      if (updatedTask) setCurrentTask(updatedTask);
      return updatedTask;
    }
    return null;
  };

  const handleDeleteCommentForList = async (taskId: string, commentId: string): Promise<InternalTask | null> => {
    if (onDeleteComment) {
      const updatedTask = await onDeleteComment(taskId, commentId);
      if (updatedTask) setCurrentTask(updatedTask);
      return updatedTask;
    }
    return null;
  };

  const wrappedUpdateTaskComment = async (commentId: string, newContent: string): Promise<void> => {
    if (currentTask && currentTask.id) {
      await handleUpdateCommentForList(currentTask.id, commentId, newContent);
    }
  };

  const wrappedDeleteTaskComment = async (commentId: string): Promise<void> => {
    if (currentTask && currentTask.id) {
      await handleDeleteCommentForList(currentTask.id, commentId);
    }
  };

  const modalTitle = existingTask ? 'タスクを編集' : '新しいタスク';

  useEffect(() => {
    if (!visible) {
      setActiveTabId('task-details');
    }
  }, [visible]);

  const isInternalTask = (task: Task | InternalTask): task is InternalTask => {
    return task.createdAt instanceof Date;
  };

  const convertInternalTaskToTask = (internalTask: InternalTask): Task => {
    return {
      ...internalTask,
      createdAt: internalTask.createdAt.toISOString(),
      updatedAt: internalTask.updatedAt.toISOString(),
      dueDate: internalTask.dueDate?.toISOString(),
      comments: internalTask.comments?.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt?.toISOString(),
      })),
    };
  };

  const taskForForm = useMemo((): Task | undefined => {
    if (!currentTask) return undefined;
    if (isInternalTask(currentTask)) {
      return convertInternalTaskToTask(currentTask);
    }
    return currentTask as Task;
  }, [currentTask]);

  const commentsForCommentList = useMemo((): CommentType[] => {
    if (!currentTask || !currentTask.comments) return [];
    if (isInternalTask(currentTask)) {
      // currentTask.comments are InternalTaskComment[]
      return (currentTask.comments as InternalTaskComment[]).map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt?.toISOString(),
      }));
    }
    // currentTask.comments are CommentType[]
    return currentTask.comments as CommentType[];
  }, [currentTask]);

  return (
    <Modal
      onDismiss={onDismiss}
      visible={visible}
      header={modalTitle} 
      closeAriaLabel="閉じる"
    >
      <Tabs
        tabs={[
          {
            label: 'タスク詳細',
            id: 'task-details',
            content: (
              <TaskForm
                initialTask={taskForForm} 
                onSubmit={handleTaskFormSubmit}
                onCancel={onDismiss}
                projects={projects}
              />
            ),
          },
          {
            label: 'コメント',
            id: 'comments',
            disabled: !currentTask, 
            content: (
              <Box margin={{ top: 'l' }}>
                {currentTask && currentTask.id && (
                  <>
                    <CommentForm 
                      onSubmit={handleAddComment} 
                      isLoading={false} 
                      submitButtonText="コメントを追加"
                    />
                    <Box margin={{ top: 'l' }}>
                      <CommentList 
                        comments={commentsForCommentList} 
                        taskId={currentTask.id!} 
                        updateTaskComment={wrappedUpdateTaskComment}
                        deleteTaskComment={wrappedDeleteTaskComment}
                      />
                    </Box>
                  </>
                )}
              </Box>
            ),
          },
        ]}
        activeTabId={activeTabId}
        onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
      />
    </Modal>
  );
};

export default TaskModal;