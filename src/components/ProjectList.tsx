import React, { useState } from 'react';
import {
  Table, 
  Box, 
  Button, 
  Header, 
  SpaceBetween, 
  Pagination, 
  CollectionPreferences, 
  Modal, 
} from '@cloudscape-design/components';
import { useProjects } from '../hooks/useProjects';
import { Project } from '../models/Project';
import ProjectModal from './ProjectModal'; 

interface ProjectListProps {
  // 必要に応じてpropsを追加
}

export const ProjectList: React.FC<ProjectListProps> = () => {
  const {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const [selectedItems, setSelectedItems] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | undefined>(undefined);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | undefined>(undefined);

  const handleOpenCreateModal = () => {
    setProjectToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProjectToEdit(undefined); 
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteProject = async () => {
    if (projectToDelete) {
      try {
        await deleteProject(projectToDelete.id);
      } catch (err) {
        console.error("Failed to delete project:", err);
        // エラー通知
      }
      setProjectToDelete(undefined);
      setShowDeleteConfirmModal(false);
    }
  };

  if (error) {
    return <Box color="text-status-error">Error loading projects: {error}</Box>;
  }

  return (
    <Box padding={{ vertical: 'm', horizontal: 'l' }}>
      <Table
        selectedItems={selectedItems}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        loading={loading}
        items={projects}
        columnDefinitions={[
          {
            id: 'name',
            header: 'Project Name',
            cell: (item: Project) => item.name,
            sortingField: 'name',
            isRowHeader: true,
          },
          {
            id: 'description',
            header: 'Description',
            cell: (item: Project) => item.description || '-',
            sortingField: 'description',
          },
          {
            id: 'createdAt',
            header: 'Created At',
            cell: (item: Project) => new Date(item.createdAt).toLocaleDateString(),
            sortingField: 'createdAt',
          },
          {
            id: 'updatedAt',
            header: 'Updated At',
            cell: (item: Project) => new Date(item.updatedAt).toLocaleDateString(),
            sortingField: 'updatedAt',
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: (item: Project) => (
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => handleOpenEditModal(item)}>Edit</Button>
                <Button variant="link" onClick={() => handleDeleteClick(item)}>Delete</Button>
              </SpaceBetween>
            ),
          },
        ]}
        stickyHeader
        header={
          <Header
            counter={projects.length ? `(${projects.length})` : ''}
            actions={
              <Button variant="primary" onClick={handleOpenCreateModal}>
                Create New Project
              </Button>
            }
          >
            Projects
          </Header>
        }
        empty={
          <Box textAlign="center" color="inherit">
            <b>No projects</b>
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              No projects to display.
            </Box>
            <Button onClick={handleOpenCreateModal}>Create project</Button>
          </Box>
        }
        // TODO: Pagination, CollectionPreferences などの設定を追加
      />

      {isModalOpen && (
        <ProjectModal
          visible={isModalOpen}
          onDismiss={handleCloseModal}
          onAddProject={async (formData) => {
            try {
              await createProject(formData);
              handleCloseModal();
              return null; // ProjectModalProps の戻り値型に合わせる
            } catch (err) {
              console.error("Failed to create project:", err);
              throw err; // エラーを再スローするか、エラーに応じた値を返す
            }
          }}
          onUpdateProject={async (id, formData) => {
            try {
              await updateProject(id, formData);
              handleCloseModal();
              return null; // ProjectModalProps の戻り値型に合わせる
            } catch (err) {
              console.error("Failed to update project:", err);
              throw err; // エラーを再スローするか、エラーに応じた値を返す
            }
          }}
          project={projectToEdit} // projectToEdit を project プロパティに渡す
        />
      )}

      {showDeleteConfirmModal && projectToDelete && (
        <Modal
          visible={showDeleteConfirmModal}
          onDismiss={() => setShowDeleteConfirmModal(false)}
          header={`Delete Project: ${projectToDelete.name}`}
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setShowDeleteConfirmModal(false)}>Cancel</Button>
                <Button variant="primary" onClick={confirmDeleteProject}>Delete</Button>
              </SpaceBetween>
            </Box>
          }
        >
          Are you sure you want to delete the project "{projectToDelete.name}"? This action cannot be undone.
        </Modal>
      )}
    </Box>
  );
};
