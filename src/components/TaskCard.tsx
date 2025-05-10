import React from 'react';
import {
  Box,
  Button,
  Card,
  Header,
  SpaceBetween,
  StatusIndicator,
  ColumnLayout,
  Icon,
  TextContent,
  Badge
} from '@cloudscape-design/components';
import { Task, TaskStatus, TaskPriority } from '../models/Task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const getStatusInfo = (status: TaskStatus) => {
  switch (status) {
    case 'todo':
      return { type: 'info', label: 'To Do' } as const;
    case 'in-progress':
      return { type: 'info', label: 'In Progress' } as const;
    case 'done':
      return { type: 'success', label: 'Done' } as const;
    case 'inbox':
      return { type: 'warning', label: 'Inbox' } as const;
    case 'wait-on':
        return { type: 'stopped', label: 'Wait On'} as const;
    default:
      const exhaustiveCheck: never = status;
      return { type: 'stopped', label: 'Unknown' } as const;
  }
};

const getPriorityIconName = (priority: TaskPriority): 'flag' | undefined => {
  switch (priority) {
    case 'high':
    case 'medium':
    case 'low':
      return 'flag';
    default:
      const exhaustiveCheck: never = priority;
      return undefined;
  }
};

const getPriorityIconVariant = (priority: TaskPriority): 'error' | 'warning' | 'subtle' | undefined => {
  switch (priority) {
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'subtle';
    default:
      const exhaustiveCheck: never = priority;
      return undefined;
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '未設定';
  try {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    console.error("Invalid date string:", dateString);
    return '日付無効';
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const statusInfo = getStatusInfo(task.status);
  const priorityIconName = getPriorityIconName(task.priority);
  const priorityIconVariant = getPriorityIconVariant(task.priority);

  const getNextStatus = (currentStatus: TaskStatus): TaskStatus => {
    switch (currentStatus) {
      case 'inbox':
        return 'todo';
      case 'todo':
        return 'in-progress';
      case 'in-progress':
        return 'done';
      case 'done':
        return 'todo'; 
      case 'wait-on':
        return 'todo'; 
      default:
        const exhaustiveCheck: never = currentStatus;
        return 'inbox'; 
    }
  };

  const handleStatusChange = () => {
    const nextStatus = getNextStatus(task.status);
    onStatusChange(task.id, nextStatus);
  };
  
  const getStatusChangeButtonText = (currentStatus: TaskStatus): string => {
    switch (currentStatus) {
      case 'inbox':
        return 'Todoにする';
      case 'todo':
        return '進行中にする';
      case 'in-progress':
        return '完了にする';
      case 'done':
        return 'Todoに戻す'; 
      case 'wait-on':
        return 'Todoにする';
      default:
        return 'ステータス変更';
    }
  };

  return (
    <Card
      variant="default"
      header={
        <Header
          variant="h3"
          actions={(
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => onEdit(task)} iconName="edit" variant="icon" ariaLabel="編集" />
              <Button onClick={() => onDelete(task.id)} iconName="remove" variant="icon" ariaLabel="削除" />
            </SpaceBetween>
          )}
        >
          {task.title}
        </Header>
      }
    >
      <SpaceBetween size="m">
        <SpaceBetween direction="horizontal" size="xs" alignItems="center"> 
          {priorityIconName && (
             <Box margin={{ right: 'xxs' }}> 
                <Icon name={priorityIconName} variant={priorityIconVariant} />
             </Box>
          )}
          <StatusIndicator type={statusInfo.type}>{statusInfo.label}</StatusIndicator>
        </SpaceBetween>

        {task.projectName && (
          <Box color="text-body-secondary" fontSize="body-s">
            <Icon name="folder" /> {task.projectName}
          </Box>
        )}
        
        {task.description && 
          <TextContent>
            <p>{task.description}</p>
          </TextContent>
        }

        <ColumnLayout columns={2} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">期限日</Box>
            <div>{formatDate(task.dueDate)}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">作成日</Box>
            <div>{formatDate(task.createdAt)}</div>
          </div>
        </ColumnLayout>

        <Button onClick={handleStatusChange} fullWidth>
          {getStatusChangeButtonText(task.status)}
        </Button>
      </SpaceBetween>
    </Card>
  );
};

export default TaskCard;