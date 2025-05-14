import React, { useState, useEffect } from 'react';
import {
  Form,
  FormField,
  Input,
  Textarea,
  Select,
  Button,
  SpaceBetween,
  DatePicker,
  SelectProps,
  Checkbox,
  Multiselect,
  MultiselectProps
} from '@cloudscape-design/components';
import { TaskFormData, Task, TaskStatus, TaskPriority, Project, EnergyLevel, TimeEstimate } from '../models/Task';

interface TaskFormProps {
  onSubmit: (task: TaskFormData) => void;
  onCancel: () => void;
  initialTask?: Task;
  projects?: Project[];
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  initialTask,
  projects = [],
}) => {
  const submitButtonText = initialTask ? '変更を保存' : 'タスクを作成';

  const [formData, setFormData] = useState<TaskFormData>({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    status: initialTask?.status || 'inbox',
    priority: initialTask?.priority || 'medium',
    dueDate: initialTask?.dueDate || undefined,
    projectId: initialTask?.projectId || undefined,
    // GTD関連の属性を初期化
    delegatedTo: initialTask?.delegatedTo || undefined,
    waitingFor: initialTask?.waitingFor || undefined,
    contextTag: initialTask?.contextTag || undefined,
    isProject: initialTask?.isProject || false,
    nextAction: initialTask?.nextAction || false,
    energy: initialTask?.energy || undefined,
    time: initialTask?.time || undefined,
    category: initialTask?.category || undefined,
    subcategory: initialTask?.subcategory || undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      title: initialTask?.title || '',
      description: initialTask?.description || '',
      status: initialTask?.status || 'inbox',
      priority: initialTask?.priority || 'medium',
      dueDate: initialTask?.dueDate || undefined,
      projectId: initialTask?.projectId || undefined,
      // GTD関連の属性を初期化
      delegatedTo: initialTask?.delegatedTo || undefined,
      waitingFor: initialTask?.waitingFor || undefined,
      contextTag: initialTask?.contextTag || undefined,
      isProject: initialTask?.isProject || false,
      nextAction: initialTask?.nextAction || false,
      energy: initialTask?.energy || undefined,
      time: initialTask?.time || undefined,
      category: initialTask?.category || undefined,
      subcategory: initialTask?.subcategory || undefined,
    });
  }, [initialTask]);

  const handleChange = (field: keyof TaskFormData, value: any) => {
    if (field === 'projectId') {
      setFormData(prev => ({
        ...prev,
        projectId: value === "" ? undefined : value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

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

  const projectOptions: SelectProps.Option[] = [
    { label: "プロジェクトを選択", value: "" },
    ...projects.map(p => ({ label: p.name, value: p.id }))
  ];

  const selectedProjectOption = projectOptions.find(opt => opt.value === formData.projectId) || projectOptions[0];

  // コンテキストタグの選択肢を生成
  const selectedContextOptions = formData.contextTag?.map(tag => ({
    label: tag,
    value: tag
  })) || [];

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
          label="プロジェクト"
        >
          <Select
            selectedOption={selectedProjectOption}
            onChange={e => handleChange('projectId', e.detail.selectedOption.value as string)}
            options={projectOptions}
            placeholder="プロジェクトを選択"
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

        {/* GTD関連のフィールド */}
        <FormField
          label="プロジェクトフラグ"
          description="このタスクが複数のアクションを含むプロジェクトかどうか"
        >
          <Checkbox
            checked={formData.isProject || false}
            onChange={e => handleChange('isProject', e.detail.checked)}
          >
            プロジェクトとして扱う
          </Checkbox>
        </FormField>

        <FormField
          label="次のアクション"
          description="このタスクが次に実行すべきアクションかどうか"
        >
          <Checkbox
            checked={formData.nextAction || false}
            onChange={e => handleChange('nextAction', e.detail.checked)}
          >
            次のアクションとして扱う
          </Checkbox>
        </FormField>

        {formData.status === 'wait-on' && (
          <FormField
            label="待機理由"
            description="誰からの返信を待っているか、何を待っているか"
          >
            <Input
              value={formData.waitingFor || ''}
              onChange={e => handleChange('waitingFor', e.detail.value)}
              placeholder="例: 田中さんからの返信"
            />
          </FormField>
        )}

        {formData.status === 'wait-on' && (
          <FormField
            label="委任先"
            description="タスクを委任した相手"
          >
            <Input
              value={formData.delegatedTo || ''}
              onChange={e => handleChange('delegatedTo', e.detail.value)}
              placeholder="例: 鈴木さん"
            />
          </FormField>
        )}

        <FormField
          label="コンテキストタグ"
          description="タスクを実行する場所や状況"
        >
          <Multiselect
            selectedOptions={selectedContextOptions}
            onChange={e => handleChange('contextTag', e.detail.selectedOptions.map(opt => opt.value as string))}
            options={contextOptions}
            placeholder="コンテキストを選択"
          />
        </FormField>

        <FormField
          label="必要なエネルギーレベル"
          description="このタスクを実行するのに必要なエネルギーレベル"
        >
          <Select
            selectedOption={formData.energy ? { value: formData.energy, label: energyLevelLabels[formData.energy] } : null}
            onChange={e => handleChange('energy', e.detail.selectedOption?.value as EnergyLevel | undefined)}
            options={Object.entries(energyLevelLabels).map(([value, label]) => ({ value: value as EnergyLevel, label }))}
            placeholder="エネルギーレベルを選択"
            empty="選択肢がありません"
          />
        </FormField>

        <FormField
          label="所要時間の目安"
          description="このタスクを実行するのに必要な時間の目安"
        >
          <Select
            selectedOption={formData.time ? { value: formData.time, label: timeEstimateLabels[formData.time] } : null}
            onChange={e => handleChange('time', e.detail.selectedOption?.value as TimeEstimate | undefined)}
            options={Object.entries(timeEstimateLabels).map(([value, label]) => ({ value: value as TimeEstimate, label }))}
            placeholder="所要時間を選択"
            empty="選択肢がありません"
          />
        </FormField>

        <FormField
          label="カテゴリ"
          description="タスクのカテゴリ（例: 仕事、個人、家庭など）"
        >
          <Input
            value={formData.category || ''}
            onChange={e => handleChange('category', e.detail.value)}
            placeholder="例: 仕事"
          />
        </FormField>

        <FormField
          label="サブカテゴリ"
          description="カテゴリの中のサブカテゴリ（例: 仕事/会議、個人/趣味など）"
        >
          <Input
            value={formData.subcategory || ''}
            onChange={e => handleChange('subcategory', e.detail.value)}
            placeholder="例: 会議"
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
  'wait-on': '待機中',
  'someday-maybe': 'いつかやるリスト',
  'reference': '参照資料'
};

const priorityLabels: Record<Task['priority'], string> = {
  'low': '低',
  'medium': '中',
  'high': '高'
};

const energyLevelLabels: Record<EnergyLevel, string> = {
  'low': '低',
  'medium': '中',
  'high': '高'
};

const timeEstimateLabels: Record<TimeEstimate, string> = {
  'quick': '短時間（〜15分）',
  'medium': '中程度（〜1時間）',
  'long': '長時間（1時間〜）'
};

// コンテキストタグの選択肢
const contextOptions: MultiselectProps.Option[] = [
  { label: '自宅', value: '自宅' },
  { label: 'オフィス', value: 'オフィス' },
  { label: '外出先', value: '外出先' },
  { label: 'PC', value: 'PC' },
  { label: 'スマホ', value: 'スマホ' },
  { label: '電話', value: '電話' },
  { label: 'メール', value: 'メール' },
  { label: '会議', value: '会議' },
  { label: '買い物', value: '買い物' },
];

export default TaskForm;