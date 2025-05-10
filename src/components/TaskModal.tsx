import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  Box,
  SpaceBetween,
  Tabs,
} from '@cloudscape-design/components';
import { Task, TaskFormData, TaskCommentModel as CommentType, Project } from '../models/Task';
import TaskForm from './TaskForm';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
// import { AuthContext } from '../context/AuthContext'; 
import { InternalTask } from '../hooks/useTasks';

interface TaskModalProps {
  visible: boolean;
  onDismiss: () => void;
  onAddTask?: (formData: TaskFormData) => Promise<InternalTask | null>;
  onUpdateTask?: (id: string, formData: TaskFormData) => Promise<InternalTask | null>;
  onAddComment?: (taskId: string, commentContent: string, userId?: string, author?: string) => Promise<InternalTask | null>; 
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
      // const updatedTask = await onAddComment(currentTask.id, commentContent, auth.user?.username, auth.user?.username ); 
      const updatedTask = await onAddComment(currentTask.id, commentContent); 
      if (updatedTask) {
        setCurrentTask(updatedTask);
      }
    }
  };

  const updateCommentForCommentList = async (commentId: string, newContent: string): Promise<void> => {
    if (currentTask && currentTask.id && onUpdateComment) {
      const updatedTask = await onUpdateComment(currentTask.id, commentId, newContent);
      if (updatedTask) {
        setCurrentTask(updatedTask);
      }
    }
  };

  const deleteCommentForCommentList = async (commentId: string): Promise<void> => {
    if (currentTask && currentTask.id && onDeleteComment) {
      const updatedTask = await onDeleteComment(currentTask.id, commentId);
      if (updatedTask) {
        setCurrentTask(updatedTask);
      }
    }
  };

  const tabs = [
    {
      id: 'task-details',
      label: 'タスク詳細',
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
      id: 'comments',
      label: 'コメント',
      disabled: !currentTask || !currentTask.id, 
      content: (
        <SpaceBetween size="l">
          {currentTask && currentTask.id && (
            <CommentList
              comments={currentTask && 'comments' in currentTask ? currentTask.comments as CommentType[] : []} 
              updateTaskComment={updateCommentForCommentList}
              deleteTaskComment={deleteCommentForCommentList}
              taskId={currentTask.id!}
              // currentUserId={auth.user?.username} 
            />
          )}
          <CommentForm onSubmit={handleAddComment} />
        </SpaceBetween>
      ),
    },
  ];

  return (
    <Modal
      onDismiss={onDismiss}
      visible={visible}
      header={currentTask && currentTask.id ? 'タスク編集' : 'タスク作成'}
      closeAriaLabel="閉じる"
    >
      <Tabs
        tabs={tabs}
        activeTabId={activeTabId}
        onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
      />
    </Modal>
  );
};

export default TaskModal;