import React, { useState } from 'react';
import {
  Modal,
  Box,
  SpaceBetween,
  Tabs,
} from '@cloudscape-design/components';
import { Task, TaskFormData } from '../models/Task';
import TaskForm from './TaskForm';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { useTasks, InternalTask } from '../hooks/useTasks';

interface TaskModalProps {
  visible: boolean;
  onDismiss: () => void;
  onTaskUpdate?: (updatedTask: InternalTask | Task | null) => void;
  task?: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  onDismiss,
  task: existingTask,
  onTaskUpdate,
}) => {
  const [activeTabId, setActiveTabId] = useState('task-details');
  const { addTask, updateTask, addCommentToTask } = useTasks();

  const handleTaskFormSubmit = async (formData: TaskFormData) => {
    let updatedOrNewTask: InternalTask | null = null;
    if (existingTask) {
      updatedOrNewTask = updateTask(existingTask.id, formData);
    } else {
      updatedOrNewTask = addTask(formData);
    }
    if (onTaskUpdate && updatedOrNewTask) {
      onTaskUpdate(updatedOrNewTask);
    }
    onDismiss();
  };

  const handleAddComment = async (commentContent: string) => {
    if (existingTask) {
      try {
        const updatedTask = await addCommentToTask(existingTask.id, commentContent);
        if (onTaskUpdate && updatedTask) {
          onTaskUpdate(updatedTask);
        }
      } catch (error) {
        console.error("Failed to add comment:", error);
      }
    }
  };

  const modalTitle = existingTask ? 'タスクを編集' : '新しいタスク';

  React.useEffect(() => {
    if (!visible) {
      setActiveTabId('task-details');
    }
  }, [visible]);

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
                initialTask={existingTask || undefined}
                onSubmit={handleTaskFormSubmit}
                onCancel={onDismiss}
              />
            ),
          },
          {
            label: 'コメント',
            id: 'comments',
            disabled: !existingTask,
            content: (
              <Box margin={{ top: 'm' }}>
                <SpaceBetween size="l">
                  {existingTask && (
                    <>
                      <CommentForm 
                        onSubmit={handleAddComment} 
                        isLoading={false} 
                        submitButtonText="コメントを追加"
                      />
                      <CommentList 
                        comments={existingTask.comments || []} 
                        taskId={existingTask.id} 
                      />
                    </>
                  )}
                </SpaceBetween>
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