import React, { useState, useEffect } from 'react';
import {
  AppLayout,
  Header,
  Spinner,
  Alert,
  SpaceBetween,
  ContentLayout
} from '@cloudscape-design/components';
import '@cloudscape-design/global-styles/index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; 
import { useTasks, InternalTask, FilterCriteria, SortCriteria } from './hooks/useTasks'; 
import { Task, TaskFormData, Project, TaskStatus } from './models/Task'; 
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal'; 
import { ProjectList } from './components/ProjectList';
import { AddTaskButton } from './components/AddTaskButton'; 
import { useProjects } from './hooks/useProjects';

function App() {
  const {
    tasks, 
    allInternalTasks, 
    loading: tasksLoading, 
    error: tasksError,
    addTask,
    updateTask,
    deleteTask,
    addCommentToTask,   
    updateTaskComment,   
    deleteTaskComment,   
    filterCriteria,     
    setFilterCriteria,   
    sortCriteria,       
    setSortCriteria,     
    changeTaskStatus,
  } = useTasks();

  const { 
    projects, 
    loading: projectsLoading, 
    error: projectsError 
  } = useProjects();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const handleOpenCreateModal = () => {
    setSelectedTask(undefined); // Ensure no task is selected for creation
    setIsCreateModalVisible(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('このタスクを削除してもよろしいですか？')) {
      await deleteTask(taskId);
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalVisible(true);
  };

  const handleFormSubmit = async (formData: TaskFormData) => { 
    if (selectedTask && selectedTask.id) {
      await updateTask(selectedTask.id, formData);
    } else {
      await addTask(formData);
    }
    setIsEditModalVisible(false);
    setIsCreateModalVisible(false);
    setSelectedTask(undefined);
  };

  const handleAddCommentToTask = async (taskId: string, content: string, userId?: string, author?: string): Promise<void> => {
    await addCommentToTask(taskId, content, userId, author);
  };

  const handleUpdateCommentInTask = async (taskId: string, commentId: string, content: string): Promise<void> => {
    await updateTaskComment(taskId, commentId, content);
  };

  const handleDeleteCommentInTask = async (taskId: string, commentId: string): Promise<void> => {
    await deleteTaskComment(taskId, commentId);
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await changeTaskStatus(taskId, status);
    // Optionally, refresh tasks or rely on useTasks to update the tasks list
    // setTasks(prev => prev.map(t => t.id === taskId ? {...t, status} : t)); // If direct update needed
  };

  if (tasksLoading || projectsLoading) return <Spinner size="large" />;
  if (tasksError || projectsError) return <Alert statusIconAriaLabel="Error" type="error">{tasksError || projectsError}</Alert>;

  return (
    <BrowserRouter>
      <AppLayout
        navigationHide={true}
        toolsHide={true}
        contentType="default"
        content={
          <Routes> 
            <Route path="/" element={ 
              <ContentLayout header={<Header variant="h1">タスク管理</Header>}> 
                <SpaceBetween size="l">
                  <AddTaskButton onClick={handleOpenCreateModal} />
                  <TaskList
                    tasks={tasks} 
                    loading={tasksLoading}
                    error={tasksError}
                    filterCriteria={filterCriteria}
                    setFilterCriteria={setFilterCriteria}
                    sortCriteria={sortCriteria}
                    setSortCriteria={setSortCriteria}
                    onEditTask={handleEditTask} 
                    onDeleteTask={handleDeleteTask} 
                    onStatusChange={handleStatusChange} 
                  />
                  <TaskModal
                    key={selectedTask ? `edit-${selectedTask.id}` : 'create-task'}
                    visible={isCreateModalVisible || isEditModalVisible}
                    onDismiss={() => {
                      setIsCreateModalVisible(false);
                      setIsEditModalVisible(false);
                      setSelectedTask(undefined);
                    }}
                    taskToEdit={selectedTask}
                    onSubmit={handleFormSubmit} 
                    projects={projects}
                    onAddComment={handleAddCommentToTask}
                    onUpdateComment={handleUpdateCommentInTask}
                    onDeleteComment={handleDeleteCommentInTask}
                  />
                </SpaceBetween>
              </ContentLayout>
            } />
            <Route path="/projects" element={<ProjectList />} />
          </Routes>
        }
      />
    </BrowserRouter>
  );
}

export default App;