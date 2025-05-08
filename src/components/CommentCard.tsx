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
  // コメントの所有者かどうかを isOwnComment フラグで判定する
  const isOwner = comment.isOwnComment === true;

  return (
    <Container
      header={
        <Header
          variant="h3" // 見出しレベルは適宜調整
          actions={
            isOwner && ( 
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
