import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Modal,
  FormField,
  Input,
  Textarea,
  Button,
  SpaceBetween,
  Form,
  RadioGroup,
  DateInput,
  Alert,
  AlertProps,
  Spinner,
} from '@cloudscape-design/components';
import { useTasks, InternalTask } from '../hooks/useTasks';
import { Task, EnergyLevel, TimeEstimate } from '../models/Task';

interface GtdFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoId: string | null;
}

const GtdFlowModal: React.FC<GtdFlowModalProps> = ({ isOpen, onClose, memoId }) => {
  // useNavigateフックを使用してページ遷移を実現
  const navigate = useNavigate();
  
  // リダイレクト先のURLを保持する状態変数
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  
  // useTasks フックを使用してタスク操作関数を取得
  const { 
    allTasks, 
    loading, 
    error, 
    updateTask, 
    moveTaskToSomedayMaybe, 
    moveTaskToReference, 
    setTaskToWaitingOn, 
    convertTaskToProject, 
    trashTask,
    addTask, // 新規タスク作成関数を追加
    changeTaskStatus // タスクのステータス変更関数を追加
  } = useTasks();

  // GTDフローのステップ管理
  const [currentStep, setCurrentStep] = useState(1);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [isActionable, setIsActionable] = useState<'yes' | 'no' | ''>('');
  const [nonActionableOutcome, setNonActionableOutcome] = useState<'trash' | 'someday' | 'reference' | ''>('');
  const [numActions, setNumActions] = useState<'single' | 'multiple' | ''>('');
  const [isTwoMinuteTask, setIsTwoMinuteTask] = useState<'yes' | 'no' | ''>('');
  const [isTaskCompleted, setIsTaskCompleted] = useState<'yes' | 'no' | ''>(''); // 2分タスク完了確認
  const [delegationChoice, setDelegationChoice] = useState<'do_it' | 'delegate_it' | ''>('');
  const [delegateTo, setDelegateTo] = useState(''); // 委任先の情報
  const [hasSpecificDate, setHasSpecificDate] = useState<'yes' | 'no' | ''>('');
  const [dueDate, setDueDate] = useState('');

  // UI状態管理
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState<AlertProps['type'] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // データ処理中のローディング状態
  const [isTerminal, setIsTerminal] = useState(false); // フロー終了状態を示すフラグ
  const [autoCloseCountdown, setAutoCloseCountdown] = useState<number | null>(null); // 自動閉じるカウントダウン
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null); // 自動閉じるタイマーの参照
  
  // 現在編集中のタスク
  const [currentTask, setCurrentTask] = useState<InternalTask | null>(null);

  /**
   * モーダルが開かれたときの初期化処理を行います。
   * memoIdが渡された場合は、そのメモの情報を読み込みます。
   */
  useEffect(() => {
    if (isOpen) {
      // モーダルが開かれたときにすべての状態を初期化
      setCurrentStep(1); // 最初のステップに設定
      
      // 入力値を初期化
      setItemName('');
      setItemDescription('');
      setIsActionable('');
      setNonActionableOutcome('');
      setNumActions('');
      setIsTwoMinuteTask('');
      setIsTaskCompleted(''); // 2分タスク完了確認をリセット
      setDelegationChoice('');
      setDelegateTo('');
      setHasSpecificDate('');
      setDueDate('');
      
      // メッセージ状態を初期化
      setCompletionMessage(null);
      setCompletionStatus(null);
      setIsProcessing(false);
      setIsTerminal(false); // 終了状態をリセット
      setCurrentTask(null);
      setAutoCloseCountdown(null);
      
      // タイマーがあれば解除
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      
      // memoIdが存在する場合、そのメモの情報を読み込む
      if (memoId && allTasks) {
        const task = allTasks.find(task => task.id === memoId);
        if (task) {
          setCurrentTask(task);
          setItemName(task.title);
          setItemDescription(task.description || '');
          console.log(`メモID: ${memoId} の情報を読み込みました`);
        } else {
          console.error(`メモID: ${memoId} が見つかりませんでした`);
          setCompletionMessage(`指定されたメモ (ID: ${memoId}) が見つかりませんでした。`);
          setCompletionStatus('error');
        }
      }
    } else {
      // モーダルが閉じられたときの処理
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      if (!completionMessage || completionStatus === 'success') {
        // 完了メッセージが表示されていない場合、または成功メッセージが表示されている場合はモーダルを閉じる
        onClose();
      }
    }
  }, [isOpen, memoId, onClose, allTasks]);

  /**
   * 次のステップに進むための処理を行います。
   * ユーザーの選択に基づいて適切なステップに遷移し、
   * 必要に応じてタスク更新処理を実行します。
   */
  const handleNextStep = () => {
    // 成功メッセージが表示されていて終了状態の場合は何もしない（自動閉じるタイマーに任せる）
    if (completionMessage && isTerminal) {
      return;
    }
    
    // エラーメッセージや完了メッセージをリセット
    setCompletionMessage(null);
    setCompletionStatus(null);
    
    // 処理中のローディング状態をリセット
    setIsProcessing(false);

    switch (currentStep) {
      case 1: // ステップ1: それは何か？
        if (!itemName.trim()) {
          setCompletionMessage('アイテム名を入力してください。');
          setCompletionStatus('error');
          return;
        }
        
        // タスクが存在しない場合は新規作成、存在する場合は更新
        if (currentTask) {
          // 既存タスクのタイトルと説明を更新
          setIsProcessing(true);
          updateTask(currentTask.id, {
            title: itemName,
            description: itemDescription,
          }).then(() => {
            setIsProcessing(false);
            // 入力が有効なら次のステップへ
            setCurrentStep(2);
          }).catch(err => {
            console.error('タスク更新エラー:', err);
            setCompletionMessage('タスクの更新中にエラーが発生しました。');
            setCompletionStatus('error');
            setIsProcessing(false);
          });
        } else {
          // 入力が有効なら次のステップへ
          setCurrentStep(2);
        }
        break;

      case 2: // ステップ2: 行動を起こす必要があるか？
        if (!isActionable) {
          setCompletionMessage('「行動を起こす必要があるか？」を選択してください。');
          setCompletionStatus('error');
          return;
        }
        // 選択に応じて分岐
        if (isActionable === 'yes') {
          // 「はい」なら次のステップへ
          setCurrentStep(3);
        } else {
          // 「いいえ」ならステップ2A（行動不要な場合の処理）へ
          setCurrentStep(2.1);
        }
        break;

      case 2.1: // ステップ2A: 行動不要な場合の処理
        if (!nonActionableOutcome) {
          setCompletionMessage('「行動不要な場合、どうしますか？」を選択してください。');
          setCompletionStatus('error');
          return;
        }
        
        // タスクが存在しない場合は新規作成、存在する場合は更新
        setIsProcessing(true);
        
        // 選択に応じた処理を実行
        switch (nonActionableOutcome) {
          case 'trash':
            if (currentTask) {
              // タスクをゴミ箱に移動
              trashTask(currentTask.id)
                .then(() => {
                  setIsProcessing(false);
                  setCompletionMessage('タスクをゴミ箱に移動しました。');
                  setCompletionStatus('success');
                  setIsTerminal(true); // 終了状態をセット
                })
                .catch(err => {
                  console.error('タスク削除エラー:', err);
                  setCompletionMessage('タスクの削除中にエラーが発生しました。');
                  setCompletionStatus('error');
                  setIsProcessing(false);
                });
            } else {
              // 新規タスクの場合は成功メッセージを表示
              setIsProcessing(false);
              setCompletionMessage('アイテムをゴミ箱に移動しました。');
              setCompletionStatus('success');
              setIsTerminal(true); // 終了状態をセット
            }
            break;
            
          case 'someday':
            if (currentTask) {
              // タスクを「いつかやる」リストに移動
              moveTaskToSomedayMaybe(currentTask.id, itemDescription)
                .then(() => {
                  // GTD属性を設定
                  return updateTask(currentTask.id, {
                    isProject: false,
                    nextAction: false,
                    energy: 'medium' as EnergyLevel,
                    time: 'medium' as TimeEstimate
                  });
                })
                .then(() => {
                  setIsProcessing(false);
                  setCompletionMessage('タスクを「いつかやる/多分やる」リストに移動しました。');
                  setCompletionStatus('success');
                  setRedirectUrl('/someday-maybe');
                  setIsTerminal(true); // 終了状態をセット
                })
                .catch(err => {
                  console.error('タスク移動エラー:', err);
                  setCompletionMessage('タスクの移動中にエラーが発生しました。');
                  setCompletionStatus('error');
                  setIsProcessing(false);
                });
            } else {
              // 新規タスクを「いつかやる」リストに追加
              setIsProcessing(true);
              addTask({
                title: itemName,
                description: itemDescription,
                status: 'someday-maybe',
                priority: 'medium', // デフォルト優先度
                // GTD属性を設定
                isProject: false,
                nextAction: false,
                energy: 'medium' as EnergyLevel,
                time: 'medium' as TimeEstimate
              })
                .then(() => {
                  setIsProcessing(false);
                  setCompletionMessage('タスクを「いつかやる/多分やる」リストに追加しました。');
                  setCompletionStatus('success');
                  setRedirectUrl('/someday-maybe');
                  setIsTerminal(true); // 終了状態をセット
                })
                .catch((err: Error) => {
                  console.error('タスク作成エラー:', err);
                  setCompletionMessage('タスクの作成中にエラーが発生しました。');
                  setCompletionStatus('error');
                  setIsProcessing(false);
                });
            }
            break;
            
          case 'reference':
            if (currentTask) {
              // タスクを参考資料として保存
              moveTaskToReference(currentTask.id, itemDescription)
                .then(() => {
                  // GTD属性を設定
                  return updateTask(currentTask.id, {
                    isProject: false,
                    nextAction: false,
                    energy: 'low' as EnergyLevel,
                    time: 'quick' as TimeEstimate
                  });
                })
                .then(() => {
                  setIsProcessing(false);
                  setCompletionMessage('タスクを「参考資料」リストに移動しました。');
                  setCompletionStatus('success');
                  setRedirectUrl('/reference');
                  setIsTerminal(true); // 終了状態をセット
                })
                .catch(err => {
                  console.error('タスク移動エラー:', err);
                  setCompletionMessage('タスクの移動中にエラーが発生しました。');
                  setCompletionStatus('error');
                  setIsProcessing(false);
                });
            } else {
              // 新規タスクを参考資料として保存
              setIsProcessing(true);
              addTask({
                title: itemName,
                description: itemDescription,
                status: 'reference',
                priority: 'low', // 参考資料は優先度低めをデフォルトに
                // GTD属性を設定
                isProject: false,
                nextAction: false,
                energy: 'low' as EnergyLevel,
                time: 'quick' as TimeEstimate
              })
                .then(() => {
                  setIsProcessing(false);
                  setCompletionMessage('タスクを「参考資料」リストに追加しました。');
                  setCompletionStatus('success');
                  setRedirectUrl('/reference');
                  setIsTerminal(true); // 終了状態をセット
                })
                .catch((err: Error) => {
                  console.error('タスク作成エラー:', err);
                  setCompletionMessage('タスクの作成中にエラーが発生しました。');
                  setCompletionStatus('error');
                  setIsProcessing(false);
                });
            }
            break;
        }
        break;

      case 3: // ステップ3: 次のアクションの数
        if (!numActions) {
          setCompletionMessage('「次のアクションは1つか複数か？」を選択してください。');
          setCompletionStatus('error');
          return;
        }
        
        // 選択に応じて分岐
        if (numActions === 'single') {
          // 「1つ」なら次のステップへ
          setCurrentStep(4);
        } else {
          // 「複数」ならプロジェクトとして処理し、フロー完了
          setIsProcessing(true);
          
          if (currentTask) {
            // 既存タスクをプロジェクトに変換
            convertTaskToProject(currentTask.id, itemDescription)
              .then(() => {
                // GTD属性を設定
                return updateTask(currentTask.id, {
                  isProject: true,
                  nextAction: false,
                  energy: 'high' as EnergyLevel,
                  time: 'long' as TimeEstimate
                });
              })
              .then(() => {
                setIsProcessing(false);
                setCompletionMessage('タスクをプロジェクトに変換しました。');
                setCompletionStatus('success');
                setRedirectUrl('/projects');
                setIsTerminal(true); // 終了状態をセット
              })
              .catch(err => {
                console.error('プロジェクト変換エラー:', err);
                setCompletionMessage('プロジェクトへの変換中にエラーが発生しました。');
                setCompletionStatus('error');
                setIsProcessing(false);
              });
          } else {
            // 新規プロジェクトを作成
            setIsProcessing(true);
            // プロジェクトとしてのタスクを作成
            addTask({
              title: itemName,
              description: `${itemDescription || ''}

【GTDフローメモ】: プロジェクトとして作成`,
              status: 'todo',
              priority: 'medium',
              // GTD属性を設定
              isProject: true,
              nextAction: false,
              energy: 'high' as EnergyLevel,
              time: 'long' as TimeEstimate
            })
              .then(() => {
                setIsProcessing(false);
                setCompletionMessage('プロジェクトを作成しました。');
                setCompletionStatus('success');
                setRedirectUrl('/projects');
                setIsTerminal(true); // 終了状態をセット
              })
              .catch((err: Error) => {
                console.error('プロジェクト作成エラー:', err);
                setCompletionMessage('プロジェクトの作成中にエラーが発生しました。');
                setCompletionStatus('error');
                setIsProcessing(false);
              });
          }
        }
        break;

      case 4: // ステップ4: 2分ルール
        if (!isTwoMinuteTask) {
          setCompletionMessage('「そのアクションは2分以内でできますか？」を選択してください。');
          setCompletionStatus('error');
          return;
        }
        
        // 選択に応じて分岐
        if (isTwoMinuteTask === 'yes') {
          // 「はい」なら2分ルールを適用し、タスク完了確認ステップへ
          setCurrentStep(4.1); // 新しいステップ4.1（タスク完了確認）へ進む
        } else {
          // 「いいえ」なら次のステップへ
          setCurrentStep(5);
        }
        break;
        
      case 4.1: // ステップ4.1: タスク完了確認
        if (!isTaskCompleted) {
          setCompletionMessage('「タスクを完了しましたか？」を選択してください。');
          setCompletionStatus('error');
          return;
        }
        
        // タスク完了確認の選択に応じて処理
        if (isTaskCompleted === 'yes') {
          // 「はい」ならタスクを完了状態に変更
          setIsProcessing(true);
          
          if (currentTask) {
            // 既存タスクの場合はステータスを更新して完了に
            changeTaskStatus(currentTask.id, 'done')
              .then(() => {
                setIsProcessing(false);
                setCompletionMessage('タスクを完了しました。');
                setCompletionStatus('success');
                setIsTerminal(true); // 終了状態をセット
              })
              .catch((error: Error) => {
                console.error('タスク完了エラー:', error);
                setCompletionMessage('タスクの完了処理中にエラーが発生しました。');
                setCompletionStatus('error');
                setIsProcessing(false);
              });
          } else {
            // 新規タスクを作成して完了状態に
            addTask({
              title: itemName,
              description: `${itemDescription || ''}\n\n【GTDフローメモ】: 2分ルール適用、即時完了したタスク`,
              status: 'done',
              priority: 'high',
            })
              .then(() => {
                setIsProcessing(false);
                setCompletionMessage('タスクを作成し、完了しました。');
                setCompletionStatus('success');
                setIsTerminal(true); // 終了状態をセット
              })
              .catch((err: Error) => {
                console.error('タスク作成エラー:', err);
                setCompletionMessage('タスクの作成中にエラーが発生しました。');
                setCompletionStatus('error');
                setIsProcessing(false);
              });
          }
        } else {
          // 「いいえ」ならTodoリストに追加
          setIsProcessing(true);
          
          if (currentTask) {
            // 既存タスクの場合はステータスを更新
            updateTask(currentTask.id, {
              status: 'todo',
              description: `${currentTask.description || ''}\n\n【GTDフローメモ】: 2分ルール適用、今すぐ実行するタスク`
            }).then(() => {
              setIsProcessing(false);
              setCompletionMessage('タスクを今すぐ実行するタスクとして設定しました。');
              setCompletionStatus('success');
              setIsTerminal(true); // 終了状態をセット
            }).catch((error: Error) => {
              console.error('タスク更新エラー:', error);
              setCompletionMessage('タスクの更新中にエラーが発生しました。');
              setCompletionStatus('error');
              setIsProcessing(false);
            });
          } else {
            // 新規タスクを作成して2分ルールを適用
            addTask({
              title: itemName,
              description: `${itemDescription || ''}\n\n【GTDフローメモ】: 2分ルール適用、今すぐ実行するタスク`,
              status: 'todo',
              priority: 'high', // 2分ルールタスクは優先度高めをデフォルトに
            })
              .then(() => {
                // 2分ルール適用時はモーダルを閉じる
                setIsProcessing(false);
                setCompletionMessage('タスクを作成し、今すぐ実行するタスクとして設定しました。');
                setCompletionStatus('success');
                setIsTerminal(true); // 終了状態をセット
              })
              .catch((err: Error) => {
                console.error('タスク作成エラー:', err);
                setCompletionMessage('タスクの作成中にエラーが発生しました。');
                setCompletionStatus('error');
                setIsProcessing(false);
              });
          }
        }
        break;

      case 5: // ステップ5: タスクの委任
        if (!delegationChoice) {
          setCompletionMessage('「自分でやるべきか、誰かに任せるか？」を選択してください。');
          setCompletionStatus('error');
          return;
        }
        
        // 選択に応じて分岐
        if (delegationChoice === 'do_it') {
          // 「自分でやる」なら次のステップへ
          setCurrentStep(6);
        } else {
          // 「誰かに任せる」なら委任処理を行い、フロー完了
          if (currentTask) {
            // 既存タスクを委任状態に設定
            setIsProcessing(true);
            setTaskToWaitingOn(currentTask.id, delegateTo, itemDescription)
              .then(() => {
                // GTD属性を設定
                return updateTask(currentTask.id, {
                  delegatedTo: delegateTo,
                  waitingFor: delegateTo,
                  isProject: false,
                  nextAction: false,
                  energy: 'low' as EnergyLevel,
                  time: 'quick' as TimeEstimate
                });
              })
              .then(() => {
                setCompletionMessage(`タスクを${delegateTo ? `「${delegateTo}」に` : ''}委任しました。待機リストに追加しました。`);
                setCompletionStatus('success');
                setIsProcessing(false);
                setRedirectUrl('/wait-on');
                return; // 明示的にreturnを追加
              })
              .catch(error => {
                console.error('タスク委任エラー:', error);
                setCompletionMessage('タスクの委任中にエラーが発生しました。');
                setCompletionStatus('error');
                setIsProcessing(false);
              });
          } else {
            // 新規タスクを作成して委任状態に設定
            setIsProcessing(true);
            addTask({
              title: itemName,
              description: `${itemDescription || ''}

【GTDフローメモ】: ${delegateTo ? `「${delegateTo}」に` : ''}委任したタスク`,
              status: 'wait-on',
              priority: 'medium',
              // GTD属性を設定
              delegatedTo: delegateTo,
              waitingFor: delegateTo,
              isProject: false,
              nextAction: false,
              energy: 'low' as EnergyLevel,
              time: 'quick' as TimeEstimate
            })
              .then(() => {
                setCompletionMessage(`タスクを${delegateTo ? `「${delegateTo}」に` : ''}委任しました。待機リストに追加しました。`);
                setCompletionStatus('success');
                setIsProcessing(false);
                setRedirectUrl('/wait-on');
                return; // 明示的にreturnを追加
              })
              .catch((err: Error) => {
                console.error('タスク作成エラー:', err);
                setCompletionMessage('タスクの作成中にエラーが発生しました。');
                setCompletionStatus('error');
                setIsProcessing(false);
              });
          }
        }
        break;

      case 6: // ステップ6: 日時の特定
        if (!hasSpecificDate) {
          setCompletionMessage('「特定の日時が決まっているか？」を選択してください。');
          setCompletionStatus('error');
          return;
        }
        
        // 選択に応じて分岐
        if (hasSpecificDate === 'yes') {
          // 「はい」なら日付入力が必要
          if (!dueDate) {
            setCompletionMessage('日付を入力してください。');
            setCompletionStatus('error');
            return;
          }
          
          // 日付が入力されていれば、スケジュール処理を行い、フロー完了
          const formattedDate = new Date(dueDate).toLocaleDateString('ja-JP');
          
          if (currentTask) {
            // 既存タスクに期日を設定
            setIsProcessing(true);
            updateTask(currentTask.id, {
              dueDate: dueDate,
              status: 'todo',
              description: `${currentTask.description || ''}\n\n【GTDフローメモ】: 期日付きタスク`,
              // GTD属性を設定
              isProject: false,
              nextAction: true,
              energy: 'medium' as EnergyLevel,
              time: 'medium' as TimeEstimate
            }).then(() => {
              // スケジュール時は成功メッセージを表示
              setIsProcessing(false);
              setCompletionMessage(`タスクを期日付きタスクとして設定しました。期日: ${formattedDate}`);
              setCompletionStatus('success');
              setRedirectUrl('/todo');
              setIsTerminal(true); // 終了状態をセット
            }).catch(error => {
              console.error('タスク更新エラー:', error);
              setCompletionMessage('タスクの更新中にエラーが発生しました。');
              setCompletionStatus('error');
              setIsProcessing(false);
            });
          } else {
            // 新規タスクを作成して期日を設定
            setIsProcessing(true);
            addTask({
              title: itemName,
              description: `${itemDescription || ''}

【GTDフローメモ】: 期日付きタスク`,
              status: 'todo',
              priority: 'medium',
              dueDate: dueDate,
              // GTD属性を設定
              isProject: false,
              nextAction: true,
              energy: 'medium' as EnergyLevel,
              time: 'medium' as TimeEstimate
            })
              .then(() => {
                // スケジュール時は成功メッセージを表示
                setIsProcessing(false);
                setCompletionMessage(`タスクを期日付きタスクとして作成しました。期日: ${formattedDate}`);
                setCompletionStatus('success');
                setRedirectUrl('/todo');
                setIsTerminal(true); // 終了状態をセット
              })
              .catch((err: Error) => {
                console.error('タスク作成エラー:', err);
                setCompletionMessage('タスクの作成中にエラーが発生しました。');
                setCompletionStatus('error');
                setIsProcessing(false);
              });
          }
        } else {
          // 「いいえ」なら次のアクションリストに追加
          if (currentTask) {
            // 既存タスクをTodoリストに追加
            setIsProcessing(true);
            updateTask(currentTask.id, {
              status: 'todo',
              description: `${currentTask.description || ''}\n\n【GTDフローメモ】: 次のアクションリストに追加`,
              // GTD属性を設定
              isProject: false,
              nextAction: true,
              energy: 'medium' as EnergyLevel,
              time: 'medium' as TimeEstimate,
              contextTag: ['next-action']
            }).then(() => {
              // 次のアクションリスト追加時は成功メッセージを表示
              setIsProcessing(false);
              setCompletionMessage('タスクを次のアクションリストに追加しました。');
              setCompletionStatus('success');
              setRedirectUrl('/todo');
              setIsTerminal(true); // 終了状態をセット
            }).catch(error => {
              console.error('タスク更新エラー:', error);
              setCompletionMessage('タスクの更新中にエラーが発生しました。');
              setCompletionStatus('error');
              setIsProcessing(false);
            });
          } else {
            // 新規タスクを作成して次のアクションリストに追加
            setIsProcessing(true);
            addTask({
              title: itemName,
              description: `${itemDescription || ''}

【GTDフローメモ】: 次のアクションリストに追加`,
              status: 'todo',
              priority: 'medium',
              // GTD属性を設定
              isProject: false,
              nextAction: true,
              energy: 'medium' as EnergyLevel,
              time: 'medium' as TimeEstimate,
              contextTag: ['next-action']
            })
              .then(() => {
                // 次のアクションリスト追加時は成功メッセージを表示
                setIsProcessing(false);
                setCompletionMessage('新規タスクを次のアクションリストに追加しました。');
                setCompletionStatus('success');
                setRedirectUrl('/todo');
                setIsTerminal(true); // 終了状態をセット
              })
              .catch((err: Error) => {
                console.error('タスク作成エラー:', err);
                setCompletionMessage('タスクの作成中にエラーが発生しました。');
                setCompletionStatus('error');
                setIsProcessing(false);
              });
          }
        }
        break;

      default:
        break;
    }
  };

  /**
   * 前のステップに戻る処理を行います。
   * ステップの遷移パスに応じて適切な前のステップに戻ります。
   */
  const handlePreviousStep = () => {
    // エラーメッセージや完了メッセージをリセット
    setCompletionMessage(null);
    setCompletionStatus(null);

    // ステップに応じた適切な戻り先を設定
    switch (currentStep) {
      case 2.1: // ステップ2Aからはステップ2に戻る
        setCurrentStep(2);
        break;
      case 3: // ステップ3からはステップ2に戻る
        setCurrentStep(2);
        break;
      case 4: // ステップ4からはステップ3に戻る
        setCurrentStep(3);
        break;
      case 4.1: // ステップ4.1からはステップ4に戻る
        setCurrentStep(4);
        setIsTaskCompleted(''); // 選択をリセット
        break;
      case 5: // ステップ5からはステップ4に戻る
        setCurrentStep(4);
        break;
      case 6: // ステップ6からはステップ5に戻る
        setCurrentStep(5);
        break;
      default: // その他の場合は、現在のステップが1より大きければ前のステップに戻る
        if (currentStep > 1) {
          setCurrentStep(prev => Math.max(1, Math.floor(prev - 1)));
        }
        break;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <SpaceBetween direction="vertical" size="l">
            <FormField label="それは何か？" description="タスクやアイデアの内容を具体的に記述します。">
              <Input value={itemName} onChange={({ detail }) => setItemName(detail.value)} placeholder="例：新機能の仕様書作成" />
            </FormField>
            <FormField label="詳細 (任意)">
              <Textarea value={itemDescription} onChange={({ detail }) => setItemDescription(detail.value)} rows={3} />
            </FormField>
          </SpaceBetween>
        );
      case 2:
        return (
          <FormField label="行動を起こす必要があるか？" description="このアイテムに対して具体的なアクションが必要かどうかを判断します。">
            <RadioGroup
              onChange={({ detail }) => setIsActionable(detail.value as 'yes' | 'no')}
              value={isActionable}
              items={[
                { value: 'yes', label: 'はい、行動が必要です' },
                { value: 'no', label: 'いいえ、行動は不要です' },
              ]}
            />
          </FormField>
        );
      case 2.1:
        return (
          <FormField label="行動不要な場合、どうしますか？" description="不要なアイテムの処理方法を選択します。">
            <RadioGroup
              onChange={({ detail }) => setNonActionableOutcome(detail.value as 'trash' | 'someday' | 'reference')}
              value={nonActionableOutcome}
              items={[
                { value: 'trash', label: 'ゴミ箱へ（不要なもの）' },
                { value: 'someday', label: 'いつかやる/多分やるリストへ' },
                { value: 'reference', label: '資料として保管' },
              ]}
            />
          </FormField>
        );
      case 3:
        return (
          <FormField label="次のアクションは1つか複数か？" description="目標達成に必要なアクションが1つで終わるか、複数ステップ必要か判断します。複数ならプロジェクトです。">
            <RadioGroup
              onChange={({ detail }) => setNumActions(detail.value as 'single' | 'multiple')}
              value={numActions}
              items={[
                { value: 'single', label: '1つのアクションで完了する' },
                { value: 'multiple', label: '複数のアクションが必要（プロジェクト）' },
              ]}
            />
          </FormField>
        );
      case 4:
        return (
          <SpaceBetween direction="vertical" size="l">
            <FormField
              label="そのアクションは2分以内でできますか？"
              description="2分で終わるタスクはすぐに実行しましょう。"
            >
              <RadioGroup
                onChange={({ detail }) => setIsTwoMinuteTask(detail.value as 'yes' | 'no')}
                value={isTwoMinuteTask}
                items={[
                  { value: 'yes', label: 'はい、2分以内でできます' },
                  { value: 'no', label: 'いいえ、もっと時間がかかります' },
                ]}
              />
            </FormField>
            
            {isTwoMinuteTask === 'yes' && (
              <Alert type="success">
                <b>2分ルール適用！</b><br />
                このタスクは2分以内で完了できるため、今すぐ実行しましょう。<br />
                次のステップで完了確認を行います。
              </Alert>
            )}
          </SpaceBetween>
        );
      case 4.1:
        return (
          <SpaceBetween direction="vertical" size="l">
            <FormField label="タスクを完了しましたか？" description="2分以内のタスクをすぐに実行し、完了したかどうかを選択してください。">
              <RadioGroup
                onChange={({ detail }) => setIsTaskCompleted(detail.value as 'yes' | 'no')}
                value={isTaskCompleted}
                items={[
                  { value: 'yes', label: 'はい、タスクを完了しました' },
                  { value: 'no', label: 'いいえ、後で実行します' },
                ]}
              />
            </FormField>
            
            {isTaskCompleted === 'yes' && (
              <Alert type="success">
                <b>タスク完了！</b><br />
                タスクを完了状態にします。お疲れ様でした！
              </Alert>
            )}
            
            {isTaskCompleted === 'no' && (
              <Alert type="info">
                <b>Todoリストに追加</b><br />
                タスクをTodoリストに追加します。後ほど実行してください。
              </Alert>
            )}
          </SpaceBetween>
        );
      case 5:
        return (
          <SpaceBetween direction="vertical" size="l">
            <FormField label="自分でやるべきか、誰かに任せるか？" description="タスクの担当者を決定します。">
              <RadioGroup
                onChange={({ detail }) => setDelegationChoice(detail.value as 'do_it' | 'delegate_it')}
                value={delegationChoice}
                items={[
                  { value: 'do_it', label: '自分でやる' },
                  { value: 'delegate_it', label: '誰かに任せる' },
                ]}
              />
            </FormField>
            
            {delegationChoice === 'delegate_it' && (
              <FormField label="委任先" description="タスクを委任する相手を入力してください。">
                <Input
                  value={delegateTo}
                  onChange={({ detail }) => setDelegateTo(detail.value)}
                  placeholder="例：田中さん"
                />
              </FormField>
            )}
          </SpaceBetween>
        );
      case 6:
        return (
          <SpaceBetween direction="vertical" size="l">
            <FormField label="特定の日時が決まっているか？" description="締め切りや実施日が決まっているか確認します。">
              <RadioGroup
                onChange={({ detail }) => setHasSpecificDate(detail.value as 'yes' | 'no')}
                value={hasSpecificDate}
                items={[
                  { value: 'yes', label: 'はい、特定の日時があります' },
                  { value: 'no', label: 'いいえ、特定の日時はありません' },
                ]}
              />
            </FormField>
            {hasSpecificDate === 'yes' && (
              <FormField label="日付を選択">
                <DateInput
                  onChange={({ detail }) => setDueDate(detail.value)}
                  value={dueDate}
                  placeholder="YYYY-MM-DD"
                />
              </FormField>
            )}
          </SpaceBetween>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    if (completionMessage) return "処理結果";
    switch (currentStep) {
      case 1: return "ステップ1: それは何ですか？";
      case 2: return "ステップ2: 行動を起こす必要がありますか？";
      case 2.1: return "ステップ2A: 行動不要な場合の処理";
      case 3: return "ステップ3: 次のアクションの数";
      case 4: return "ステップ4: 2分ルール";
      case 4.1: return "ステップ4.1: タスク完了確認";
      case 5: return "ステップ5: タスクの委任";
      case 6: return "ステップ6: 日時の特定";
      default: return "GTDフロー";
    }
  };

  const isNextButtonDisabled = () => {
    if (completionMessage && completionStatus === 'error') return false;
    if (completionMessage && completionStatus === 'success') return true;

    switch (currentStep) {
      case 1: return !itemName.trim();
      case 2: return !isActionable;
      case 2.1: return !nonActionableOutcome;
      case 3: return !numActions;
      case 4: return !isTwoMinuteTask;
      case 4.1: return !isTaskCompleted;
      case 5: return !delegationChoice;
      case 6: return !hasSpecificDate || (hasSpecificDate === 'yes' && !dueDate);
      default: return true;
    }
  };

  const nextButtonText = () => {
    // 成功メッセージが表示されている場合は常に「閉じる」を表示
    if (completionMessage) {
      return "閉じる";
    }
    
    // 完了ボタンを表示する条件
    if (currentStep === 6 || 
        (currentStep === 2.1 && nonActionableOutcome) ||
        (currentStep === 3 && numActions === 'multiple') ||
        (currentStep === 5 && delegationChoice === 'delegate_it')
       ) {
      return "完了";
    }
    
    // それ以外は「次へ」を表示
    return "次へ";
  };

  /**
   * 成功メッセージが表示された後、自動的にモーダルを閉じるタイマーを開始します。
   */
  useEffect(() => {
    // 成功メッセージがあり、終了状態の場合のみタイマーを開始
    if (completionMessage && completionStatus === 'success' && isTerminal) {
      console.log('自動閉じるタイマーを開始します');
      // タイマーがすでに存在する場合はクリア
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
      
      // 即時にモーダルを閉じる
      onClose();
      
      // リダイレクトURLが設定されている場合はリダイレクトを行う
      if (redirectUrl) {
        navigate(redirectUrl);
        // リダイレクト後はリセット
        setRedirectUrl(null);
      }
    }
    
    // コンポーネントのアンマウント時にタイマーをクリーンアップ
    return () => {
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [completionMessage, completionStatus, isTerminal, onClose, redirectUrl, navigate]);

  /**
   * モーダルを閉じる処理を行います。
   * 完了メッセージが表示されている場合は確認を求めずに閉じます。
   * それ以外の場合は、ユーザーが進行中の作業を失うことを防ぐために確認が必要です。
   */
  const handleModalClose = () => {
    // タイマーがあれば解除
    if (autoCloseTimerRef.current) {
      clearInterval(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    
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

  return (
    <Modal
      onDismiss={handleModalClose}
      visible={isOpen}
      header={getModalTitle()}
      footer={(
        <SpaceBetween direction="horizontal" size="xs">
          {completionMessage && completionStatus === 'success' && isTerminal ? (
            // 成功メッセージが表示されていて終了状態の場合は「閉じる」ボタンのみ表示
            <Button 
              variant="primary" 
              onClick={handleModalClose} // onCloseではなくhandleModalCloseを呼び出す
            >
              閉じる
            </Button>
          ) : (
            // 通常のフローでは「戻る」と「次へ」ボタンを表示
            <>
              <Button 
                variant="link" 
                onClick={handlePreviousStep} 
                disabled={currentStep === 1 || isTerminal}
              >
                戻る
              </Button>
              <Button 
                variant="primary" 
                onClick={handleNextStep}
                disabled={isNextButtonDisabled() || isTerminal}
              >
                {nextButtonText()}
              </Button>
            </>
          )}
        </SpaceBetween>
      )}
    >
      <Form>
        {isProcessing && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <Spinner size="large" />
            <div style={{ marginLeft: '10px' }}>処理中...</div>
          </div>
        )}
        {!isProcessing && completionMessage && (
          <Alert type={completionStatus || undefined} header={completionStatus === 'success' ? '成功' : '注意'}>
            {completionMessage}
            {autoCloseCountdown !== null && completionStatus === 'success' && (
              <div style={{ marginTop: '10px', fontSize: '0.9em', fontStyle: 'italic' }}>
                このモーダルは {autoCloseCountdown} 秒後に自動的に閉じます
              </div>
            )}
          </Alert>
        )}
        {!isProcessing && !completionMessage && renderStepContent()}
        {!isProcessing && completionMessage && !renderStepContent() && <div style={{minHeight: '100px'}}></div>}
      </Form>
    </Modal>
  );
};

export default GtdFlowModal;
