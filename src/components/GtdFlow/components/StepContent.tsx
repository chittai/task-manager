import React from 'react';
import { GtdFlowState, GtdFlowActions } from '../types/gtdFlowTypes';
import Step1 from './Step1';
import Step2 from './Step2';
import Step2A from './Step2A';
import Step3 from './Step3';
import Step4 from './Step4';
import Step4A from './Step4A';
import Step5 from './Step5';
import Step6 from './Step6';

interface StepContentProps {
  state: GtdFlowState;
  actions: GtdFlowActions;
}

/**
 * 現在のステップに応じたコンテンツをレンダリングするコンポーネント
 */
const StepContent: React.FC<StepContentProps> = ({ state, actions }) => {
  const { currentStep, completionMessage } = state;
  
  // 完了メッセージが表示されている場合はステップコンテンツを表示しない
  if (completionMessage) {
    return <div style={{minHeight: '100px'}}></div>;
  }
  
  // 現在のステップに応じたコンポーネントをレンダリング
  switch (currentStep) {
    case 'STEP1':
      return <Step1 state={state} actions={actions} />;
    case 'STEP2':
      return <Step2 state={state} actions={actions} />;
    case 'STEP2A':
      return <Step2A state={state} actions={actions} />;
    case 'STEP3':
      return <Step3 state={state} actions={actions} />;
    case 'STEP4':
      return <Step4 state={state} actions={actions} />;
    case 'STEP4A':
      return <Step4A state={state} actions={actions} />;
    case 'STEP5':
      return <Step5 state={state} actions={actions} />;
    case 'STEP6':
      return <Step6 state={state} actions={actions} />;
    default:
      return null;
  }
};

export default StepContent;
