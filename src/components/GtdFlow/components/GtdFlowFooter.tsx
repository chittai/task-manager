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
          
          // ボタンクリック時にアクションを実行
          // クリック時の状態を保存
          const currentStepAtClick = state.currentStep;
          console.log('Current step at click time:', currentStepAtClick);
          
          // ハンドラーを実行
          handleNextStep();
          
          // ステップ遷移の確認用タイマー
          setTimeout(() => {
            console.log('After handleNextStep, currentStep changed from', currentStepAtClick, 'to', state.currentStep);
          }, 100);
        }}
        disabled={isNextButtonDisabled() || isTerminal}
      >
        {nextButtonText()}
      </Button>
    </SpaceBetween>
  );
};

export default GtdFlowFooter;
