import React from 'react';
import {
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
  Badge,
  Icon
} from '@cloudscape-design/components';
import { Task } from '../models/Task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onOpenGtdFlow: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onOpenGtdFlow
}) => {
  const getStatusIndicator = (status: Task['status']) => {
    switch (status) {
      case 'inbox':
        return <StatusIndicator type="info">受信箱</StatusIndicator>;
      case 'todo':
        return <StatusIndicator type="pending">未着手</StatusIndicator>;
      case 'in-progress':
        return <StatusIndicator type="in-progress">進行中</StatusIndicator>;
      case 'done':
        return <StatusIndicator type="success">完了</StatusIndicator>;
      case 'wait-on':
        return <StatusIndicator type="warning">待機中</StatusIndicator>;
      case 'someday-maybe':
        return <StatusIndicator type="stopped">いつかやるリスト</StatusIndicator>;
      case 'reference':
        return <StatusIndicator type="info">参照資料</StatusIndicator>;
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
      case 'inbox':
        return 'todo'; // インボックスからは未着手へ
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

  // inboxステータスのタスクをクリックしたときのハンドラ
  const handleCardClick = () => {
    if (task.status === 'inbox') {
      onOpenGtdFlow(task.id);
    }
  };

  // inboxステータスのタスクの場合、カードにホバー効果を追加するためのスタイル
  const divStyle = task.status === 'inbox' ? {
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#f0f0f0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }
  } : {};

  return (
    <div 
      onClick={task.status === 'inbox' ? handleCardClick : undefined}
      style={task.status === 'inbox' ? {cursor: 'pointer'} : undefined}
    >
    <Container
      header={
        <Header
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              {task.status === 'inbox' ? (
                <Button onClick={(e) => {
                  e.stopPropagation(); // カード全体のクリックイベントが発火しないようにする
                  onOpenGtdFlow(task.id);
                }} variant="primary" iconName="external">GTD処理</Button>
              ) : (
                <Button onClick={(e) => {
                  e.stopPropagation(); // カード全体のクリックイベントが発火しないようにする
                  onOpenGtdFlow(task.id);
                }} variant="normal" iconName="external">GTD</Button>
              )}
              <Button onClick={(e) => {
                e.stopPropagation(); // カード全体のクリックイベントが発火しないようにする
                onEdit(task);
              }} variant="icon" iconName="edit" />
              <Button onClick={(e) => {
                e.stopPropagation(); // カード全体のクリックイベントが発火しないようにする
                onDelete(task.id);
              }} variant="icon" iconName="remove" />
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
          <Box>期限: {formatDate(task.dueDate ? new Date(task.dueDate) : undefined)}</Box>
          <Box>作成: {formatDate(new Date(task.createdAt))}</Box>
        </SpaceBetween>
        
        {task.status !== 'inbox' && (
          <Button onClick={(e) => {
            e.stopPropagation(); // カード全体のクリックイベントが発火しないようにする
            handleStatusChange();
          }}>
            {task.status === 'todo' ? '進行中にする' : 
             task.status === 'in-progress' ? '完了にする' : 
             '未着手に戻す'}
          </Button>
        )}
        
        {task.status === 'inbox' && (
          <Box color="text-status-info" fontWeight="bold">
            クリックしてGTD処理を開始
          </Box>
        )}
      </SpaceBetween>
    </Container>
    </div>
  );
};

export default TaskCard;