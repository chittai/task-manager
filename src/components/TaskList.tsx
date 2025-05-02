import React, { useState } from 'react';
import {
  Cards,
  Button,
  Header,
  Pagination,
  TextFilter,
  SpaceBetween,
  SegmentedControl,
  Box
} from '@cloudscape-design/components';
import { Task } from '../models/Task';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onAddNewTask: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onAddNewTask
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  
  const itemsPerPage = 9;

  // フィルタリング
  const filteredTasks = tasks.filter(task => {
    // テキストフィルター
    const matchesText = !filterText || 
      task.title.toLowerCase().includes(filterText.toLowerCase()) ||
      task.description.toLowerCase().includes(filterText.toLowerCase());
    
    // ステータスフィルター
    const matchesStatus = !statusFilter || task.status === statusFilter;
    
    // 優先度フィルター
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    
    return matchesText && matchesStatus && matchesPriority;
  });

  // ページネーション
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <Cards
      header={
        <Header
          actions={
            <Button onClick={onAddNewTask} variant="primary">
              新しいタスク
            </Button>
          }
        >
          タスク一覧
        </Header>
      }
      cardDefinition={{
        header: item => item.title,
        sections: [
          {
            id: 'card',
            content: item => (
              <TaskCard
                task={item}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStatusChange={onStatusChange}
              />
            )
          }
        ]
      }}
      items={paginatedTasks}
      filter={
        <SpaceBetween direction="vertical" size="m">
          <TextFilter
            filteringText={filterText}
            filteringPlaceholder="タスクを検索..."
            filteringAriaLabel="タスクを検索"
            onChange={({ detail }) => {
              setFilterText(detail.filteringText);
              setCurrentPage(1);
            }}
          />
          <SpaceBetween direction="horizontal" size="m">
            <SegmentedControl
              selectedId={statusFilter || 'all'}
              onChange={({ detail }) => {
                setStatusFilter(detail.selectedId === 'all' ? null : detail.selectedId);
                setCurrentPage(1);
              }}
              options={[
                { id: 'all', text: 'すべて' },
                { id: 'todo', text: '未着手' },
                { id: 'in-progress', text: '進行中' },
                { id: 'done', text: '完了' }
              ]}
            />
            <SegmentedControl
              selectedId={priorityFilter || 'all'}
              onChange={({ detail }) => {
                setPriorityFilter(detail.selectedId === 'all' ? null : detail.selectedId);
                setCurrentPage(1);
              }}
              options={[
                { id: 'all', text: '優先度: すべて' },
                { id: 'low', text: '優先度: 低' },
                { id: 'medium', text: '優先度: 中' },
                { id: 'high', text: '優先度: 高' }
              ]}
            />
          </SpaceBetween>
        </SpaceBetween>
      }
      pagination={
        <Pagination
          currentPageIndex={currentPage}
          pagesCount={Math.max(1, Math.ceil(filteredTasks.length / itemsPerPage))}
          onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
        />
      }
      empty={
        <Box textAlign="center" color="inherit">
          <b>タスクがありません</b>
          <Box padding={{ bottom: "s" }} variant="p" color="inherit">
            新しいタスクを作成してください。
          </Box>
          <Button onClick={onAddNewTask}>新しいタスク</Button>
        </Box>
      }
    />
  );
};

export default TaskList;