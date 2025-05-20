import React from 'react';
import { FormField, RadioGroup, Alert } from '@cloudscape-design/components';
import { GtdFlowState, GtdFlowActions } from '../types/gtdFlowTypes';

interface Step4Props {
  state: GtdFlowState;
  actions: GtdFlowActions;
}

/**
 * GTDフローのステップ4: そのアクションは2分以内でできますか？
 * 2分ルールを適用するかどうかを選択するコンポーネント
 */
const Step4: React.FC<Step4Props> = ({ state, actions }) => {
  const { isTwoMinuteTask } = state;
  const { setIsTwoMinuteTask } = actions;
  
  return (
    <>
      <Alert type="info" header="2分ルールとは">
        GTDの「2分ルール」とは、タスクが2分以内で完了できる場合は、すぐに実行するというルールです。
        これにより、小さなタスクが溜まってしまうことを防ぎ、処理効率を高めることができます。
      </Alert>
      
      <FormField
        label="そのアクションは2分以内でできますか？"
        description="このアクションが2分以内で完了できるかどうかを選択してください"
        constraintText="必須"
      >
        <RadioGroup
          value={isTwoMinuteTask}
          onChange={({ detail }) => setIsTwoMinuteTask(detail.value as 'yes' | 'no' | '')}
          items={[
            { value: 'yes', label: 'はい、2分以内でできます' },
            { value: 'no', label: 'いいえ、2分以上かかります' }
          ]}
        />
      </FormField>
      
      {isTwoMinuteTask === 'yes' && (
        <Alert type="success" header="2分ルールを適用">
          2分以内でできるタスクは、すぐに実行することをお勧めします。
          次のステップでは、このタスクを完了したかどうかを確認します。
        </Alert>
      )}
    </>
  );
};

export default Step4;
