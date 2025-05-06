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
    addTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    addCommentToTask,
  } = useTasks();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const appTasks = toAppTasks(internalTasks);

  const handleAddTask = (taskData: TaskFormData) => {
    addTask(taskData);
    setIsAddModalVisible(false);
  };

  const handleEditTask = (taskData: TaskFormData) => {
    if (selectedTask) {
      updateTask(selectedTask.id, taskData);
      setIsEditModalVisible(false);
      setSelectedTask(undefined);
    }
  };

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
            onSubmit={handleAddTask}
            title="新しいタスク"
            submitButtonText="作成"
            onAddComment={() => {}}
          />

          {/* タスク編集モーダル */}
          <TaskModal
            visible={isEditModalVisible}
            onDismiss={() => {
              setIsEditModalVisible(false);
              setSelectedTask(undefined);
            }}
            onSubmit={handleEditTask}
            task={selectedTask}
            title="タスクを編集"
            submitButtonText="更新"
            onAddComment={addCommentToTask}
          />
        </ContentLayout>
      }
      navigationHide
      toolsHide
    />
  );
}

export default App;