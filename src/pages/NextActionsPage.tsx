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
import { AddTaskButton } from '../components/AddTaskButton';

/**
 * 次のアクションページコンポーネント
 * 
 * 'todo'ステータスかつ'nextAction'フラグがtrueのタスクを表示するための専用ページです。
 * GTDメソッドの「整理」フェーズで特定された、次に取り組むべき具体的なアクションを一覧表示します。
 */
const NextActionsPage: React.FC = () => {
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    updateTask,
    deleteTask,
    addTask,
    filterCriteria,
    setFilterCriteria,
    sortCriteria,
    setSortCriteria,
    changeTaskStatus,
  } = useTasks();

  const { projects, loading: projectsLoading } = useProjects();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // 次のアクションタスクのみをフィルタリング
  const nextActionTasks = useMemo(() => {
    return tasks.filter(task => task.status === 'todo' && task.nextAction === true);
  }, [tasks]);

  // InternalTask[] から Task[] への変換
  const tasksForTaskList = useMemo(() => {
    return nextActionTasks.map((internalTask: InternalTask): Task => {
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
  }, [nextActionTasks]);

  const handleOpenCreateModal = () => {
    setSelectedTask(null);
    setIsCreateModalVisible(true);
  };

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

  const handleAddNewTask = async (formData: any) => {
    // 次のアクションとして追加する場合はステータスを'todo'に設定し、nextActionフラグをtrueに設定
    const taskData = { ...formData, status: 'todo', nextAction: true };
    const newTask = await addTask(taskData);
    setIsCreateModalVisible(false);
    return newTask;
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
    <ContentLayout header={<Header variant="h1">次のアクション</Header>}>
      <SpaceBetween size="l">
        <AddTaskButton onClick={handleOpenCreateModal} />
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
        {(isEditModalVisible || isCreateModalVisible) && (
          <TaskModal
            visible={isEditModalVisible || isCreateModalVisible}
            onDismiss={() => {
              setIsEditModalVisible(false);
              setIsCreateModalVisible(false);
              setSelectedTask(null);
            }}
            task={selectedTask || undefined}
            onUpdateTask={handleUpdateExistingTask}
            onAddTask={handleAddNewTask}
            projects={projects}
          />
        )}
      </SpaceBetween>
    </ContentLayout>
  );
};

export default NextActionsPage;
