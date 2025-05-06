import React, { useState } from 'react';
import {
  FormField,
  Textarea,
  Button,
  SpaceBetween,
  Form as CloudscapeForm
} from '@cloudscape-design/components';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isLoading?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, isLoading }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CloudscapeForm
        actions={(
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              variant="primary"
              loading={isLoading}
              disabled={!content.trim() || isLoading}
            >
              コメントを追加
            </Button>
          </SpaceBetween>
        )}
      >
        <FormField label="新しいコメント">
          <Textarea
            value={content}
            onChange={({ detail }) => setContent(detail.value)}
            placeholder="コメントを入力してください"
            rows={3}
          />
        </FormField>
      </CloudscapeForm>
    </form>
  );
};

export default CommentForm;
