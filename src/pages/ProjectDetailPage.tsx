import React from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { useProjects } from '../hooks/useProjects';
import { Project, ProjectFormData } from '../models/Project'; 
import { useTasks, FilterCriteria, SortCriteria, InternalTask, TaskFormData, InternalTaskComment } from '../hooks/useTasks'; 
import { Task, TaskCommentModel } from '../models/Task'; 
import TaskList from '../components/TaskList';
import ProjectModal, { ProjectModalProps } from '../components/ProjectModal'; 
import {
  AppLayout,
  Box,
  BreadcrumbGroup,
  Button,
  Container,
  ContentLayout,
  Flashbar,
  Header,
  SpaceBetween,
  Spinner,
  Alert
} from '@cloudscape-design/components';
import { BreadcrumbGroupProps } from '@cloudscape-design/components/breadcrumb-group/interfaces';
import { FlashbarProps } from '@cloudscape-design/components/flashbar/interfaces';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate(); 
  const { 
    getProjectById, 
    updateProject: updateProjectInHook, 
    deleteProject, 
    loading: projectsLoadingFromHook, 
    error: projectsErrorFromHook     
  } = useProjects(); 
  const { tasks, loading: tasksLoading, error: tasksError, deleteTask, updateTask: updateTaskInHook, changeTaskStatus, setFilterCriteria, setSortCriteria, filterCriteria, sortCriteria }: any = useTasks(); 

  const [project, setProject] = React.useState<Project | null>(null);
  const [projectTasks, setProjectTasks] = React.useState<Task[]>([]); 
  const [loadingProject, setLoadingProject] = React.useState(true);
  const [errorProject, setErrorProject] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<FlashbarProps.MessageDefinition[]>([]);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);


  React.useEffect(() => {
    if (projectId) {
      if (projectsLoadingFromHook) {
        setLoadingProject(true); 
        setErrorProject(null);   
        setProject(null);        
      } else if (projectsErrorFromHook) {
        setLoadingProject(false);
        setErrorProject(`プロジェクトデータの読み込みに失敗しました: ${projectsErrorFromHook}`);
        setProject(null);
        setNotifications([
          { type: 'error', content: `プロジェクトデータの読み込みエラー: ${projectsErrorFromHook}`, id: 'project-hook-load-error' }
        ]);
      } else {
        setLoadingProject(true); 
        setErrorProject(null);
        try {
          const fetchedProject = getProjectById(projectId);
          if (fetchedProject) {
            setProject(fetchedProject);
            setNotifications([]); 
          } else {
            setErrorProject('指定されたプロジェクトが見つかりませんでした。');
            setProject(null);
            setNotifications([
              { type: 'error', content: '指定されたプロジェクトが見つかりませんでした。', id: 'project-not-found' }
            ]);
          }
        } catch (e: any) {
          setErrorProject(`プロジェクトの取得中にエラーが発生しました: ${e.message}`);
          setProject(null);
          setNotifications([
            { type: 'error', content: `プロジェクトの取得エラー: ${e.message}`, id: 'project-get-error' }
          ]);
          console.error(e);
        }
        setLoadingProject(false);
      }
    } else {
      setProject(null);
      setLoadingProject(false);
      setErrorProject(null);
      setNotifications([]);
    }
  }, [projectId, getProjectById, projectsLoadingFromHook, projectsErrorFromHook]);

  React.useEffect(() => {
    if (project && tasks.length > 0) {
      const filteredTasks: Task[] = tasks.map((internalTask: InternalTask) => ({
        ...internalTask,
        createdAt: internalTask.createdAt.toISOString(),
        updatedAt: internalTask.updatedAt.toISOString(),
        dueDate: internalTask.dueDate?.toISOString(),
        comments: internalTask.comments?.map((c: InternalTaskComment) => ({
          ...c, 
          createdAt: c.createdAt.toISOString() 
        } as TaskCommentModel)) 
      })).filter((task: Task) => task.projectId === project.id);
      setProjectTasks(filteredTasks); 
    } else if (project && tasks.length === 0 && !tasksLoading) {
      setProjectTasks([]);
    }
  }, [project, tasks, tasksLoading]);

  const handleEditProject = async (projectId: string, updatedProjectData: ProjectFormData): Promise<Project | null> => { 
    try {
        const updatedProject = await updateProjectInHook(projectId, updatedProjectData); 
        if (updatedProject) {
          setProject(updatedProject); 
        }
        setNotifications([{ type: 'success', content: 'プロジェクトが正常に更新されました。', id: 'project-update-success', dismissible: true }]);
        setIsModalOpen(false);
        return updatedProject; 
    } catch (error: any) { 
        setNotifications([{ type: 'error', content: `プロジェクトの更新に失敗しました: ${error.message}`, id: 'project-update-error', dismissible: true }]);
        return null; 
    }
  };

  const handleDeleteProject = () => {
    if (project && window.confirm(`プロジェクト「${project.name}」を削除しますか？関連するタスクも全て削除されます。`)) {
        try {
            projectTasks.forEach(task => deleteTask(task.id));
            deleteProject(project.id);
            setNotifications([{ type: 'success', content: 'プロジェクトが正常に削除されました。', id: 'project-delete-success', dismissible: true }]);
            navigate('/projects'); 
        } catch (error: any) {
            setNotifications([{ type: 'error', content: `プロジェクトの削除に失敗しました: ${error.message}`, id: 'project-delete-error', dismissible: true }]);
        }
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('タスクを削除しますか？')) {
      try {
        deleteTask(taskId);
        setNotifications([{ type: 'success', content: 'タスクが正常に削除されました。', id: 'task-delete-success', dismissible: true }]);
      } catch (error: any) {
        setNotifications([{ type: 'error', content: `タスクの削除に失敗しました: ${error.message}`, id: 'task-delete-error', dismissible: true }]);
      }
    }
  };
  
  const handleTaskModalSubmit = (taskData: Task) => {
    try {
      if (editingTask) { 
        const taskToSubmit: TaskFormData = {
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
            priority: taskData.priority,
            dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
            projectId: taskData.projectId,
        };
        updateTaskInHook(taskData.id, taskToSubmit); 
        setNotifications([{ type: 'success', content: 'タスクが正常に更新されました。', id: 'task-update-success', dismissible: true }]);
      } 
      setIsTaskModalOpen(false);
      setEditingTask(null);
    } catch (error: any) {
      setNotifications([{ type: 'error', content: `タスクの更新に失敗しました: ${error.message}`, id: 'task-update-error', dismissible: true }]);
    }
  };


  const breadcrumbs: BreadcrumbGroupProps.Item[] = [
    { text: 'プロジェクト一覧', href: '/projects' },
  ];
  if (loadingProject) {
    breadcrumbs.push({ text: 'ロード中...', href: '#' });
  } else if (project) {
    breadcrumbs.push({ text: project.name, href: `/projects/${project.id}` });
  } else {
    breadcrumbs.push({ text: 'プロジェクトが見つかりません', href: '#' });
  }

  if (loadingProject) {
    return (
      <AppLayout
        contentType="default"
        content={<Spinner size="large" />}
        breadcrumbs={<BreadcrumbGroup items={breadcrumbs} />}
        navigationHide={true}
        toolsHide={true}
        notifications={<Flashbar items={notifications} />}
      />
    );
  }

  if (errorProject || !project) {
    return (
      <AppLayout
        contentType="default"
        content={<Alert statusIconAriaLabel="エラー" type="error" header="プロジェクト情報の取得に失敗しました">{errorProject || '指定されたプロジェクトが見つかりません。'}</Alert>}
        breadcrumbs={<BreadcrumbGroup items={breadcrumbs} />}
        navigationHide={true}
        toolsHide={true}
        notifications={<Flashbar items={notifications} />}
      />
    );
  }

  return (
    <AppLayout
      contentType="default"
      breadcrumbs={<BreadcrumbGroup items={breadcrumbs} />}
      navigationHide={true} 
      toolsHide={true}
      notifications={<Flashbar items={notifications} />}
      content={
        <ContentLayout
          header={
            <Header
              variant="h1"
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button variant="primary" onClick={() => setIsModalOpen(true)}>プロジェクトを編集</Button>
                  <Button variant="normal" onClick={handleDeleteProject} iconName="delete-marker">プロジェクトを削除</Button>
                </SpaceBetween>
              }
            >
              {project.name}
            </Header>
          }
        >
          <Container>
            <SpaceBetween size="l">
              <Box>
                <Header variant="h2">プロジェクト詳細</Header>
                <SpaceBetween size="s" direction="vertical">
                  <div><strong>説明:</strong> {project.description || <span style={{color: 'gray'}}>未設定</span>}</div>
                  <div><strong>期限:</strong> {project.dueDate || <span style={{color: 'gray'}}>未設定</span>}</div>
                  <div><strong>重要度:</strong> {project.priority || <span style={{color: 'gray'}}>未設定</span>}</div>
                  <div><strong>作成日:</strong> {new Date(project.createdAt).toLocaleDateString()}</div>
                  <div><strong>更新日:</strong> {new Date(project.updatedAt).toLocaleDateString()}</div>
                </SpaceBetween>
              </Box>

              <Box>
                <Header variant="h2">関連タスク</Header>
                {tasksLoading && <Spinner />}
                {!tasksLoading && tasksError && <Alert statusIconAriaLabel="エラー" type="error" header="タスクの取得に失敗しました">{tasksError}</Alert>}
                {!tasksLoading && !tasksError && (
                  <TaskList 
                    tasks={projectTasks} 
                    loading={false} 
                    error={null} 
                    onEditTask={handleEditTask} 
                    onDeleteTask={handleDeleteTask} 
                    filterCriteria={filterCriteria as FilterCriteria} 
                    setFilterCriteria={setFilterCriteria as React.Dispatch<React.SetStateAction<Partial<FilterCriteria>>>} 
                    sortCriteria={sortCriteria as SortCriteria | null} 
                    setSortCriteria={setSortCriteria as React.Dispatch<React.SetStateAction<SortCriteria | null>>} 
                    onStatusChange={changeTaskStatus} 
                  />
                )}
              </Box>
            </SpaceBetween>
          </Container>
          {isModalOpen && project && (
            <ProjectModal
              project={project}
              visible={isModalOpen} 
              onDismiss={() => setIsModalOpen(false)}
              onUpdateProject={handleEditProject}
            />
          )}
          {isTaskModalOpen && editingTask && (
            <Alert header="タスク編集モーダル (仮)">TaskID: {editingTask.id} を編集中</Alert>
          )}
        </ContentLayout>
      }
    />
  );
};

export default ProjectDetailPage;
