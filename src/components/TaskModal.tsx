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
  console.log('[TaskModal.tsx] Rendering - existingTask.comments:', JSON.stringify(existingTask?.comments, null, 2));
  const [activeTabId, setActiveTabId] = useState('task-details');
  const { addTask, updateTask, addCommentToTask, updateTaskComment, deleteTaskComment } = useTasks();

  const handleTaskFormSubmit = async (formData: TaskFormData) => {
    let updatedOrNewTask: InternalTask | null = null;
    if (existingTask) {
      updatedOrNewTask = updateTask(existingTask.id, formData);
    } else {
      updatedOrNewTask = addTask(formData);
    }
    if (onTaskUpdate && updatedOrNewTask) {
      console.log('[TaskModal.tsx] handleTaskFormSubmit - calling onTaskUpdate with comments:', JSON.stringify(updatedOrNewTask?.comments, null, 2));
      onTaskUpdate(updatedOrNewTask);
    }
    onDismiss();
  };

  const handleAddComment = async (commentContent: string) => {
    if (existingTask) {
      try {
        const updatedTask = await addCommentToTask(existingTask.id, commentContent);
        if (onTaskUpdate && updatedTask) {
          console.log('[TaskModal.tsx] handleAddComment - calling onTaskUpdate with comments:', JSON.stringify(updatedTask?.comments, null, 2));
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
    console.log('[TaskModal.tsx] useEffect[visible] - existingTask.comments:', JSON.stringify(existingTask?.comments, null, 2));
  }, [visible, existingTask]);

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
                      {console.log('[TaskModal.tsx] Rendering CommentList - passing existingTask.comments:', JSON.stringify(existingTask.comments, null, 2))}
                      <CommentList 
                        comments={existingTask.comments || []} 
                        taskId={existingTask.id} 
                        updateTaskComment={updateTaskComment}
                        deleteTaskComment={deleteTaskComment}
                        onCommentsChanged={(updatedTaskFromList) => {
                          console.log('[TaskModal.tsx] onCommentsChanged (from CommentList) - received updatedTask.comments:', JSON.stringify(updatedTaskFromList?.comments, null, 2));
                          if (onTaskUpdate) {
                            onTaskUpdate(updatedTaskFromList);
                          }
                        }}
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