import React from 'react';
import {
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
  StatusIndicator,
  Badge,
  Icon,
  ColumnLayout
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

  const formatDate = (date: Date | string | undefined) => {
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
  
  // GTD関連の属性を表示するメソッド
  const getEnergyLevelBadge = (energy?: Task['energy']) => {
    if (!energy) return null;
    
    const colors: Record<string, "blue" | "green" | "red"> = {
      'low': 'blue',
      'medium': 'green',
      'high': 'red'
    };
    
    const labels: Record<string, string> = {
      'low': 'エネルギー: 低',
      'medium': 'エネルギー: 中',
      'high': 'エネルギー: 高'
    };
    
    return <Badge color={colors[energy]}>{labels[energy]}</Badge>;
  };
  
  const getTimeEstimateBadge = (time?: Task['time']) => {
    if (!time) return null;
    
    const colors: Record<string, "blue" | "green" | "red"> = {
      'quick': 'blue',
      'medium': 'green',
      'long': 'red'
    };
    
    const labels: Record<string, string> = {
      'quick': '時間: 短',
      'medium': '時間: 中',
      'long': '時間: 長'
    };
    
    return <Badge color={colors[time]}>{labels[time]}</Badge>;
  };
  
  const getContextTags = (contextTag?: string[]) => {
    if (!contextTag || contextTag.length === 0) return null;
    
    return (
      <Box>
        <SpaceBetween direction="horizontal" size="xxs">
          {contextTag.map((tag, index) => (
            <Badge key={index} color="blue">コンテキスト: {tag}</Badge>
          ))}
        </SpaceBetween>
      </Box>
    );
  };
  
  const getProjectBadge = (isProject?: boolean) => {
    if (!isProject) return null;
    
    return <Badge color="green">プロジェクト</Badge>;
  };
  
  const getNextActionBadge = (nextAction?: boolean) => {
    if (!nextAction) return null;
    
    return <Badge color="red">次のアクション</Badge>;
  };
  
  const getDelegatedInfo = (delegatedTo?: string) => {
    if (!delegatedTo) return null;
    
    return <Box>委任先: {delegatedTo}</Box>;
  };
  
  const getWaitingForInfo = (waitingFor?: string) => {
    if (!waitingFor) return null;
    
    return <Box>待機理由: {waitingFor}</Box>;
  };
  
  const getCategoryInfo = (category?: string, subcategory?: string) => {
    if (!category && !subcategory) return null;
    
    if (category && subcategory) {
      return <Box>カテゴリ: {category}/{subcategory}</Box>;
    } else if (category) {
      return <Box>カテゴリ: {category}</Box>;
    } else if (subcategory) {
      return <Box>サブカテゴリ: {subcategory}</Box>;
    }
    
    return null;
  };

  return (
    <div 
      onClick={task.status === 'inbox' ? handleCardClick : undefined}
      style={task.status === 'inbox' ? {cursor: 'pointer'} : undefined}
    >
      <Container
        header={
          <Header
            variant="h3"
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  iconName="edit"
                  variant="icon"
                  onClick={e => {
                    e.stopPropagation();
                    onEdit(task);
                  }}
                />
                <Button
                  iconName="status-positive"
                  variant="icon"
                  onClick={e => {
                    e.stopPropagation();
                    handleStatusChange();
                  }}
                />
                <Button
                  iconName="remove"
                  variant="icon"
                  onClick={e => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                />
              </SpaceBetween>
            }
          >
            {task.title}
          </Header>
        }
      >
        <SpaceBetween size="s">
          <Box>{task.description}</Box>

          <SpaceBetween direction="horizontal" size="xs">
            {getStatusIndicator(task.status)}
            {getPriorityBadge(task.priority)}
            {task.dueDate && (
              <Box>
                <Icon name="calendar" /> {formatDate(task.dueDate)}
              </Box>
            )}
          </SpaceBetween>

          {/* GTD関連の属性を表示 */}
          <ColumnLayout columns={2} variant="text-grid">
            <SpaceBetween size="xs">
              {/* 左側のカラム */}
              {getDelegatedInfo(task.delegatedTo)}
              {getWaitingForInfo(task.waitingFor)}
              {getCategoryInfo(task.category, task.subcategory)}
            </SpaceBetween>
            
            <SpaceBetween size="xs">
              {/* 右側のカラム - バッジ表示 */}
              <SpaceBetween direction="horizontal" size="xxs">
                {getProjectBadge(task.isProject)}
                {getNextActionBadge(task.nextAction)}
                {getEnergyLevelBadge(task.energy)}
                {getTimeEstimateBadge(task.time)}
              </SpaceBetween>
              {getContextTags(task.contextTag)}
            </SpaceBetween>
          </ColumnLayout>
          
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