import React, { useState, useEffect } from 'react';
import { Modal } from '@cloudscape-design/components';
import { Project, ProjectFormData } from '../models/Project';
import ProjectForm from './ProjectForm';

interface ProjectModalProps {
  visible: boolean;
  onDismiss: () => void;
  onAddProject?: (formData: ProjectFormData) => Promise<Project | null>;
  onUpdateProject?: (id: string, formData: ProjectFormData) => Promise<Project | null>;
  project?: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  visible,
  onDismiss,
  project: existingProject,
  onAddProject,
  onUpdateProject,
}) => {
  const [currentProject, setCurrentProject] = useState<Project | null | undefined>(existingProject);

  useEffect(() => {
    setCurrentProject(existingProject);
  }, [existingProject, visible]);

  const handleProjectFormSubmit = async (formData: ProjectFormData) => {
    let updatedOrNewProject: Project | null = null;
    if (existingProject && onUpdateProject) {
      updatedOrNewProject = await onUpdateProject(existingProject.id, formData);
    } else if (onAddProject) {
      updatedOrNewProject = await onAddProject(formData);
    }
    if (updatedOrNewProject) {
      setCurrentProject(updatedOrNewProject);
    }
    onDismiss();
  };

  const modalTitle = existingProject ? 'プロジェクトを編集' : '新しいプロジェクト';

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      header={modalTitle}
      closeAriaLabel="Close modal"
      size="medium"
    >
      <ProjectForm
        initialProject={currentProject}
        onSubmit={handleProjectFormSubmit}
        onCancel={onDismiss}
      />
    </Modal>
  );
};

export default ProjectModal;
