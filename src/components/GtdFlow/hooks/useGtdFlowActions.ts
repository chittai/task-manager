import { useNavigate } from 'react-router-dom';
import { GtdFlowState, GtdFlowActions, GtdFlowStep } from '../types/gtdFlowTypes';
import { useTasks } from '../../../hooks/useTasks';
import { 
  handleStep2ANext, 
  handleStep3Next, 
  handleStep4Next, 
  handleStep4ANext, 
  handleStep5Next, 
  handleStep6Next 
} from '../utils/gtdFlowHelpers';

/**
 * GTDフローのアクション実行ロジックを提供するカスタムフック
 * @param state GTDフローの状態
 * @param actions GTDフローのアクション
 * @returns ステップごとの処理関数
 */
export const useGtdFlowActions = (
  state: GtdFlowState,
  actions: GtdFlowActions,
  externalTaskActions?: ReturnType<typeof useTasks>
) => {
  const navigate = useNavigate();
  // 外部からtaskActionsが渡された場合はそれを使用し、そうでない場合は内部で生成
  const internalTaskActions = useTasks();
  const taskActions = externalTaskActions || internalTaskActions;
  
  /**
   * ステップ1の「次へ」ボタン処理
   */
  const handleStep1Next = () => {
    const { itemName } = state;
    
    // DOM値も確認して同期
    const domInput = document.querySelector('input[placeholder*="例: 会議の準備"]') as HTMLInputElement;
    const actualValue = domInput?.value || itemName;
    
    if (!actualValue.trim()) {
      // DOM値で再試行
      if (domInput?.value && !itemName.trim()) {
        actions.setItemName(domInput.value);
        setTimeout(() => handleStep1Next(), 100);
        return;
      }
      // エラー表示
      actions.setCompletionMessage('アイテム名を入力してください。');
      actions.setCompletionStatus('error');
      return;
    }
    
    // 既存のロジック...
    const nextStep: GtdFlowStep = 'STEP2';
    actions.setCurrentStep(nextStep);
  };
  
  /**
   * ステップ2の「次へ」ボタン処理
   */
  const handleStep2Next = () => {
    const { isActionable } = state;
    const { setCurrentStep, setCompletionMessage, setCompletionStatus } = actions;
    
    if (isActionable === null || isActionable === undefined) {
      setCompletionMessage('「行動を起こす必要があるか？」を選択してください。');
      setCompletionStatus('error');
      return;
    }
    
    // 選択に応じて分岐
    if (isActionable === 'yes') {
      // 「はい」なら次のステップへ
      setCurrentStep('STEP3');
    } else {
      // 「いいえ」ならステップ2A（行動不要な場合の処理）へ
      setCurrentStep('STEP2A');
    }
  };
  
  return {
    handleStep1Next,
    handleStep2Next,
    handleStep2ANext: () => handleStep2ANext(state, actions, taskActions),
    handleStep3Next: () => handleStep3Next(state, actions, taskActions),
    handleStep4Next: () => handleStep4Next(state, actions),
    handleStep4ANext: () => handleStep4ANext(state, actions, taskActions),
    handleStep5Next: () => handleStep5Next(state, actions, taskActions),
    handleStep6Next: () => handleStep6Next(state, actions, taskActions)
  };
};
