import React, { useState } from 'react';
import { AppLayout, ContentLayout, Header, SideNavigation, SplitPanel } from '@cloudscape-design/components';
import '@cloudscape-design/global-styles/index.css';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTasks, InternalTask } from './hooks/useTasks';
import { Task, TaskFormData, TaskStatus } from './models/Task';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import { ProjectList } from './components/ProjectList';

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

const NavigationItems: React.FC = () => {
  const location = useLocation();
  return (
    <SideNavigation
      activeHref={location.pathname}
      header={{ href: '/', text: 'TaskManager' }}
      items={[
        { type: 'link', text: 'タスク一覧', href: '/' },
        { type: 'link', text: 'プロジェクト一覧', href: '/projects' },
      ]}
    />
  );
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
    addTask,
    updateTask,
    addCommentToTask,
    updateTaskComment,
    deleteTaskComment,
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

  return (
    <BrowserRouter>
      <AppLayout
        navigation={<NavigationItems />}
        navigationHide={false}
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
            <Routes>
              <Route path="/" element={
                <>
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
                  <TaskModal
                    visible={isAddModalVisible}
                    onDismiss={() => setIsAddModalVisible(false)}
                    onAddTask={addTask}
                    onAddComment={addCommentToTask}
                    onUpdateComment={updateTaskComment}
                    onDeleteComment={deleteTaskComment}
                  />
                  <TaskModal
                    visible={isEditModalVisible}
                    onDismiss={() => {
                      setIsEditModalVisible(false);
                      setSelectedTask(undefined);
                    }}
                    task={selectedTask}
                    onUpdateTask={updateTask}
                    onAddComment={addCommentToTask}
                    onUpdateComment={updateTaskComment}
                    onDeleteComment={deleteTaskComment}
                  />
                </>
              } />
              <Route path="/projects" element={<ProjectList />} />
            </Routes>
          </ContentLayout>
        }
        toolsHide
      />
    </BrowserRouter>
  );
}

export default App;