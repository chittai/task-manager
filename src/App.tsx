import React, { useState, useEffect } from 'react';
import {
  AppLayout,
  Header,
  Spinner,
  Alert,
  SpaceBetween,
  ContentLayout,
  SideNavigation,
  SideNavigationProps,
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
import NextActionsPage from './pages/NextActionsPage';
import ScheduledTasksPage from './pages/ScheduledTasksPage';
import CompletedTasksPage from './pages/CompletedTasksPage';

// カスタムナビゲーション項目の型定義
type CustomNavigationItem = SideNavigationProps.Item & {
  counter?: number;
};

type CustomNavigationSection = SideNavigationProps.Section & {
  items: CustomNavigationItem[];
};

type CustomNavigationItems = (CustomNavigationItem | CustomNavigationSection)[];

const NavigationWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeHref, setActiveHref] = useState(location.pathname);
  const { tasks } = useTasks();

  useEffect(() => {
    setActiveHref(location.pathname);
  }, [location.pathname]);

  // タスク数のカウント
  const countTasksByStatus = (status: TaskStatus | TaskStatus[]): number => {
    if (Array.isArray(status)) {
      return tasks.filter(task => status.includes(task.status)).length;
    }
    return tasks.filter(task => task.status === status).length;
  };

  // 次のアクションのカウント
  const nextActionCount = tasks.filter(task => 
    task.status === 'todo' && task.nextAction === true
  ).length;

  // 期限付きタスクのカウント
  const scheduledTasksCount = tasks.filter(task => 
    task.status === 'todo' && task.dueDate !== undefined && task.dueDate !== null
  ).length;

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
            // 収集フェーズ
            {
              type: 'section',
              text: '収集',
              items: [
                { 
                  type: 'link', 
                  text: 'インボックス', 
                  href: '/inbox',
                  counter: countTasksByStatus('inbox')
                },
              ]
            },
            // 処理・整理フェーズ
            {
              type: 'section',
              text: '処理・整理',
              items: [
                { 
                  type: 'link', 
                  text: 'すべてのタスク', 
                  href: '/',
                  counter: tasks.length
                },
                { 
                  type: 'link', 
                  text: '次のアクション', 
                  href: '/next-actions',
                  counter: nextActionCount
                },
                { 
                  type: 'link', 
                  text: '予定済みタスク', 
                  href: '/scheduled',
                  counter: scheduledTasksCount
                },
                { 
                  type: 'link', 
                  text: '待機中タスク', 
                  href: '/waiting-on',
                  counter: countTasksByStatus('wait-on')
                },
                { 
                  type: 'link', 
                  text: 'プロジェクト一覧', 
                  href: '/projects'
                },
              ]
            },
            // 参照フェーズ
            {
              type: 'section',
              text: '参照',
              items: [
                { 
                  type: 'link', 
                  text: '資料リスト', 
                  href: '/reference',
                  counter: countTasksByStatus('reference')
                },
                { 
                  type: 'link', 
                  text: 'いつかやるリスト', 
                  href: '/someday-maybe',
                  counter: countTasksByStatus('someday-maybe')
                },
              ]
            },
            // レビューフェーズ
            {
              type: 'section',
              text: 'レビュー',
              items: [
                { 
                  type: 'link', 
                  text: '完了済みタスク', 
                  href: '/completed',
                  counter: countTasksByStatus('done')
                },
              ]
            },
          ] as CustomNavigationItems}
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
      <Route path="/next-actions" element={<NextActionsPage />} />
      <Route path="/scheduled" element={<ScheduledTasksPage />} />
      <Route path="/waiting-on" element={<WaitingOnListPage />} />
      <Route path="/someday-maybe" element={<SomedayMaybeListPage />} />
      <Route path="/reference" element={<ReferenceListPage />} />
      <Route path="/completed" element={<CompletedTasksPage />} />
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