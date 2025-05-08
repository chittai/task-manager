import React, { useState } from 'react';
import { AppLayout, ContentLayout, Header } from '@cloudscape-design/components';
import '@cloudscape-design/global-styles/index.css';
import { useTasks, InternalTask } from './hooks/useTasks';
import { Task, TaskFormData, TaskStatus } from './models/Task';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';

const toAppTask = (internalTask: InternalTask): Task => {
  return {
    ...internalTask,
    dueDate: internalTask.dueDate?.toISOString(),
    createdAt: internalTask.createdAt.toISOString(),
    updatedAt: internalTask.updatedAt.toISOString(),
  };
};

const toAppTasks = (internalTasks: InternalTask[]): Task[] => {
  return internalTasks.map(toAppTask);
};

function App() {
  const {
    tasks: internalTasks,
    loading,
    error,
    filterCriteria,
    setFilterCriteria,
    sortCriteria,
    setSortCriteria,
    deleteTask,
    changeTaskStatus,
  } = useTasks();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const appTasks = toAppTasks(internalTasks);

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('このタスクを削除してもよろしいですか？')) {
      deleteTask(taskId);
    }
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalVisible(true);
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    changeTaskStatus(taskId, status);
  };

  const handleModalTaskUpdate = (updatedTask: InternalTask | Task | null) => {
    if (updatedTask) {
      if ('createdAt' in updatedTask && typeof updatedTask.createdAt !== 'string') {
        setSelectedTask(toAppTask(updatedTask as InternalTask));
      } else {
        setSelectedTask(updatedTask as Task);
      }
    } else {
      setSelectedTask(undefined);
    }
  };

  return (
    <AppLayout
      content={
        <ContentLayout
          header={
            <Header
              variant="h1"
              description="Cloudscapeを使ったタスク管理アプリケーション"
            >
              タスク管理
            </Header>
          }
        >
          <TaskList
            tasks={appTasks}
            loading={loading}
            error={error}
            filterCriteria={filterCriteria}
            setFilterCriteria={setFilterCriteria}
            sortCriteria={sortCriteria}
            setSortCriteria={setSortCriteria}
            onEditTask={handleEditClick}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onAddNewTask={() => setIsAddModalVisible(true)}
          />

          {/* タスク追加モーダル */}
          <TaskModal
            visible={isAddModalVisible}
            onDismiss={() => setIsAddModalVisible(false)}
            onTaskUpdate={handleModalTaskUpdate}
          />

          {/* タスク編集モーダル */}
          <TaskModal
            visible={isEditModalVisible}
            onDismiss={() => {
              setIsEditModalVisible(false);
              setSelectedTask(undefined);
            }}
            task={selectedTask}
            onTaskUpdate={handleModalTaskUpdate}
          />
        </ContentLayout>
      }
      navigationHide
      toolsHide
    />
  );
}

export default App;