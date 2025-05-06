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
  initialValues?: Partial<Task>;
  submitButtonText?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  submitButtonText = '保存'
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    status: initialValues?.status || 'todo',
    priority: initialValues?.priority || 'medium',
    dueDate: initialValues?.dueDate || undefined, // Store as string (ISO) or undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // When initialValues prop changes, update the form data to reflect the new selection or reset if null
    setFormData({
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      status: initialValues?.status || 'todo',
      priority: initialValues?.priority || 'medium',
      dueDate: initialValues?.dueDate || undefined, // Store as string (ISO) or undefined
    });
  }, [initialValues]);

  const handleChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // エラーをクリア
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

  // Cloudscapeのボタンに対応するイベントハンドラ
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
            value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''} // Convert ISO to YYYY-MM-DD for display
            onChange={e => handleChange('dueDate', e.detail.value === '' ? undefined : e.detail.value)} // Store ISO string or undefined
            placeholder="YYYY/MM/DD"
          />
        </FormField>
      </SpaceBetween>
    </Form>
  );
};

// ラベル定義
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