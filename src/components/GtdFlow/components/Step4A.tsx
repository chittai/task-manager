import React from 'react';
import { FormField, RadioGroup, Alert } from '@cloudscape-design/components';
import { GtdFlowState, GtdFlowActions } from '../types/gtdFlowTypes';

interface Step4AProps {
  state: GtdFlowState;
  actions: GtdFlowActions;
}

/**
 * GTDフローのステップ4A: 2分タスクを完了しましたか？
 * 2分タスクの完了状態を確認するコンポーネント
 */
const Step4A: React.FC<Step4AProps> = ({ state, actions }) => {
  const { isTaskCompleted } = state;
  const { setIsTaskCompleted } = actions;
  
  return (
    <>
      <Alert type="info" header="2分ルールの適用">
        2分以内でできるタスクは、すぐに実行することをお勧めします。
        タスクを完了した場合は「はい」を選択すると、完了済みとして記録されます。
        まだ完了していない場合は「いいえ」を選択すると、次のステップに進みます。
      </Alert>
      
      <FormField
        label="2分タスクを完了しましたか？"
        description="このタスクをすでに完了したかどうかを選択してください"
        constraintText="必須"
      >
        <RadioGroup
          value={isTaskCompleted}
          onChange={({ detail }) => setIsTaskCompleted(detail.value as 'yes' | 'no' | '')}
          items={[
            { value: 'yes', label: 'はい、タスクを完了しました' },
            { value: 'no', label: 'いいえ、まだ完了していません' }
          ]}
        />
      </FormField>
      
      {isTaskCompleted === 'yes' && (
        <Alert type="success" header="タスク完了">
          「次へ」ボタンをクリックすると、このタスクは完了済みとして記録されます。
        </Alert>
      )}
    </>
  );
};

export default Step4A;
