import React from 'react';
import { Box, TextContent, SpaceBetween, Button, Icon, Container, Header } from '@cloudscape-design/components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Comment } from '../models/Comment';

interface CommentCardProps {
  comment: Comment;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // TODO: ユーザー認証が実装されたら、実際のユーザー名やアバターを表示する
  const authorDisplay = comment.userId || 'Unknown User'; 
  // TODO: コメントの所有者かどうかを判定するロジック (例: comment.userId === loggedInUserId)
  const isOwner = true; // 仮に常に所有者とする (Issue #14 のスコープ)

  return (
    <Container
      header={
        <Header
          variant="h3" // 見出しレベルは適宜調整
          actions={
            isOwner && ( // TODO: isOwner の判定を正しく実装する
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="icon" onClick={() => onEdit(comment)} ariaLabel="コメントを編集">
                  <Icon name="edit" />
                </Button>
                <Button variant="icon" onClick={() => onDelete(comment.id)} ariaLabel="コメントを削除">
                  <Icon name="remove" />
                </Button>
              </SpaceBetween>
            )
          }
        >
          <Box color="text-body-secondary" fontSize="body-s">
            {authorDisplay} - {formatDate(comment.createdAt)}
            { 
              comment.updatedAt && comment.createdAt !== comment.updatedAt && (
              <span style={{ fontStyle: 'italic', marginLeft: '8px' }}>
                (編集済み: {formatDate(comment.updatedAt)})
              </span>
            )
            }
          </Box>
        </Header>
      }
    >
      <TextContent>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.content}</ReactMarkdown>
      </TextContent>
    </Container>
  );
};

export default CommentCard;
