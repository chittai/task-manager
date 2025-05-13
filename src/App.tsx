import React, { useState, useEffect } from 'react';
import {
  AppLayout,
  Header,
  Spinner,
  Alert,
  SpaceBetween,
  ContentLayout,
  SideNavigation,
} from '@cloudscape-design/components';
import '@cloudscape-design/global-styles/index.css';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTasks, InternalTask, FilterCriteria, SortCriteria } from './hooks/useTasks'; 
import { Task, TaskFormData, Project, TaskStatus } from './models/Task'; 
import { Comment as ProjectComment } from './models/Comment'; 
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal'; 
import { ProjectList } from './components/ProjectList';
import { AddTaskButton } from './components/AddTaskButton'; 
import { useProjects } from './hooks/useProjects';
import ProjectDetailPage from './pages/ProjectDetailPage';
import InboxListPage from './pages/InboxListPage';
import WaitingOnListPage from './pages/WaitingOnListPage';
import SomedayMaybeListPage from './pages/SomedayMaybeListPage';
import ReferenceListPage from './pages/ReferenceListPage';

const NavigationWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeHref, setActiveHref] = useState(location.pathname);

  useEffect(() => {
    setActiveHref(location.pathname);
  }, [location.pathname]);

  return (
    <AppLayout
      navigationHide={false}
      toolsHide={true}
      contentType="default"
      navigation={
        <SideNavigation
          activeHref={activeHref}
          header={{ href: '/', text: 'タスクマネージャー' }}
          onFollow={(event) => {
            if (!event.detail.external) {
              event.preventDefault();
              setActiveHref(event.detail.href);
              navigate(event.detail.href);
            }
          }}
          items={[
            { type: 'link', text: 'タスク一覧', href: '/' },
            { type: 'link', text: 'インボックス', href: '/inbox' },
            { type: 'link', text: '待機中タスク', href: '/waiting-on' },
            { type: 'link', text: 'いつかやるリスト', href: '/someday-maybe' },
            { type: 'link', text: '資料リスト', href: '/reference' },
            { type: 'link', text: 'プロジェクト一覧', href: '/projects' },
          ]}
        />
      }
      content={ <AppContent /> }
    />
  );
};

const AppContent: React.FC = () => {
  const {
    tasks, 
    allTasks, 
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
  const [listUpdateKey, setListUpdateKey] = useState(0);

  const handleOpenCreateModal = () => {
    setSelectedTask(undefined); 
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

  const handleUpdateExistingTask = async (id: string, formData: TaskFormData): Promise<InternalTask | null> => {
    const updatedTask = await updateTask(id, formData);
    setIsEditModalVisible(false);
    setSelectedTask(undefined);
    return updatedTask;
  };

  const handleAddNewTask = async (formData: TaskFormData): Promise<InternalTask | null> => {
    const newTask = await addTask(formData);
    setIsCreateModalVisible(false);
    if (newTask) { 
      setListUpdateKey(prevKey => prevKey + 1);
    }
    return newTask;
  };

  const handleAddCommentToTask = async (taskId: string, content: string): Promise<InternalTask | null> => {
    return addCommentToTask(taskId, content);
  };

  const handleUpdateCommentInTask = async (taskId: string, commentId: string, content: string): Promise<InternalTask | null> => {
    return updateTaskComment(taskId, commentId, content);
  };

  const handleDeleteCommentInTask = async (taskId: string, commentId: string): Promise<InternalTask | null> => {
    return deleteTaskComment(taskId, commentId);
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await changeTaskStatus(taskId, status);
  };

  if (tasksLoading || projectsLoading) return <Spinner size="large" />;
  if (tasksError || projectsError) return <Alert statusIconAriaLabel="Error" type="error">{tasksError || projectsError}</Alert>;

  const tasksForTaskList: Task[] = tasks.map((internalTask: InternalTask): Task => {
    const commentsForTask: ProjectComment[] | undefined = internalTask.comments?.map(comment => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt?.toISOString(), 
    }));

    return {
      ...internalTask,
      createdAt: internalTask.createdAt.toISOString(),
      updatedAt: internalTask.updatedAt.toISOString(),
      dueDate: internalTask.dueDate?.toISOString(),
      comments: commentsForTask, 
    };
  });

  return (
    <Routes> 
      <Route path="/" element={ 
        <ContentLayout header={<Header variant="h1">タスク管理</Header>}> 
          <SpaceBetween size="l">
            <AddTaskButton onClick={handleOpenCreateModal} />
            <TaskList
              key={`task-list-${listUpdateKey}`} 
              tasks={tasksForTaskList} 
              loading={tasksLoading}
              error={tasksError}
              filterCriteria={filterCriteria as FilterCriteria} 
              setFilterCriteria={setFilterCriteria as React.Dispatch<React.SetStateAction<Partial<FilterCriteria>>>} 
              sortCriteria={sortCriteria as SortCriteria | null} 
              setSortCriteria={setSortCriteria as React.Dispatch<React.SetStateAction<SortCriteria | null>>} 
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
              task={selectedTask} 
              onUpdateTask={handleUpdateExistingTask}
              onAddTask={handleAddNewTask}
              projects={projects as Project[]} 
              onAddComment={handleAddCommentToTask} 
              onUpdateComment={handleUpdateCommentInTask} 
              onDeleteComment={handleDeleteCommentInTask} 
            />
          </SpaceBetween>
        </ContentLayout>
      } />
      <Route path="/inbox" element={<InboxListPage />} />
      <Route path="/waiting-on" element={<WaitingOnListPage />} />
      <Route path="/someday-maybe" element={<SomedayMaybeListPage />} />
      <Route path="/reference" element={<ReferenceListPage />} />
      <Route path="/projects" element={<ProjectList />} />
      <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <NavigationWrapper />
    </BrowserRouter>
  );
}

export default App;