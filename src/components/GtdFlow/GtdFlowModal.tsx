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
  const { allTasks, loading: tasksLoading } = useTasks();
  
  // GTDフローの状態管理
  const [state, actions] = useGtdFlowState();
  
  // 自動閉じるタイマーの参照
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 🔧 FIX 1: 初期化制御用のRef
  const isInitializedRef = useRef(false);
  const lastMemoIdRef = useRef<string | null>(null);
  
  // GTDフローのアクション機能
  // ステップごとのアクション実行ロジックを取得
  const taskActions = useTasks();
  const stepActions = useGtdFlowActions(state, actions, taskActions);
  
  // GTDフローのナビゲーション機能
  const navigation = useGtdFlowNavigation(state, actions, onClose, stepActions);
  
  // 🔧 FIX 2: 初期化専用のuseEffect
  useEffect(() => {
    if (isOpen && !isInitializedRef.current) {
      console.log('🔄 Initializing GTD Flow state');
      initializeGtdFlowState(actions);
      isInitializedRef.current = true;
      
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    }
    
    if (!isOpen) {
      console.log('🔄 Resetting GTD Flow state');
      isInitializedRef.current = false;
      lastMemoIdRef.current = null;
      
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    }
  }, [isOpen]); // ✅ 最小限の依存配列
  
  // 🔧 FIX 3: タスク読み込み専用のuseEffect（改善版）
  useEffect(() => {
    // タスクの読み込みが完了していない場合は処理をスキップ
    if (tasksLoading || !isOpen || !memoId || !allTasks) {
      return;
    }
    
    // 同じmemoIdに対する重複処理を防ぐ
    if (memoId === lastMemoIdRef.current) {
      return;
    }
    
    console.log(`🔍 Searching for task with memoId: ${memoId} in ${allTasks.length} tasks`);
    
    // デバッグ用：利用可能なタスクIDをログ出力
    console.log('Available task IDs:', allTasks.map(t => t.id));
    
    const task = allTasks.find(task => task.id === memoId);
    
    if (task) {
      console.log(`📋 Loading task info for memoId: ${memoId}`, task);
      actions.setCurrentTask(task);
      actions.setItemName(task.title);
      actions.setItemDescription(task.description || '');
      lastMemoIdRef.current = memoId;
      
      // 既存のエラーメッセージをクリア
      actions.setCompletionMessage(null);
      actions.setCompletionStatus(null);
    } else {
      console.error(`❌ Task not found for memoId: ${memoId}`);
      
      // より詳細なエラーメッセージ
      const errorMessage = `指定されたタスク (ID: ${memoId}) が見つかりませんでした。\n\n考えられる原因：\n• タスクが削除された可能性があります\n• 別のセッションで変更された可能性があります\n• データの同期に問題がある可能性があります\n\nタスク一覧に戻って再度お試しください。`;
      
      actions.setCompletionMessage(errorMessage);
      actions.setCompletionStatus('error');
      actions.setIsTerminal(true);
      
      // エラーが発生した場合は3秒後に自動的にモーダルを閉じる
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  }, [isOpen, memoId, allTasks, tasksLoading, actions, onClose]); // 依存配列を最適化
  
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
  
  // タスクの読み込み中はローディング表示
  if (tasksLoading && isOpen) {
    return (
      <Modal
        onDismiss={onClose}
        visible={isOpen}
        header="GTDフロー"
      >
        <Form>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>タスク情報を読み込み中...</p>
          </div>
        </Form>
      </Modal>
    );
  }
  
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
