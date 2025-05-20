import React from 'react';
import { FormField, Input, Textarea } from '@cloudscape-design/components';
import { GtdFlowState, GtdFlowActions } from '../types/gtdFlowTypes';

interface Step1Props {
  state: GtdFlowState;
  actions: GtdFlowActions;
}

/**
 * GTDフローのステップ1: それは何か？
 * アイテムの名前と説明を入力するコンポーネント
 */
const Step1: React.FC<Step1Props> = ({ state, actions }) => {
  const { itemName, itemDescription } = state;
  const { setItemName, setItemDescription } = actions;
  
  return (
    <>
      <FormField
        label="アイテム名"
        description="処理するアイテムの名前を入力してください"
        constraintText="必須"
      >
        <Input
          value={itemName}
          onChange={({ detail }) => setItemName(detail.value)}
          placeholder="例: 会議の準備"
        />
      </FormField>
      
      <FormField
        label="説明"
        description="アイテムの詳細な説明を入力してください（任意）"
      >
        <Textarea
          value={itemDescription}
          onChange={({ detail }) => setItemDescription(detail.value)}
          placeholder="例: 会議資料の作成、参加者への連絡など"
        />
      </FormField>
    </>
  );
};

export default Step1;
