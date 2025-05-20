import React from 'react';
import { Alert, Spinner } from '@cloudscape-design/components';
import { GtdFlowState } from '../types/gtdFlowTypes';

interface CompletionMessageProps {
  state: GtdFlowState;
}

/**
 * GTDフローの完了メッセージを表示するコンポーネント
 */
const CompletionMessage: React.FC<CompletionMessageProps> = ({ state }) => {
  const { isProcessing, completionMessage, completionStatus, autoCloseCountdown } = state;
  
  if (isProcessing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Spinner size="large" />
        <div style={{ marginLeft: '10px' }}>処理中...</div>
      </div>
    );
  }
  
  if (!completionMessage) {
    return null;
  }
  
  return (
    <Alert type={completionStatus || undefined} header={completionStatus === 'success' ? '成功' : '注意'}>
      {completionMessage}
      {autoCloseCountdown !== null && completionStatus === 'success' && (
        <div style={{ marginTop: '10px', fontSize: '0.9em', fontStyle: 'italic' }}>
          このモーダルは {autoCloseCountdown} 秒後に自動的に閉じます
        </div>
      )}
    </Alert>
  );
};

export default CompletionMessage;
