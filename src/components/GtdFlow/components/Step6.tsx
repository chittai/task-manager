import React from 'react';
import { FormField, RadioGroup, DateInput, Alert } from '@cloudscape-design/components';
import { GtdFlowState, GtdFlowActions } from '../types/gtdFlowTypes';

interface Step6Props {
  state: GtdFlowState;
  actions: GtdFlowActions;
}

/**
 * GTDフローのステップ6: 特定の日時が決まっているか？
 * タスクのスケジュール設定を行うコンポーネント
 */
const Step6: React.FC<Step6Props> = ({ state, actions }) => {
  const { hasSpecificDate, dueDate } = state;
  const { setHasSpecificDate, setDueDate } = actions;
  
  return (
    <>
      <Alert type="info" header="タスクのスケジュール">
        特定の日時が決まっているタスクはカレンダーに登録し、
        日時が決まっていないタスクはタスクリストに追加します。
      </Alert>
      
      <FormField
        label="特定の日時が決まっているか？"
        description="このタスクに特定の期限や実行日時が決まっているかどうかを選択してください"
        constraintText="必須"
      >
        <RadioGroup
          value={hasSpecificDate}
          onChange={({ detail }) => setHasSpecificDate(detail.value as 'yes' | 'no' | '')}
          items={[
            { value: 'yes', label: 'はい、特定の日時が決まっています' },
            { value: 'no', label: 'いいえ、特定の日時は決まっていません' }
          ]}
        />
      </FormField>
      
      {hasSpecificDate === 'yes' && (
        <FormField
          label="日時"
          description="タスクの期限や実行日時を選択してください"
          constraintText="必須"
        >
          <DateInput
            value={dueDate}
            onChange={({ detail }) => setDueDate(detail.value)}
            placeholder="YYYY/MM/DD"
          />
        </FormField>
      )}
      
      {hasSpecificDate === 'yes' && dueDate && (
        <Alert type="success" header="カレンダーに登録">
          「次へ」ボタンをクリックすると、このタスクはカレンダーに登録されます。
        </Alert>
      )}
      
      {hasSpecificDate === 'no' && (
        <Alert type="success" header="タスクリストに追加">
          「次へ」ボタンをクリックすると、このタスクはタスクリストに追加されます。
        </Alert>
      )}
    </>
  );
};

export default Step6;
