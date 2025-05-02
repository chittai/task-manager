import React, { useState } from 'react';
import { AppLayout, ContentLayout, Header } from '@cloudscape-design/components';
import '@cloudscape-design/global-styles/index.css';
import { useTasks } from './hooks/useTasks';
import { Task, TaskFormData } from './models/Task';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';

function App() {
  const { tasks, loading, addTask, updateTask, deleteTask, changeTaskStatus } = useTasks();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

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

  const handleStatusChange = (taskId: string, status: Task['status']) => {
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
          {loading ? (
            <div>読み込み中...</div>
          ) : (
            <TaskList
              tasks={tasks}
              onEditTask={handleEditClick}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
              onAddNewTask={() => setIsAddModalVisible(true)}
            />
          )}

          {/* タスク追加モーダル */}
          <TaskModal
            visible={isAddModalVisible}
            onDismiss={() => setIsAddModalVisible(false)}
            onSubmit={handleAddTask}
            title="新しいタスク"
            submitButtonText="作成"
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
          />
        </ContentLayout>
      }
      navigationHide
      toolsHide
    />
  );
}

export default App;