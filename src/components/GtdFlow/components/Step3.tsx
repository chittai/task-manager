import React from 'react';
import { FormField, RadioGroup, Alert } from '@cloudscape-design/components';
import { GtdFlowState, GtdFlowActions } from '../types/gtdFlowTypes';

interface Step3Props {
  state: GtdFlowState;
  actions: GtdFlowActions;
}

/**
 * GTDフローのステップ3: 次のアクションは1つか複数か？
 * アイテムが単一のアクションか、複数のアクション（プロジェクト）かを選択するコンポーネント
 */
const Step3: React.FC<Step3Props> = ({ state, actions }) => {
  const { numActions } = state;
  const { setNumActions } = actions;
  
  return (
    <>
      <Alert type="info" header="プロジェクトとは">
        複数のアクションが必要なタスクは「プロジェクト」として扱います。
        プロジェクトは、複数の関連するタスクをまとめて管理するための仕組みです。
        プロジェクトを選択すると、プロジェクト詳細ページに移動し、そこで次のアクションを追加できます。
      </Alert>
      
      <FormField
        label="次のアクションは1つか複数か？"
        description="このアイテムを完了するために必要なアクションの数を選択してください"
        constraintText="必須"
      >
        <RadioGroup
          value={numActions}
          onChange={({ detail }) => setNumActions(detail.value as 'single' | 'multiple' | '')}
          items={[
            { value: 'single', label: '1つのアクション（単一タスク）' },
            { value: 'multiple', label: '複数のアクション（プロジェクト）' }
          ]}
        />
      </FormField>
      
      {numActions === 'multiple' && (
        <Alert type="warning" header="プロジェクトとして登録">
          「次へ」ボタンをクリックすると、このアイテムはプロジェクトとして登録され、
          プロジェクト詳細ページに移動します。そこで次のアクションを追加してください。
        </Alert>
      )}
    </>
  );
};

export default Step3;
