import React from 'react';
import { Modal } from '@cloudscape-design/components';
import TaskForm from './TaskForm';
import { Task, TaskFormData } from '../models/Task';

interface TaskModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (task: TaskFormData) => void;
  task?: Task;
  title: string;
  submitButtonText: string;
}

const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  task,
  title,
  submitButtonText
}) => {
  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={title}
      size="medium"
    >
      <TaskForm
        onSubmit={onSubmit}
        onCancel={onDismiss}
        initialValues={task}
        submitButtonText={submitButtonText}
      />
    </Modal>
  );
};

export default TaskModal;