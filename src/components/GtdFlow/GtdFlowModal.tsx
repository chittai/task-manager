import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Form } from '@cloudscape-design/components';
import { GtdFlowModalProps } from './types/gtdFlowTypes';
import { useGtdFlowState, initializeGtdFlowState } from './hooks/useGtdFlowState';
import { useGtdFlowNavigation } from './hooks/useGtdFlowNavigation';
import { useGtdFlowActions } from './hooks/useGtdFlowActions';
import { useTasks } from '../../hooks/useTasks';
import CompletionMessage from './components/CompletionMessage';
import GtdFlowFooter from './components/GtdFlowFooter';
import StepContent from './components/StepContent';

/**
 * GTDフローモーダルコンポーネント
 * GTD（Getting Things Done）の処理フローに従ってタスクを整理するためのモーダル
 */
const GtdFlowModal: React.FC<GtdFlowModalProps> = ({ isOpen, onClose, memoId }) => {
  // useNavigateフックを使用してページ遷移を実現
  const navigate = useNavigate();
  
  // useTasks フックを使用してタスク操作関数を取得
  const { allTasks } = useTasks();
  
  // GTDフローの状態管理
  const [state, actions] = useGtdFlowState();
  
  // 自動閉じるタイマーの参照
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // GTDフローのアクション機能
  // ステップごとのアクション実行ロジックを取得
  const taskActions = useTasks();
  const stepActions = useGtdFlowActions(state, actions, taskActions);
  
  // GTDフローのナビゲーション機能
  const navigation = useGtdFlowNavigation(state, actions, onClose, stepActions);
  
  /**
   * モーダルが開かれたときの初期化処理を行います。
   * memoIdが渡された場合は、そのメモの情報を読み込みます。
   */
  useEffect(() => {
    if (isOpen) {
      // モーダルが開かれたときにすべての状態を初期化
      initializeGtdFlowState(actions);
      
      // タイマーがあれば解除
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      
      // memoIdが存在する場合、そのメモの情報を読み込む
      if (memoId && allTasks) {
        const task = allTasks.find(task => task.id === memoId);
        if (task) {
          actions.setCurrentTask(task);
          actions.setItemName(task.title);
          actions.setItemDescription(task.description || '');
          console.log(`メモID: ${memoId} の情報を読み込みました`);
        } else {
          console.error(`メモID: ${memoId} が見つかりませんでした`);
          actions.setCompletionMessage(`指定されたメモ (ID: ${memoId}) が見つかりませんでした。`);
          actions.setCompletionStatus('error');
        }
      }
    } else {
      // モーダルが閉じられたときの処理
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      if (!state.completionMessage || state.completionStatus === 'success') {
        // 完了メッセージが表示されていない場合、または成功メッセージが表示されている場合はモーダルを閉じる
        onClose();
      }
    }
  }, [isOpen, memoId, onClose, allTasks, actions, state.completionMessage, state.completionStatus]);
  
  /**
   * 完了メッセージが表示されていて、自動閉じるカウントダウンが設定されている場合の処理
   */
  useEffect(() => {
    const { completionMessage, completionStatus, isTerminal, autoCloseCountdown } = state;
    const { setAutoCloseCountdown, setRedirectUrl } = actions;
    
    // 成功メッセージが表示されていて終了状態の場合は自動閉じるタイマーを開始
    if (completionMessage && completionStatus === 'success' && isTerminal && autoCloseCountdown === null) {
      // 3秒後に自動的に閉じる
      const initialCountdown = 3;
      setAutoCloseCountdown(initialCountdown);
      
      // カウントダウンタイマーを開始
      autoCloseTimerRef.current = setInterval(() => {
        if (state.autoCloseCountdown === null || state.autoCloseCountdown <= 1) {
          // カウントダウンが終了したらタイマーを解除してモーダルを閉じる
          if (autoCloseTimerRef.current) {
            clearInterval(autoCloseTimerRef.current);
            autoCloseTimerRef.current = null;
          }
          
          // モーダルを閉じる
          onClose();
          
          // リダイレクトURLが設定されている場合はリダイレクトを行う
          if (state.redirectUrl) {
            navigate(state.redirectUrl);
            // リダイレクト後はリセット
            setRedirectUrl(null);
          }
          
          setAutoCloseCountdown(null);
        } else {
          // カウントダウンを1減らす
          setAutoCloseCountdown(state.autoCloseCountdown - 1);
        }
      }, 1000);
    }
    
    // コンポーネントのアンマウント時にタイマーをクリーンアップ
    return () => {
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [state, actions, onClose, navigate]);
  
  return (
    <Modal
      onDismiss={navigation.handleModalClose}
      visible={isOpen}
      header={navigation.getModalTitle()}
      footer={<GtdFlowFooter state={state} navigation={navigation} />}
    >
      <Form>
        <CompletionMessage state={state} />
        <StepContent state={state} actions={actions} />
      </Form>
    </Modal>
  );
};

export default GtdFlowModal;
