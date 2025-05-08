import React, { useState } from 'react';
import {
  FormField,
  Textarea,
  Button,
  SpaceBetween,
  Form as CloudscapeForm,
  Tabs,
  Box,
  Container,
} from '@cloudscape-design/components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isLoading?: boolean;
  initialContent?: string;
  submitButtonText?: string;
  onCancel?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  isLoading,
  initialContent = '',
  submitButtonText = 'コメントを追加',
  onCancel,
}) => {
  const [content, setContent] = useState(initialContent);
  const [activeTabId, setActiveTabId] = useState<'write' | 'preview'>('write');

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      if (!initialContent) {
        setContent('');
      }
      setActiveTabId('write');
    }
  };

  const formActions = (
    <SpaceBetween direction="horizontal" size="xs">
      {onCancel && (
        <Button onClick={onCancel} disabled={isLoading}>
          キャンセル
        </Button>
      )}
      <Button
        variant="primary"
        onClick={() => handleSubmit()}
        loading={isLoading}
        disabled={!content.trim() || isLoading}
      >
        {submitButtonText}
      </Button>
    </SpaceBetween>
  );

  return (
    <CloudscapeForm actions={formActions}>
      <Tabs
        activeTabId={activeTabId}
        onChange={({ detail }) => setActiveTabId(detail.activeTabId as 'write' | 'preview')}
        tabs={[
          {
            label: 'Write',
            id: 'write',
            content: (
              <FormField>
                <Textarea
                  value={content}
                  onChange={({ detail }) => setContent(detail.value)}
                  placeholder="コメントを入力してください (Markdown対応)"
                  rows={5}
                />
              </FormField>
            ),
          },
          {
            label: 'Preview',
            id: 'preview',
            content: (
              <Container>
                <div style={{ minHeight: '100px' }}>
                  {content.trim() ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  ) : (
                    <Box color="text-status-inactive" padding={{ vertical: 'l' }}>
                      プレビューする内容がありません。
                    </Box>
                  )}
                </div>
              </Container>
            ),
          },
        ]}
      />
    </CloudscapeForm>
  );
};

export default CommentForm;
