import React, { useState, useEffect } from 'react';
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
import { InternalTask } from '../hooks/useTasks';

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

  useEffect(() => {
    setCurrentTask(existingTask);
  }, [existingTask, visible]);

  const handleTaskFormSubmit = async (formData: TaskFormData) => {
    let updatedOrNewTask: InternalTask | null = null;
    if (existingTask && onUpdateTask) {
      updatedOrNewTask = await onUpdateTask(existingTask.id, formData);
    } else if (onAddTask) {
      updatedOrNewTask = await onAddTask(formData);
    }
    if (updatedOrNewTask) {
      setCurrentTask(updatedOrNewTask);
    }
    onDismiss();
  };

  const handleAddCommentInternal = async (commentContent: string) => {
    if (currentTask && currentTask.id && onAddComment) {
      try {
        const updatedTask = await onAddComment(currentTask.id, commentContent);
        if (updatedTask) {
          setCurrentTask(updatedTask);
        }
      } catch (error) {
        console.error("Failed to add comment:", error);
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

  const commentsForList: CommentType[] = [];
  if (currentTask && currentTask.comments) {
    commentsForList.push(...currentTask.comments);
  }

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={modalTitle}
      closeAriaLabel="Close modal"
      size="medium"
    >
      <Tabs
        tabs={[
          {
            label: 'タスク詳細',
            id: 'task-details',
            content: (
              <TaskForm
                initialTask={currentTask ? (('createdAt' in currentTask && typeof currentTask.createdAt !== 'string') ? { ...currentTask, createdAt: (currentTask.createdAt as Date).toISOString(), updatedAt: (currentTask.updatedAt as Date).toISOString(), dueDate: (currentTask.dueDate as Date)?.toISOString() } : currentTask as Task) : undefined}
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
                      onSubmit={handleAddCommentInternal} 
                      isLoading={false} 
                      submitButtonText="コメントを追加"
                    />
                    <Box margin={{ top: 'l' }}>
                      <CommentList 
                        comments={commentsForList} 
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