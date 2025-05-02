import React from 'react';
import {
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
  Badge
} from '@cloudscape-design/components';
import { Task } from '../models/Task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const getStatusIndicator = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return <StatusIndicator type="pending">未着手</StatusIndicator>;
      case 'in-progress':
        return <StatusIndicator type="in-progress">進行中</StatusIndicator>;
      case 'done':
        return <StatusIndicator type="success">完了</StatusIndicator>;
      default:
        return <StatusIndicator type="stopped">不明</StatusIndicator>;
    }
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return <Badge color="blue">優先度: 低</Badge>;
      case 'medium':
        return <Badge color="green">優先度: 中</Badge>;
      case 'high':
        return <Badge color="red">優先度: 高</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '未設定';
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getNextStatus = (currentStatus: Task['status']): Task['status'] => {
    switch (currentStatus) {
      case 'todo':
        return 'in-progress';
      case 'in-progress':
        return 'done';
      case 'done':
        return 'todo';
      default:
        return 'todo';
    }
  };

  const handleStatusChange = () => {
    const nextStatus = getNextStatus(task.status);
    onStatusChange(task.id, nextStatus);
  };

  return (
    <Container
      header={
        <Header
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => onEdit(task)} variant="icon" iconName="edit" />
              <Button onClick={() => onDelete(task.id)} variant="icon" iconName="remove" />
            </SpaceBetween>
          }
        >
          {task.title}
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="m">
        <Box>{task.description}</Box>
        
        <SpaceBetween direction="horizontal" size="xs">
          {getStatusIndicator(task.status)}
          {getPriorityBadge(task.priority)}
        </SpaceBetween>
        
        <SpaceBetween direction="horizontal" size="xs">
          <Box>期限: {formatDate(task.dueDate)}</Box>
          <Box>作成: {formatDate(task.createdAt)}</Box>
        </SpaceBetween>
        
        <Button onClick={handleStatusChange}>
          {task.status === 'todo' ? '進行中にする' : 
           task.status === 'in-progress' ? '完了にする' : 
           '未着手に戻す'}
        </Button>
      </SpaceBetween>
    </Container>
  );
};

export default TaskCard;