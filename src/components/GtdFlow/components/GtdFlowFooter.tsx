import React from 'react';
import { Button, SpaceBetween } from '@cloudscape-design/components';
import { GtdFlowState, GtdFlowNavigation } from '../types/gtdFlowTypes';

interface GtdFlowFooterProps {
  state: GtdFlowState;
  navigation: GtdFlowNavigation;
}

/**
 * GTDフローのフッターコンポーネント
 * 「戻る」と「次へ」ボタンを表示する
 */
const GtdFlowFooter: React.FC<GtdFlowFooterProps> = ({ state, navigation }) => {
  const { completionMessage, completionStatus, isTerminal } = state;
  const { handleNextStep, handlePreviousStep, handleModalClose, isNextButtonDisabled, nextButtonText } = navigation;
  
  if (completionMessage && completionStatus === 'success' && isTerminal) {
    // 成功メッセージが表示されていて終了状態の場合は「閉じる」ボタンのみ表示
    return (
      <SpaceBetween direction="horizontal" size="xs">
        <Button 
          variant="primary" 
          onClick={handleModalClose}
        >
          閉じる
        </Button>
      </SpaceBetween>
    );
  }
  
  // 通常のフローでは「戻る」と「次へ」ボタンを表示
  return (
    <SpaceBetween direction="horizontal" size="xs">
      <Button 
        variant="link" 
        onClick={handlePreviousStep} 
        disabled={state.currentStep === 'STEP1' || isTerminal}
      >
        戻る
      </Button>
      <Button 
        variant="primary" 
        onClick={() => {
          console.log('Next button clicked');
          console.log('isNextButtonDisabled:', isNextButtonDisabled());
          console.log('isTerminal:', isTerminal);
          console.log('currentStep:', state.currentStep);
          console.log('handleNextStep type:', typeof handleNextStep);
          console.log('navigation object:', Object.keys(navigation));
          // デバッグ用に関数の中身を確認
          console.log('handleNextStep function:', handleNextStep.toString().substring(0, 150));
          // ボタンクリック時にアクションを実行
          handleNextStep();
        }}
        disabled={isNextButtonDisabled() || isTerminal}
      >
        {nextButtonText()}
      </Button>
    </SpaceBetween>
  );
};

export default GtdFlowFooter;
