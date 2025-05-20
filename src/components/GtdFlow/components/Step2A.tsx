import React from 'react';
import { FormField, RadioGroup, Alert } from '@cloudscape-design/components';
import { GtdFlowState, GtdFlowActions } from '../types/gtdFlowTypes';

interface Step2AProps {
  state: GtdFlowState;
  actions: GtdFlowActions;
}

/**
 * GTDフローのステップ2A: 行動不要な場合、どうしますか？
 * 行動が不要なアイテムの処理方法を選択するコンポーネント
 */
const Step2A: React.FC<Step2AProps> = ({ state, actions }) => {
  const { nonActionableOutcome } = state;
  const { setNonActionableOutcome } = actions;
  
  return (
    <>
      <Alert type="info" header="行動不要なアイテムの処理">
        行動を起こす必要がないアイテムは、以下の3つの方法で処理できます。
        <ul>
          <li><strong>ゴミ箱</strong>: 不要なアイテムを捨てます。</li>
          <li><strong>いつかやる/多分やる</strong>: 今すぐではないが、将来的に検討したいアイテムを保存します。</li>
          <li><strong>参考資料</strong>: 将来参照するために保存しておきたい情報を整理します。</li>
        </ul>
      </Alert>
      
      <FormField
        label="行動不要な場合、どうしますか？"
        description="このアイテムをどのように処理するかを選択してください"
        constraintText="必須"
      >
        <RadioGroup
          value={nonActionableOutcome}
          onChange={({ detail }) => setNonActionableOutcome(detail.value as 'trash' | 'someday' | 'reference' | '')}
          items={[
            { value: 'trash', label: 'ゴミ箱に捨てる' },
            { value: 'someday', label: 'いつかやる/多分やるリストに保存する' },
            { value: 'reference', label: '参考資料として保存する' }
          ]}
        />
      </FormField>
    </>
  );
};

export default Step2A;
