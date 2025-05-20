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
    console.log('handleStep1Next called');
    console.log('state in handleStep1Next:', state);
    console.log('actions in handleStep1Next:', Object.keys(actions));
    console.log('taskActions in handleStep1Next:', Object.keys(taskActions));
    
    const { itemName, currentTask } = state;
    const { setIsProcessing, setCurrentStep, setCompletionMessage, setCompletionStatus } = actions;
    
    console.log('itemName:', itemName);
    console.log('currentTask:', currentTask);
    console.log('setCurrentStep type:', typeof setCurrentStep);
    
    if (!itemName.trim()) {
      console.log('itemName is empty');
      setCompletionMessage('アイテム名を入力してください。');
      setCompletionStatus('error');
      return;
    }
    
    console.log('itemName is valid, proceeding...');
    console.log('About to call setCurrentStep with value 2');
    
    // ステップを文字列リテラルで指定
    const nextStep: GtdFlowStep = 'STEP2';
    
    // タスクが存在しない場合は新規作成、存在する場合は更新
    if (currentTask) {
      // 既存タスクのタイトルと説明を更新
      setIsProcessing(true);
      taskActions.updateTask(currentTask.id, {
        title: itemName,
        description: state.itemDescription,
      }).then(() => {
        setIsProcessing(false);
        // 入力が有効なら次のステップへ
        console.log('Setting currentStep to nextStep:', nextStep);
        setCurrentStep(nextStep);
      }).catch(err => {
        console.error('タスク更新エラー:', err);
        setCompletionMessage('タスクの更新中にエラーが発生しました。');
        setCompletionStatus('error');
        setIsProcessing(false);
      });
    } else {
      // 入力が有効なら次のステップへ
      console.log('No current task, directly setting currentStep to nextStep:', nextStep);
      // 次のステップを設定
      setCurrentStep(nextStep);
      console.log('CurrentStep set to nextStep');
    }
  };
  
  /**
   * ステップ2の「次へ」ボタン処理
   */
  const handleStep2Next = () => {
    const { isActionable } = state;
    const { setCurrentStep, setCompletionMessage, setCompletionStatus } = actions;
    
    if (!isActionable) {
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
