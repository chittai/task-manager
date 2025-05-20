import React from 'react';
import { FormField, RadioGroup } from '@cloudscape-design/components';
import { GtdFlowState, GtdFlowActions } from '../types/gtdFlowTypes';

interface Step2Props {
  state: GtdFlowState;
  actions: GtdFlowActions;
}

/**
 * GTDフローのステップ2: 行動を起こす必要があるか？
 * アイテムが行動を起こす必要があるかどうかを選択するコンポーネント
 */
const Step2: React.FC<Step2Props> = ({ state, actions }) => {
  const { isActionable } = state;
  const { setIsActionable } = actions;
  
  return (
    <FormField
      label="行動を起こす必要があるか？"
      description="このアイテムに対して何らかの行動を起こす必要があるかどうかを選択してください"
      constraintText="必須"
    >
      <RadioGroup
        value={isActionable}
        onChange={({ detail }) => setIsActionable(detail.value as 'yes' | 'no' | '')}
        items={[
          { value: 'yes', label: 'はい、行動を起こす必要があります' },
          { value: 'no', label: 'いいえ、行動を起こす必要はありません' }
        ]}
      />
    </FormField>
  );
};

export default Step2;
