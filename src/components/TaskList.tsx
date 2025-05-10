import React, { useState } from 'react';
import {
  Cards,
  Button,
  Header,
  Pagination,
  TextFilter,
  SpaceBetween,
  SegmentedControl,
  Box,
  Spinner,
  Alert,
  Link,
  Select
} from '@cloudscape-design/components';
import { Task, TaskStatus } from '../models/Task';
import { FilterCriteria, SortCriteria, TaskSortableField, SortDirection } from '../hooks/useTasks';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filterCriteria: Partial<FilterCriteria>;
  setFilterCriteria: (criteria: Partial<FilterCriteria>) => void;
  sortCriteria: SortCriteria | null;
  setSortCriteria: (criteria: SortCriteria | null) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const sortableFields: { label: string; value: TaskSortableField }[] = [
  { label: 'タイトル', value: 'title' },
  { label: 'ステータス', value: 'status' },
  { label: '優先度', value: 'priority' },
  { label: '期限日', value: 'dueDate' },
  { label: '作成日時', value: 'createdAt' },
  { label: '更新日時', value: 'updatedAt' },
];

const sortDirections: { label: string; value: SortDirection }[] = [
  { label: '昇順', value: 'asc' },
  { label: '降順', value: 'desc' },
];

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  error,
  filterCriteria,
  setFilterCriteria,
  sortCriteria,
  setSortCriteria,
  onEditTask,
  onDeleteTask,
  onStatusChange
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 9;

  const handleTextFilterChange = (text: string) => {
    setFilterCriteria({ ...filterCriteria, searchTerm: text || undefined });
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (selectedId: string | null) => {
    setFilterCriteria({
      ...filterCriteria,
      status: selectedId === 'all' || !selectedId ? undefined : (selectedId as TaskStatus),
    });
    setCurrentPage(1);
  };

  const handlePriorityFilterChange = (selectedId: string | null) => {
    setFilterCriteria({
      ...filterCriteria,
      priority: selectedId === 'all' || !selectedId ? undefined : (selectedId as Task['priority']),
    });
    setCurrentPage(1);
  };

  const handleSortFieldChange = (selectedField: TaskSortableField | null) => {
    if (selectedField) {
      setSortCriteria({
        field: selectedField,
        direction: sortCriteria?.direction || 'asc', // Default to asc or keep current
      });
    } else {
      setSortCriteria(null); // Clear sort
    }
    setCurrentPage(1); // Reset page when sort field changes
  };

  const handleSortDirectionChange = (selectedDirection: SortDirection) => {
    if (sortCriteria && sortCriteria.field) { // Only if a field is selected
      setSortCriteria({ ...sortCriteria, direction: selectedDirection });
    }
    // setCurrentPage(1); // Optional: Reset page on direction change, usually not needed
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = tasks.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <Box textAlign="center" padding="xl">
        <Spinner size="large" />
        <Box variant="h3" color="inherit" padding={{ top: 's' }}>タスクを読み込み中...</Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding="xl">
        <Alert statusIconAriaLabel="エラー" type="error" header="タスクの読み込みに失敗しました">
          {error} <Link onFollow={() => window.location.reload()}>再読み込み</Link>
        </Alert>
      </Box>
    );
  }

  return (
    <Cards
      header={
        <Header
          actions={
            <SpaceBetween direction="horizontal" size="m">
              <Select 
                selectedOption={sortCriteria ? sortableFields.find(f => f.value === sortCriteria.field) || null : null}
                onChange={({ detail }) => handleSortFieldChange(detail.selectedOption?.value as TaskSortableField || null)}
                options={sortableFields} 
                placeholder="ソート基準"
                empty="基準なし"
              />
              <Select
                selectedOption={sortCriteria && sortCriteria.direction ? (sortDirections.find(d => d.value === sortCriteria.direction) || null) : null}
                onChange={({ detail }) => handleSortDirectionChange(detail.selectedOption.value as SortDirection)}
                options={sortDirections} 
                disabled={!sortCriteria || !sortCriteria.field} 
                placeholder="順序"
              />
            </SpaceBetween>
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
            filteringText={filterCriteria.searchTerm || ''}
            filteringPlaceholder="タスクを検索..."
            filteringAriaLabel="タスクを検索"
            onChange={({ detail }) => handleTextFilterChange(detail.filteringText)}
          />
          <SpaceBetween direction="horizontal" size="m">
            <SegmentedControl
              selectedId={filterCriteria.status || 'all'}
              onChange={({ detail }) => handleStatusFilterChange(detail.selectedId)}
              options={[
                { id: 'all', text: 'ステータス: すべて' },
                { id: 'inbox', text: '受信箱' },
                { id: 'todo', text: '未着手' },
                { id: 'in-progress', text: '進行中' },
                { id: 'wait-on', text: '待機中' },
                { id: 'done', text: '完了' }
              ]}
            />
            <SegmentedControl
              selectedId={filterCriteria.priority || 'all'}
              onChange={({ detail }) => handlePriorityFilterChange(detail.selectedId)}
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
          pagesCount={Math.max(1, Math.ceil(tasks.length / itemsPerPage))}
          onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
        />
      }
      empty={
        <Box textAlign="center" color="inherit">
          <b>タスクがありません</b>
          <Box padding={{ bottom: "s" }} variant="p" color="inherit">
            フィルター条件に一致するタスクがないか、タスクが登録されていません。
          </Box>
        </Box>
      }
    />
  );
};

export default TaskList;