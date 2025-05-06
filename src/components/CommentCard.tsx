import React from 'react';
import { Box, TextContent } from '@cloudscape-design/components';
import { Comment } from '../models/Comment';

interface CommentCardProps {
  comment: Comment;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
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

  return (
    <Box margin={{ bottom: 's' }} padding="s" variant="div">
      <Box variant="small" color="text-status-info">
        {comment.userId || 'Unknown User'} - {formatDate(comment.createdAt)}
      </Box>
      <TextContent>
        <p>{comment.content}</p>
      </TextContent>
    </Box>
  );
};

export default CommentCard;
