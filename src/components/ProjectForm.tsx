import React, { useState, useEffect } from 'react';
import {
  Form,
  FormField,
  Input,
  Textarea,
  Button,
  SpaceBetween,
} from '@cloudscape-design/components';
import { Project, ProjectFormData } from '../models/Project';

interface ProjectFormProps {
  onSubmit: (projectData: ProjectFormData) => void;
  onCancel: () => void;
  initialProject?: Project | null; 
  submitButtonText?: string;      
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  onSubmit,
  onCancel,
  initialProject,
  submitButtonText,
}) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProject) {
      setName(initialProject.name);
      setDescription(initialProject.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setNameError(null); 
  }, [initialProject]);

  const handleFormSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    if (!name.trim()) {
      setNameError('プロジェクト名は必須です。'); 
      return;
    }
    setNameError(null);
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  const buttonText = submitButtonText || (initialProject ? '保存' : '作成'); 
  const formHeader = initialProject ? 'プロジェクトを編集' : '新しいプロジェクト'; 

  return (
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button variant="link" onClick={onCancel}>
            キャンセル 
          </Button>
          <Button variant="primary" onClick={() => handleFormSubmit()}>
            {buttonText}
          </Button>
        </SpaceBetween>
      }
      header={<h2>{formHeader}</h2>} 
    >
      <SpaceBetween direction="vertical" size="l">
        <FormField
          label="プロジェクト名" 
          errorText={nameError}
        >
          <Input
            value={name}
            onChange={({ detail }) => {
              setName(detail.value);
              if (nameError && detail.value.trim()) {
                setNameError(null);
              }
            }}
            placeholder="プロジェクト名を入力" 
          />
        </FormField>
        <FormField
          label="説明 (任意)" 
        >
          <Textarea
            value={description}
            onChange={({ detail }) => setDescription(detail.value)}
            placeholder="プロジェクトの説明を入力" 
            rows={4} 
          />
        </FormField>
      </SpaceBetween>
    </Form>
  );
};

export default ProjectForm;
