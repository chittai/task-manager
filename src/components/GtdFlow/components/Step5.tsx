import React from 'react';
import { FormField, RadioGroup, Input, Alert } from '@cloudscape-design/components';
import { GtdFlowState, GtdFlowActions } from '../types/gtdFlowTypes';

interface Step5Props {
  state: GtdFlowState;
  actions: GtdFlowActions;
}

/**
 * GTDフローのステップ5: 自分でやるべきか、誰かに任せるか？
 * タスクの委任を選択するコンポーネント
 */
const Step5: React.FC<Step5Props> = ({ state, actions }) => {
  const { delegationChoice, delegateTo } = state;
  const { setDelegationChoice, setDelegateTo } = actions;
  
  return (
    <>
      <Alert type="info" header="委任について">
        自分でやる必要がないタスクは、適切な人に委任することで効率的に処理できます。
        委任する場合は、委任先の人や組織の名前を入力してください。
      </Alert>
      
      <FormField
        label="自分でやるべきか、誰かに任せるか？"
        description="このタスクを自分で行うか、他の人に委任するかを選択してください"
        constraintText="必須"
      >
        <RadioGroup
          value={delegationChoice}
          onChange={({ detail }) => setDelegationChoice(detail.value as 'do_it' | 'delegate_it' | '')}
          items={[
            { value: 'do_it', label: '自分でやる' },
            { value: 'delegate_it', label: '誰かに任せる' }
          ]}
        />
      </FormField>
      
      {delegationChoice === 'delegate_it' && (
        <FormField
          label="委任先"
          description="タスクを委任する人や組織の名前を入力してください"
          constraintText="必須"
        >
          <Input
            value={delegateTo}
            onChange={({ detail }) => setDelegateTo(detail.value)}
            placeholder="例: 山田さん、営業部、外部業者など"
          />
        </FormField>
      )}
      
      {delegationChoice === 'delegate_it' && delegateTo && (
        <Alert type="warning" header="タスクの委任">
          「次へ」ボタンをクリックすると、このタスクは「{delegateTo}」に委任されたとして記録されます。
          必要に応じて、実際に委任先に連絡することを忘れないでください。
        </Alert>
      )}
    </>
  );
};

export default Step5;
