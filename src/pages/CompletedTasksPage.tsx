import React, { useState, useMemo, useEffect } from 'react';
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
 * 完了済みタスクページコンポーネント
 * 
 * 'done'ステータスのタスクを表示するための専用ページです。
 * GTDメソッドの「レビュー」フェーズに対応し、完了したタスクを確認できます。
 */
const CompletedTasksPage: React.FC = () => {
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

  // コンポーネントマウント時に'done'フィルターを適用
  useEffect(() => {
    setFilterCriteria({ ...filterCriteria, status: 'done' });
    // 更新日時の降順でソート（デフォルト）
    setSortCriteria({ field: 'updatedAt', direction: 'desc' });
  }, []);

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

  return (
    <ContentLayout header={<Header variant="h1">完了済みタスク</Header>}>
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
        {isEditModalVisible && (
          <TaskModal
            visible={isEditModalVisible}
            onDismiss={() => {
              setIsEditModalVisible(false);
              setSelectedTask(null);
            }}
            task={selectedTask || undefined}
            onUpdateTask={handleUpdateExistingTask}
            onAddTask={() => Promise.resolve(null)} // 完了済みページでは新規追加は不要
            projects={projects}
          />
        )}
      </SpaceBetween>
    </ContentLayout>
  );
};

export default CompletedTasksPage;
