import React from 'react';
import { Modal, Box, SpaceBetween, Header } from '@cloudscape-design/components';
import TaskForm from './TaskForm';
import { Task, TaskFormData } from '../models/Task';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

// Comment model is implicitly used via Task.comments

interface TaskModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (task: TaskFormData) => void;
  task?: Task;
  title: string;
  submitButtonText: string;
  onAddComment: (taskId: string, content: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  task,
  title,
  submitButtonText,
  onAddComment,
}) => {
  const handleAddComment = (content: string) => {
    if (task && task.id) {
      onAddComment(task.id, content);
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={title}
      size="medium"
    >
      <SpaceBetween size="l">
        <TaskForm
          onSubmit={onSubmit}
          onCancel={onDismiss}
          initialValues={task}
          submitButtonText={submitButtonText}
        />

        {task && (
          <Box margin={{ top: 'l' }}>
            <Header variant="h3">コメント</Header>
            <SpaceBetween size="m">
              <CommentList comments={task.comments || []} />
              <CommentForm onSubmit={handleAddComment} isLoading={false} /> {/* isLoading can be dynamic if needed */}
            </SpaceBetween>
          </Box>
        )}
      </SpaceBetween>
    </Modal>
  );
};

export default TaskModal;