import { useState, useRef } from 'react';
import { GtdFlowState, GtdFlowActions, GtdFlowStep } from '../types/gtdFlowTypes';
import { InternalTask } from '../../../hooks/useTasks';
import { AlertProps } from '@cloudscape-design/components';

/**
 * GTDフローの状態管理を行うカスタムフック
 * @returns GTDフローの状態と状態を更新するアクション
 */
export const useGtdFlowState = (): [GtdFlowState, GtdFlowActions] => {
  // ステップ管理
  const [currentStep, setCurrentStep] = useState<GtdFlowStep>('STEP1');
  
  // 入力値
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [isActionable, setIsActionable] = useState<'yes' | 'no' | ''>('');
  const [nonActionableOutcome, setNonActionableOutcome] = useState<'trash' | 'someday' | 'reference' | ''>('');
  const [numActions, setNumActions] = useState<'single' | 'multiple' | ''>('');
  const [isTwoMinuteTask, setIsTwoMinuteTask] = useState<'yes' | 'no' | ''>('');
  const [isTaskCompleted, setIsTaskCompleted] = useState<'yes' | 'no' | ''>('');
  const [delegationChoice, setDelegationChoice] = useState<'do_it' | 'delegate_it' | ''>('');
  const [delegateTo, setDelegateTo] = useState('');
  const [hasSpecificDate, setHasSpecificDate] = useState<'yes' | 'no' | ''>('');
  const [dueDate, setDueDate] = useState('');
  
  // UI状態
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState<AlertProps['type'] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTerminal, setIsTerminal] = useState(false);
  const [autoCloseCountdown, setAutoCloseCountdown] = useState<number | null>(null);
  
  // 現在編集中のタスク
  const [currentTask, setCurrentTask] = useState<InternalTask | null>(null);
  
  // リダイレクト先URL
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  
  // 自動閉じるタイマーの参照
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 状態をまとめたオブジェクト
  const state: GtdFlowState = {
    currentStep,
    itemName,
    itemDescription,
    isActionable,
    nonActionableOutcome,
    numActions,
    isTwoMinuteTask,
    isTaskCompleted,
    delegationChoice,
    delegateTo,
    hasSpecificDate,
    dueDate,
    completionMessage,
    completionStatus,
    isProcessing,
    isTerminal,
    autoCloseCountdown,
    currentTask,
    redirectUrl
  };
  
  // アクションをまとめたオブジェクト
  const actions: GtdFlowActions = {
    setCurrentStep,
    setItemName,
    setItemDescription,
    setIsActionable,
    setNonActionableOutcome,
    setNumActions,
    setIsTwoMinuteTask,
    setIsTaskCompleted,
    setDelegationChoice,
    setDelegateTo,
    setHasSpecificDate,
    setDueDate,
    setCompletionMessage,
    setCompletionStatus,
    setIsProcessing,
    setIsTerminal,
    setAutoCloseCountdown,
    setCurrentTask,
    setRedirectUrl
  };
  
  return [state, actions];
};

/**
 * GTDフローの状態を初期化する関数
 * @param actions GTDフローのアクション
 */
export const initializeGtdFlowState = (actions: GtdFlowActions): void => {
  const {
    setCurrentStep,
    setItemName,
    setItemDescription,
    setIsActionable,
    setNonActionableOutcome,
    setNumActions,
    setIsTwoMinuteTask,
    setIsTaskCompleted,
    setDelegationChoice,
    setDelegateTo,
    setHasSpecificDate,
    setDueDate,
    setCompletionMessage,
    setCompletionStatus,
    setIsProcessing,
    setIsTerminal,
    setAutoCloseCountdown,
    setCurrentTask,
    setRedirectUrl
  } = actions;
  
  // ステップを初期化
  setCurrentStep('STEP1');
  
  // 入力値を初期化
  setItemName('');
  setItemDescription('');
  setIsActionable('');
  setNonActionableOutcome('');
  setNumActions('');
  setIsTwoMinuteTask('');
  setIsTaskCompleted('');
  setDelegationChoice('');
  setDelegateTo('');
  setHasSpecificDate('');
  setDueDate('');
  
  // UI状態を初期化
  setCompletionMessage(null);
  setCompletionStatus(null);
  setIsProcessing(false);
  setIsTerminal(false);
  setAutoCloseCountdown(null);
  
  // タスクを初期化
  setCurrentTask(null);
  
  // リダイレクトURLを初期化
  setRedirectUrl(null);
};
