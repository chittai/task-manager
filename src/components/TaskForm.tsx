import React, { useState, useEffect } from 'react';
import {
  Form,
  FormField,
  Input,
  Textarea,
  Select,
  Button,
  SpaceBetween,
  DatePicker
} from '@cloudscape-design/components';
import { TaskFormData, Task } from '../models/Task';

interface TaskFormProps {
  onSubmit: (task: TaskFormData) => void;
  onCancel: () => void;
  initialTask?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  initialTask,
}) => {
  const submitButtonText = initialTask ? '変更を保存' : 'タスクを作成';

  const [formData, setFormData] = useState<TaskFormData>({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    status: initialTask?.status || 'todo',
    priority: initialTask?.priority || 'medium',
    dueDate: initialTask?.dueDate || undefined,
    projectId: initialTask?.projectId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      title: initialTask?.title || '',
      description: initialTask?.description || '',
      status: initialTask?.status || 'todo',
      priority: initialTask?.priority || 'medium',
      dueDate: initialTask?.dueDate || undefined,
      projectId: initialTask?.projectId,
    });
  }, [initialTask]);

  const handleChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="link" onClick={() => onCancel()}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={() => handleFormSubmit()}>
            {submitButtonText}
          </Button>
        </SpaceBetween>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        <FormField
          label="タイトル"
          errorText={errors.title}
        >
          <Input
            value={formData.title}
            onChange={e => handleChange('title', e.detail.value)}
          />
        </FormField>

        <FormField
          label="説明"
        >
          <Textarea
            value={formData.description}
            onChange={e => handleChange('description', e.detail.value)}
          />
        </FormField>

        <FormField
          label="ステータス"
        >
          <Select
            selectedOption={{ value: formData.status, label: statusLabels[formData.status] || formData.status }}
            onChange={e => handleChange('status', e.detail.selectedOption.value as Task['status'])}
            options={Object.entries(statusLabels).map(([value, label]) => ({ value: value as Task['status'], label }))}
          />
        </FormField>

        <FormField
          label="優先度"
        >
          <Select
            selectedOption={{ value: formData.priority, label: priorityLabels[formData.priority] }}
            onChange={e => handleChange('priority', e.detail.selectedOption.value as Task['priority'])}
            options={Object.entries(priorityLabels).map(([value, label]) => ({ value: value as Task['priority'], label }))}
          />
        </FormField>

        <FormField
          label="期限"
        >
          <DatePicker
            value={formData.dueDate || ''}
            onChange={e => handleChange('dueDate', e.detail.value === '' ? undefined : e.detail.value)}
            placeholder="YYYY/MM/DD"
          />
        </FormField>
      </SpaceBetween>
    </Form>
  );
};

const statusLabels: Record<Task['status'], string> = {
  'todo': '未着手',
  'in-progress': '進行中',
  'done': '完了',
  'inbox': '受信箱',
  'wait-on': '待機中'
};

const priorityLabels: Record<Task['priority'], string> = {
  'low': '低',
  'medium': '中',
  'high': '高'
};

export default TaskForm;