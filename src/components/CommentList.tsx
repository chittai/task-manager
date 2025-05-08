import React, { useState } from 'react';
import { Box, SpaceBetween, Modal, Button } from '@cloudscape-design/components';
import { Comment } from '../models/Comment';
import CommentCard from './CommentCard';
import CommentForm from './CommentForm';
import { useTasks } from '../hooks/useTasks';

interface CommentListProps {
  comments: Comment[];
  taskId: string;
}

const CommentList: React.FC<CommentListProps> = ({ comments, taskId }) => {
  const { updateTaskComment, deleteTaskComment } = useTasks();
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  if (!comments || comments.length === 0) {
    return <Box color="text-status-inactive">コメントはまだありません。</Box>;
  }

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  const handleUpdateComment = async (updatedContent: string) => {
    if (editingComment) {
      try {
        await updateTaskComment(taskId, editingComment.id, updatedContent);
        setEditingComment(null);
      } catch (error) {
        console.error('Failed to update comment:', error);
      }
    }
  };

  const handleDelete = (commentId: string) => {
    setShowDeleteConfirm(commentId);
  };

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      try {
        await deleteTaskComment(taskId, showDeleteConfirm);
        setShowDeleteConfirm(null);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  const sortedComments = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <SpaceBetween size="m">
      {sortedComments.map(comment =>
        editingComment && editingComment.id === comment.id ? (
          <CommentForm
            key={`edit-${comment.id}`}
            initialContent={editingComment.content}
            onSubmit={handleUpdateComment}
            onCancel={handleCancelEdit}
            submitButtonText="コメントを更新"
            isLoading={false}
          />
        ) : (
          <CommentCard
            key={comment.id}
            comment={comment}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )
      )}
      {showDeleteConfirm && (
        <Modal
          onDismiss={() => setShowDeleteConfirm(null)}
          visible={true}
          closeAriaLabel="閉じる"
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={() => setShowDeleteConfirm(null)}>キャンセル</Button>
                <Button variant="primary" onClick={confirmDelete}>削除</Button>
              </SpaceBetween>
            </Box>
          }
          header="コメントの削除"
        >
          このコメントを本当に削除しますか？この操作は元に戻せません。
        </Modal>
      )}
    </SpaceBetween>
  );
};

export default CommentList;
