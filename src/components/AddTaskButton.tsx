// src/components/AddTaskButton.tsx
import React from 'react';
import { Button } from '@cloudscape-design/components';

interface AddTaskButtonProps {
  onClick: () => void;
}

export const AddTaskButton: React.FC<AddTaskButtonProps> = ({ onClick }) => {
  return (
    <Button variant="primary" onClick={onClick} iconName="add-plus">
      新しいタスクを追加
    </Button>
  );
};
