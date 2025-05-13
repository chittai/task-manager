import React, { useState, useMemo } from 'react';
import {
  ContentLayout,
  Header,
  SpaceBetween,
  Alert,
  Spinner,
} from '@cloudscape-design/components';
import TaskList from '../components/TaskList';
import { useTasks, FilterCriteria, SortCriteria, InternalTask } from '../hooks/useTasks';
import { Comment as ProjectComment } from '../models/Comment';
import { Task, TaskStatus } from '../models/Task';
import TaskModal from '../components/TaskModal';
import { useProjects } from '../hooks/useProjects';

/**
 * 資料リストページコンポーネント
 * 
 * 'reference'ステータスのタスクを表示するための専用ページです。
 */
const ReferenceListPage: React.FC = () => {
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    updateTask,
    deleteTask,
    filterCriteria,
    setFilterCriteria,
    sortCriteria,
    setSortCriteria,
    changeTaskStatus,
  } = useTasks();

  const { projects, loading: projectsLoading } = useProjects();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // コンポーネントマウント時に'reference'フィルターを適用
  React.useEffect(() => {
    setFilterCriteria({ ...filterCriteria, status: 'reference' });
  }, []);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalVisible(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('このタスクを削除してもよろしいですか？')) {
      await deleteTask(taskId);
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await changeTaskStatus(taskId, status);
  };

  const handleUpdateExistingTask = async (id: string, formData: any) => {
    const updatedTask = await updateTask(id, formData);
    setIsEditModalVisible(false);
    setSelectedTask(null);
    return updatedTask;
  };

  if (tasksLoading || projectsLoading) {
    return (
      <ContentLayout>
        <Spinner size="large" />
      </ContentLayout>
    );
  }

  if (tasksError) {
    return (
      <ContentLayout>
        <Alert type="error">{tasksError}</Alert>
      </ContentLayout>
    );
  }

  // InternalTask[] から Task[] への変換
  const tasksForTaskList = useMemo(() => {
    return tasks.map((internalTask: InternalTask): Task => {
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
  }, [tasks]);

  return (
    <ContentLayout header={<Header variant="h1">資料リスト</Header>}>
      <SpaceBetween size="l">
        <TaskList
          tasks={tasksForTaskList}
          loading={tasksLoading}
          error={tasksError}
          filterCriteria={filterCriteria as FilterCriteria}
          setFilterCriteria={setFilterCriteria}
          sortCriteria={sortCriteria as SortCriteria | null}
          setSortCriteria={setSortCriteria}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />
        {isEditModalVisible && selectedTask && (
          <TaskModal
            visible={isEditModalVisible}
            onDismiss={() => {
              setIsEditModalVisible(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
            onUpdateTask={handleUpdateExistingTask}
            onAddTask={() => Promise.resolve(null)}
            projects={projects}
          />
        )}
      </SpaceBetween>
    </ContentLayout>
  );
};

export default ReferenceListPage;
