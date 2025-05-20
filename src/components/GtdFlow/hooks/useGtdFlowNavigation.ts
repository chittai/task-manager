import { useNavigate } from 'react-router-dom';
import { GtdFlowState, GtdFlowActions, GtdFlowNavigation } from '../types/gtdFlowTypes';
import { useGtdFlowActions } from './useGtdFlowActions';

/**
 * GTDフローのナビゲーション機能を提供するカスタムフック
 * @param state GTDフローの状態
 * @param actions GTDフローのアクション
 * @param onClose モーダルを閉じる関数
 * @returns GTDフローのナビゲーション関数
 */
export const useGtdFlowNavigation = (
  state: GtdFlowState,
  actions: GtdFlowActions,
  onClose: () => void,
  stepActions?: ReturnType<typeof useGtdFlowActions>
): GtdFlowNavigation => {
  const navigate = useNavigate();
  
  // ステップごとのアクション実行ロジックを取得
  // 外部から渡されない場合は内部で生成
  const internalStepActions = useGtdFlowActions(state, actions);
  const actualStepActions = stepActions || internalStepActions;
  
  /**
   * モーダルのタイトルを取得する関数
   * @returns モーダルのタイトル
   */
  const getModalTitle = (): string => {
    const { currentStep } = state;
    
    switch (currentStep) {
      case 'STEP1':
        return 'GTDフロー: それは何か？';
      case 'STEP2':
        return 'GTDフロー: 行動を起こす必要があるか？';
      case 'STEP2A':
        return 'GTDフロー: 行動不要な場合、どうしますか？';
      case 'STEP3':
        return 'GTDフロー: 次のアクションは1つか複数か？';
      case 'STEP4':
        return 'GTDフロー: そのアクションは2分以内でできますか？';
      case 'STEP4A':
        return 'GTDフロー: 2分タスクを完了しましたか？';
      case 'STEP5':
        return 'GTDフロー: 自分でやるべきか、誰かに任せるか？';
      case 'STEP6':
        return 'GTDフロー: 特定の日時が決まっているか？';
      default:
        return 'GTDフロー';
    }
  };
  
  /**
   * 「次へ」ボタンが無効かどうかを判定する関数
   * @returns 「次へ」ボタンが無効な場合はtrue
   */
  const isNextButtonDisabled = (): boolean => {
    const { 
      currentStep, 
      itemName, 
      isActionable, 
      nonActionableOutcome,
      numActions,
      isTwoMinuteTask,
      isTaskCompleted,
      delegationChoice,
      delegateTo,
      hasSpecificDate,
      dueDate,
      isProcessing
    } = state;
    
    // 処理中は無効
    if (isProcessing) {
      return true;
    }
    
    // ステップごとの入力チェック
    switch (currentStep) {
      case 'STEP1':
        return !itemName.trim(); // アイテム名が空の場合は無効
      case 'STEP2':
        return !isActionable; // 「行動を起こす必要があるか？」が選択されていない場合は無効
      case 'STEP2A':
        return !nonActionableOutcome; // 「行動不要な場合、どうしますか？」が選択されていない場合は無効
      case 'STEP3':
        return !numActions; // 「次のアクションは1つか複数か？」が選択されていない場合は無効
      case 'STEP4':
        return !isTwoMinuteTask; // 「そのアクションは2分以内でできますか？」が選択されていない場合は無効
      case 'STEP4A':
        return !isTaskCompleted; // 「2分タスクを完了しましたか？」が選択されていない場合は無効
      case 'STEP5':
        return !delegationChoice || (delegationChoice === 'delegate_it' && !delegateTo.trim()); // 「自分でやるべきか、誰かに任せるか？」が選択されていない場合、または「任せる」が選択されているのに委任先が入力されていない場合は無効
      case 'STEP6':
        return !hasSpecificDate || (hasSpecificDate === 'yes' && !dueDate); // 「特定の日時が決まっているか？」が選択されていない場合、または「はい」が選択されているのに日時が入力されていない場合は無効
      default:
        return false;
    }
  };
  
  /**
   * 「次へ」ボタンのテキストを取得する関数
   * @returns 「次へ」ボタンのテキスト
   */
  const nextButtonText = (): string => {
    const { currentStep, isActionable, nonActionableOutcome, numActions, isTwoMinuteTask, isTaskCompleted, delegationChoice } = state;
    
    // ステップごとのボタンテキスト
    switch (currentStep) {
      case 'STEP2':
        return isActionable === 'no' ? '行動不要な処理へ' : '次へ';
      case 'STEP2A':
        switch (nonActionableOutcome) {
          case 'trash':
            return 'ゴミ箱へ移動';
          case 'someday':
            return 'いつかやるリストへ移動';
          case 'reference':
            return '参考資料として保存';
          default:
            return '次へ';
        }
      case 'STEP3':
        return numActions === 'multiple' ? 'プロジェクトとして登録' : '次へ';
      case 'STEP4':
        return isTwoMinuteTask === 'yes' ? '今すぐ実行する' : '次へ';
      case 'STEP4A':
        return isTaskCompleted === 'yes' ? '完了として記録' : '次へ';
      case 'STEP5':
        return delegationChoice === 'delegate_it' ? '委任して待機中リストへ移動' : '次へ';
      case 'STEP6':
        return state.hasSpecificDate === 'yes' ? 'カレンダーに登録' : 'タスクリストに追加';
      default:
        return '次へ';
    }
  };
  
  /**
   * モーダルを閉じる処理を行う関数
   */
  const handleModalClose = () => {
    const { redirectUrl, isProcessing } = state;
    const { setRedirectUrl } = actions;
    
    // 処理中の場合は閉じない
    if (isProcessing) {
      return;
    }
    
    // モーダルを閉じる
    onClose();
    
    // リダイレクトURLが設定されている場合はリダイレクトを行う
    if (redirectUrl) {
      navigate(redirectUrl);
      // リダイレクト後はリセット
      setRedirectUrl(null);
    }
  };
  
  /**
   * 前のステップに戻る処理を行う関数
   */
  const handlePreviousStep = () => {
    const { currentStep } = state;
    const { setCurrentStep, setCompletionMessage, setCompletionStatus } = actions;
    
    // エラーメッセージや完了メッセージをリセット
    setCompletionMessage(null);
    setCompletionStatus(null);
    
    // 現在のステップに応じて前のステップを設定
    switch (currentStep) {
      case 'STEP2':
        setCurrentStep('STEP1');
        break;
      case 'STEP2A':
        setCurrentStep('STEP2');
        break;
      case 'STEP3':
        setCurrentStep('STEP2');
        break;
      case 'STEP4':
        setCurrentStep('STEP3');
        break;
      case 'STEP4A':
        setCurrentStep('STEP4');
        break;
      case 'STEP5':
        // 2分タスクの場合は2分タスク完了確認ステップに戻る
        if (state.isTwoMinuteTask === 'yes') {
          setCurrentStep('STEP4A');
        } else {
          setCurrentStep('STEP4');
        }
        break;
      case 'STEP6':
        setCurrentStep('STEP5');
        break;
      default:
        // デフォルトでは何もしない
        break;
    }
  };
  
  /**
   * 次のステップに進む処理を行う関数
   */
  const handleNextStep = () => {
    console.log('handleNextStep called, currentStep:', state.currentStep);
    console.log('state object:', state);
    console.log('actions object:', Object.keys(actions));
    
    // 成功メッセージが表示されていて終了状態の場合は何もしない
    if (state.completionMessage && state.isTerminal) {
      console.log('Terminal state, not proceeding');
      return;
    }
    
    // エラーメッセージや完了メッセージをリセット
    actions.setCompletionMessage(null);
    actions.setCompletionStatus(null);
    
    // 処理中のローディング状態をリセット
    actions.setIsProcessing(false);
    
    console.log('actualStepActions:', actualStepActions);
    console.log('actualStepActions keys:', Object.keys(actualStepActions));
    console.log('actualStepActions.handleStep1Next type:', typeof actualStepActions.handleStep1Next);
    if (actualStepActions.handleStep1Next) {
      console.log('handleStep1Next function:', actualStepActions.handleStep1Next.toString().substring(0, 150));
    }
    
    // デバッグ用にステップの値を直接取得
    let currentStepValue = state.currentStep;
    console.log('Current step value before switch:', currentStepValue);
    
    // 現在のステップに応じた処理を実行
    console.log('Executing switch statement with currentStep:', state.currentStep);
    console.log('currentStep type:', typeof state.currentStep);
    
    // 文字列リテラルで比較する
    console.log('Using string literal comparison for currentStep:', state.currentStep);
    
    switch (state.currentStep) {
      case 'STEP1':
        console.log('Executing case STEP1');
        actualStepActions.handleStep1Next();
        break;
      case 'STEP2':
        console.log('Executing case STEP2');
        actualStepActions.handleStep2Next();
        break;
      case 'STEP2A':
        console.log('Executing case STEP2A');
        actualStepActions.handleStep2ANext();
        break;
      case 'STEP3':
        console.log('Executing case STEP3');
        actualStepActions.handleStep3Next();
        break;
      case 'STEP4':
        console.log('Executing case STEP4');
        actualStepActions.handleStep4Next();
        break;
      case 'STEP4A':
        console.log('Executing case STEP4A');
        actualStepActions.handleStep4ANext();
        break;
      case 'STEP5':
        console.log('Executing case STEP5');
        actualStepActions.handleStep5Next();
        break;
      case 'STEP6':
        actualStepActions.handleStep6Next();
        break;
      default:
        // デフォルトでは何もしない
        break;
    }
  };
  
  return {
    handleNextStep,
    handlePreviousStep,
    handleModalClose,
    getModalTitle,
    isNextButtonDisabled,
    nextButtonText
  };
};
