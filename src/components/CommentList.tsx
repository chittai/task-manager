import React from 'react';
import { Box, SpaceBetween } from '@cloudscape-design/components';
import { Comment } from '../models/Comment';
import CommentCard from './CommentCard';

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return <Box color="text-status-inactive">コメントはまだありません。</Box>;
  }

  // Sort comments by createdAt, newest first
  const sortedComments = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <SpaceBetween size="m">
      {sortedComments.map(comment => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
    </SpaceBetween>
  );
};

export default CommentList;
