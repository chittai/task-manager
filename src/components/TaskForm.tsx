import React, { useState, useEffect } from 'react';
import {
  FormField,
  Input,
  Select,
  DatePicker,
  Textarea,
  Button,
  SpaceBetween,
  Form,
  Container,
  Header,
  SelectProps,
} from '@cloudscape-design/components';
import { Task, TaskFormData, TaskStatus, TaskPriority } from '../models/Task';
import { Project } from '../models/Project';

interface TaskFormProps {
  initialTask?: Task | null;
  onSubmit: (formData: TaskFormData) => void;
  onCancel: () => void;
  submitButtonText?: string;
  projects?: Project[];
  projectsLoading?: boolean;
  projectsError?: string | null;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialTask,
  onSubmit,
  onCancel,
  submitButtonText = initialTask ? '更新' : '作成',
  projects = [],
  projectsLoading = false,
  projectsError = null,
}) => {
  const [formData, setFormData] = useState<TaskFormData>(() => {
    const defaults: TaskFormData = {
      title: '',
      description: '',
      status: 'inbox' as TaskStatus,
      priority: 'medium' as TaskPriority,
      dueDate: '',
      projectId: '',
      projectName: '',
    };
    if (initialTask) {
      return {
        title: initialTask.title || '',
        description: initialTask.description || '',
        status: initialTask.status || ('inbox' as TaskStatus),
        priority: initialTask.priority || ('medium' as TaskPriority),
        dueDate: initialTask.dueDate || '',
        projectId: initialTask.projectId || '',
        projectName: initialTask.projectName || '',
      };
    }
    return defaults;
  });

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title || '',
        description: initialTask.description || '',
        status: initialTask.status || ('inbox' as TaskStatus),
        priority: initialTask.priority || ('medium' as TaskPriority),
        dueDate: initialTask.dueDate || '',
        projectId: initialTask.projectId || '',
        projectName: initialTask.projectName || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'inbox' as TaskStatus,
        priority: 'medium' as TaskPriority,
        dueDate: '',
        projectId: '',
        projectName: '',
      });
    }
  }, [initialTask]);

  const handleChange = (
    field: keyof TaskFormData,
    value: string | TaskStatus | TaskPriority
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = (selectedOption: SelectProps.Option | null) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        projectId: selectedOption.value || '',
        projectName: selectedOption.label || '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        projectId: '',
        projectName: '',
      }));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  const projectOptions: SelectProps.Option[] = [
    { label: 'プロジェクトなし', value: '' },
    ...projects.map((p) => ({ label: p.name, value: p.id })),
  ];

  const selectedProjectOption = projectOptions.find(
    (option) => option.value === formData.projectId
  ) || null;

  return (
    <form onSubmit={handleSubmit}>
      <Form
        actions={(
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onCancel}>
              キャンセル
            </Button>
            <Button variant="primary">
              {submitButtonText}
            </Button>
          </SpaceBetween>
        )}
        header={<Header variant="h2">タスク情報</Header>}
      >
        <Container>
          <SpaceBetween direction="vertical" size="l">
            <FormField
              label="タイトル"
              errorText={!formData.title ? "タイトルは必須です" : ""}
            >
              <Input
                value={formData.title}
                onChange={({ detail }) => handleChange('title', detail.value)}
                placeholder="タスクのタイトルを入力"
              />
            </FormField>

            <FormField label="説明">
              <Textarea
                value={formData.description}
                onChange={({ detail }) => handleChange('description', detail.value)}
                placeholder="タスクの詳細を入力"
                rows={3}
              />
            </FormField>

            <FormField
              label="プロジェクト"
              errorText={projectsError ? projectsError : undefined}
            >
              <Select
                selectedOption={selectedProjectOption}
                onChange={({ detail }) => handleProjectChange(detail.selectedOption)}
                options={projectOptions}
                loadingText="プロジェクトを読み込み中..."
                placeholder="プロジェクトを選択"
                disabled={projectsLoading}
                statusType={projectsLoading ? 'loading' : projectsError ? 'error' : 'finished'}
                empty="利用可能なプロジェクトがありません"
              />
            </FormField>

            <FormField label="ステータス">
              <Select
                selectedOption={{
                  label: formData.status.charAt(0).toUpperCase() + formData.status.slice(1),
                  value: formData.status,
                }}
                onChange={({ detail }) =>
                  handleChange('status', detail.selectedOption.value as TaskStatus)
                }
                options={[
                  { label: 'Inbox', value: 'inbox' },
                  { label: 'To Do', value: 'todo' },
                  { label: 'In Progress', value: 'in-progress' },
                  { label: 'Done', value: 'done' },
                  { label: 'Wait On', value: 'wait-on' },
                ]}
              />
            </FormField>

            <FormField label="優先度">
              <Select
                selectedOption={{
                  label: formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1),
                  value: formData.priority,
                }}
                onChange={({ detail }) =>
                  handleChange('priority', detail.selectedOption.value as TaskPriority)
                }
                options={[
                  { label: 'Low', value: 'low' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High', value: 'high' },
                ]}
              />
            </FormField>

            <FormField label="期限日">
              <DatePicker
                value={formData.dueDate || ''}
                onChange={({ detail }) => handleChange('dueDate', detail.value)}
                placeholder="YYYY/MM/DD"
                isDateEnabled={(date) =>
                  date >= new Date(new Date().setDate(new Date().getDate() - 1))
                }
              />
            </FormField>
          </SpaceBetween>
        </Container>
      </Form>
    </form>
  );
};

export default TaskForm;