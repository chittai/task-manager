import { InternalTask } from '../../../hooks/useTasks';
import { AlertProps } from '@cloudscape-design/components';
import { EnergyLevel, TimeEstimate } from '../../../models/Task';

/**
 * GTDフローモーダルのプロパティ
 */
export interface GtdFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoId: string | null;
}

/**
 * GTDフローのステップ番号
 * 数値比較の問題を避けるために文字列リテラルとして定義
 */
export type GtdFlowStep = 
  | 'STEP1'     // ステップ1: それは何か？
  | 'STEP2'     // ステップ2: 行動を起こす必要があるか？
  | 'STEP2A'    // ステップ2A: 行動不要な場合の処理
  | 'STEP3'     // ステップ3: 次のアクションは1つか複数か？
  | 'STEP4'     // ステップ4: そのアクションは2分以内でできますか？
  | 'STEP4A'    // ステップ4A: 2分タスクを完了しましたか？
  | 'STEP5'     // ステップ5: 自分でやるべきか、誰かに任せるか？
  | 'STEP6';    // ステップ6: 特定の日時が決まっているか？

/**
 * ステップ番号を文字列形式で取得するヘルパー関数
 */
export const getStepString = (step: number): GtdFlowStep => {
  switch (step) {
    case 1: return 'STEP1';
    case 2: return 'STEP2';
    case 2.1: return 'STEP2A';
    case 3: return 'STEP3';
    case 4: return 'STEP4';
    case 4.1: return 'STEP4A';
    case 5: return 'STEP5';
    case 6: return 'STEP6';
    default: return 'STEP1';
  }
};

/**
 * 文字列形式のステップ番号から数値を取得するヘルパー関数
 */
export const getStepNumber = (step: GtdFlowStep): number => {
  switch (step) {
    case 'STEP1': return 1;
    case 'STEP2': return 2;
    case 'STEP2A': return 2.1;
    case 'STEP3': return 3;
    case 'STEP4': return 4;
    case 'STEP4A': return 4.1;
    case 'STEP5': return 5;
    case 'STEP6': return 6;
    default: return 1;
  }
};

/**
 * GTDフローの状態
 */
export interface GtdFlowState {
  // ステップ管理
  currentStep: GtdFlowStep;
  
  // 入力値
  itemName: string;
  itemDescription: string;
  isActionable: 'yes' | 'no' | '';
  nonActionableOutcome: 'trash' | 'someday' | 'reference' | '';
  numActions: 'single' | 'multiple' | '';
  isTwoMinuteTask: 'yes' | 'no' | '';
  isTaskCompleted: 'yes' | 'no' | '';
  delegationChoice: 'do_it' | 'delegate_it' | '';
  delegateTo: string;
  hasSpecificDate: 'yes' | 'no' | '';
  dueDate: string;
  
  // UI状態
  completionMessage: string | null;
  completionStatus: AlertProps['type'] | null;
  isProcessing: boolean;
  isTerminal: boolean;
  autoCloseCountdown: number | null;
  
  // 現在編集中のタスク
  currentTask: InternalTask | null;
  
  // リダイレクト先URL
  redirectUrl: string | null;
}

/**
 * GTDフローのアクション
 */
export interface GtdFlowActions {
  // ステップ管理
  setCurrentStep: (step: GtdFlowStep) => void;
  
  // 入力値の更新
  setItemName: (name: string) => void;
  setItemDescription: (description: string) => void;
  setIsActionable: (value: 'yes' | 'no' | '') => void;
  setNonActionableOutcome: (value: 'trash' | 'someday' | 'reference' | '') => void;
  setNumActions: (value: 'single' | 'multiple' | '') => void;
  setIsTwoMinuteTask: (value: 'yes' | 'no' | '') => void;
  setIsTaskCompleted: (value: 'yes' | 'no' | '') => void;
  setDelegationChoice: (value: 'do_it' | 'delegate_it' | '') => void;
  setDelegateTo: (value: string) => void;
  setHasSpecificDate: (value: 'yes' | 'no' | '') => void;
  setDueDate: (value: string) => void;
  
  // UI状態の更新
  setCompletionMessage: (message: string | null) => void;
  setCompletionStatus: (status: AlertProps['type'] | null) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setIsTerminal: (isTerminal: boolean) => void;
  setAutoCloseCountdown: (countdown: number | null) => void;
  
  // タスク管理
  setCurrentTask: (task: InternalTask | null) => void;
  
  // リダイレクト管理
  setRedirectUrl: (url: string | null) => void;
}

/**
 * GTDフローのナビゲーション関数
 */
export interface GtdFlowNavigation {
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  handleModalClose: () => void;
  getModalTitle: () => string;
  isNextButtonDisabled: () => boolean;
  nextButtonText: () => string;
}
