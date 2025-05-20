import { GtdFlowState, GtdFlowActions } from '../types/gtdFlowTypes';
import { useTasks, InternalTask } from '../../../hooks/useTasks';
import { EnergyLevel, TimeEstimate } from '../../../models/Task';

/**
 * ステップ2Aの「次へ」ボタン処理
 * @param state GTDフローの状態
 * @param actions GTDフローのアクション
 * @param taskActions タスク操作関数
 */
export const handleStep2ANext = (
  state: GtdFlowState,
  actions: GtdFlowActions,
  taskActions: ReturnType<typeof useTasks>
): void => {
  const { nonActionableOutcome, currentTask, itemName, itemDescription } = state;
  const { setIsProcessing, setCompletionMessage, setCompletionStatus, setIsTerminal, setRedirectUrl } = actions;
  const { trashTask, moveTaskToSomedayMaybe, moveTaskToReference, updateTask, addTask } = taskActions;
  
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
              energy: 'medium' as EnergyLevel,
              time: 'medium' as TimeEstimate
            });
          })
          .then(() => {
            setIsProcessing(false);
            setCompletionMessage('タスクを参考資料として保存しました。');
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
        // 新規タスクを参考資料として追加
        setIsProcessing(true);
        addTask({
          title: itemName,
          description: itemDescription,
          status: 'reference',
          priority: 'medium', // デフォルト優先度
          // GTD属性を設定
          isProject: false,
          nextAction: false,
          energy: 'medium' as EnergyLevel,
          time: 'medium' as TimeEstimate
        })
          .then(() => {
            setIsProcessing(false);
            setCompletionMessage('タスクを参考資料として追加しました。');
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
      
    default:
      setIsProcessing(false);
      break;
  }
};

/**
 * ステップ3の「次へ」ボタン処理
 * @param state GTDフローの状態
 * @param actions GTDフローのアクション
 * @param taskActions タスク操作関数
 */
export const handleStep3Next = (
  state: GtdFlowState,
  actions: GtdFlowActions,
  taskActions: ReturnType<typeof useTasks>
): void => {
  const { numActions, currentTask, itemName, itemDescription } = state;
  const { setIsProcessing, setCompletionMessage, setCompletionStatus, setIsTerminal, setRedirectUrl, setCurrentStep } = actions;
  const { convertTaskToProject, addTask } = taskActions;
  
  if (!numActions) {
    setCompletionMessage('「次のアクションは1つか複数か？」を選択してください。');
    setCompletionStatus('error');
    return;
  }
  
  // 選択に応じて分岐
  if (numActions === 'multiple') {
    // 「複数」ならプロジェクトとして登録
    setIsProcessing(true);
    
    if (currentTask) {
      // 既存タスクをプロジェクトに変換
      convertTaskToProject(currentTask.id, itemDescription)
        .then(() => {
          setIsProcessing(false);
          setCompletionMessage('タスクをプロジェクトに変換しました。プロジェクト詳細ページで次のアクションを追加してください。');
          setCompletionStatus('success');
          setRedirectUrl(`/projects/${currentTask.id}`);
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
      addTask({
        title: itemName,
        description: itemDescription,
        status: 'todo', // next-actionはstatusではなく別の属性で管理
        priority: 'medium', // デフォルト優先度
        // GTD属性を設定
        isProject: true,
        nextAction: false,
        energy: 'medium' as EnergyLevel,
        time: 'medium' as TimeEstimate
      })
        .then((newTask: InternalTask | null) => {
          if (!newTask) return;
          setIsProcessing(false);
          setCompletionMessage('新しいプロジェクトを作成しました。プロジェクト詳細ページで次のアクションを追加してください。');
          setCompletionStatus('success');
          setRedirectUrl(`/projects/${newTask.id}`);
          setIsTerminal(true); // 終了状態をセット
        })
        .catch((err: Error) => {
          console.error('プロジェクト作成エラー:', err);
          setCompletionMessage('プロジェクトの作成中にエラーが発生しました。');
          setCompletionStatus('error');
          setIsProcessing(false);
        });
    }
  } else {
    // 「1つ」なら次のステップへ
    setCurrentStep('STEP4');
  }
};

/**
 * ステップ4の「次へ」ボタン処理
 * @param state GTDフローの状態
 * @param actions GTDフローのアクション
 */
export const handleStep4Next = (
  state: GtdFlowState,
  actions: GtdFlowActions
): void => {
  const { isTwoMinuteTask } = state;
  const { setCompletionMessage, setCompletionStatus, setCurrentStep } = actions;
  
  if (!isTwoMinuteTask) {
    setCompletionMessage('「そのアクションは2分以内でできますか？」を選択してください。');
    setCompletionStatus('error');
    return;
  }
  
  // 選択に応じて分岐
  if (isTwoMinuteTask === 'yes') {
    // 「はい」なら2分タスク完了確認ステップへ
    setCurrentStep('STEP4A');
  } else {
    // 「いいえ」なら次のステップへ
    setCurrentStep('STEP5');
  }
};

/**
 * ステップ4Aの「次へ」ボタン処理
 * @param state GTDフローの状態
 * @param actions GTDフローのアクション
 * @param taskActions タスク操作関数
 */
export const handleStep4ANext = (
  state: GtdFlowState,
  actions: GtdFlowActions,
  taskActions: ReturnType<typeof useTasks>
): void => {
  const { isTaskCompleted, currentTask, itemName, itemDescription } = state;
  const { setIsProcessing, setCompletionMessage, setCompletionStatus, setIsTerminal, setCurrentStep } = actions;
  const { addTask, changeTaskStatus } = taskActions;
  
  if (!isTaskCompleted) {
    setCompletionMessage('「2分タスクを完了しましたか？」を選択してください。');
    setCompletionStatus('error');
    return;
  }
  
  // 選択に応じて分岐
  if (isTaskCompleted === 'yes') {
    // 「はい」ならタスク完了として記録
    setIsProcessing(true);
    
    if (currentTask) {
      // 既存タスクを完了に変更
      changeTaskStatus(currentTask.id, 'done')
        .then(() => {
          setIsProcessing(false);
          setCompletionMessage('タスクを完了として記録しました。');
          setCompletionStatus('success');
          setIsTerminal(true); // 終了状態をセット
        })
        .catch(err => {
          console.error('タスク状態変更エラー:', err);
          setCompletionMessage('タスクの状態変更中にエラーが発生しました。');
          setCompletionStatus('error');
          setIsProcessing(false);
        });
    } else {
      // 新規タスクを完了状態で追加
      addTask({
        title: itemName,
        description: itemDescription,
        status: 'done',
        priority: 'medium', // デフォルト優先度
        // GTD属性を設定
        isProject: false,
        nextAction: true,
        energy: 'low' as EnergyLevel,
        time: 'short' as TimeEstimate
      })
        .then(() => {
          setIsProcessing(false);
          setCompletionMessage('タスクを完了として記録しました。');
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
    // 「いいえ」なら次のステップへ
    setCurrentStep('STEP5');
  }
};

/**
 * ステップ5の「次へ」ボタン処理
 * @param state GTDフローの状態
 * @param actions GTDフローのアクション
 * @param taskActions タスク操作関数
 */
export const handleStep5Next = (
  state: GtdFlowState,
  actions: GtdFlowActions,
  taskActions: ReturnType<typeof useTasks>
): void => {
  const { delegationChoice, delegateTo, currentTask, itemName, itemDescription } = state;
  const { setIsProcessing, setCompletionMessage, setCompletionStatus, setIsTerminal, setCurrentStep } = actions;
  const { setTaskToWaitingOn, addTask, updateTask } = taskActions;
  
  if (!delegationChoice) {
    setCompletionMessage('「自分でやるべきか、誰かに任せるか？」を選択してください。');
    setCompletionStatus('error');
    return;
  }
  
  if (delegationChoice === 'delegate_it' && !delegateTo.trim()) {
    setCompletionMessage('委任先を入力してください。');
    setCompletionStatus('error');
    return;
  }
  
  // 選択に応じて分岐
  if (delegationChoice === 'delegate_it') {
    // 「任せる」なら委任処理
    setIsProcessing(true);
    
    if (currentTask) {
      // 既存タスクを委任状態に変更
      setTaskToWaitingOn(currentTask.id, delegateTo, itemDescription)
        .then(() => {
          setIsProcessing(false);
          setCompletionMessage(`タスクを「${delegateTo}」に委任しました。`);
          setCompletionStatus('success');
          setIsTerminal(true); // 終了状態をセット
        })
        .catch(err => {
          console.error('タスク委任エラー:', err);
          setCompletionMessage('タスクの委任中にエラーが発生しました。');
          setCompletionStatus('error');
          setIsProcessing(false);
        });
    } else {
      // 新規タスクを委任状態で追加
      addTask({
        title: itemName,
        description: itemDescription,
        status: 'wait-on',
        priority: 'medium', // デフォルト優先度
        // GTD属性を設定
        isProject: false,
        nextAction: true,
        energy: 'medium' as EnergyLevel,
        time: 'medium' as TimeEstimate,
        delegatedTo: delegateTo
      })
        .then(() => {
          setIsProcessing(false);
          setCompletionMessage(`タスクを「${delegateTo}」に委任しました。`);
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
    // 「自分でやる」なら次のステップへ
    setCurrentStep('STEP6');
  }
};

/**
 * ステップ6の「次へ」ボタン処理
 * @param state GTDフローの状態
 * @param actions GTDフローのアクション
 * @param taskActions タスク操作関数
 */
export const handleStep6Next = (
  state: GtdFlowState,
  actions: GtdFlowActions,
  taskActions: ReturnType<typeof useTasks>
): void => {
  const { hasSpecificDate, dueDate, currentTask, itemName, itemDescription } = state;
  const { setIsProcessing, setCompletionMessage, setCompletionStatus, setIsTerminal, setRedirectUrl } = actions;
  const { addTask, updateTask } = taskActions;
  
  if (!hasSpecificDate) {
    setCompletionMessage('「特定の日時が決まっているか？」を選択してください。');
    setCompletionStatus('error');
    return;
  }
  
  if (hasSpecificDate === 'yes' && !dueDate) {
    setCompletionMessage('日時を入力してください。');
    setCompletionStatus('error');
    return;
  }
  
  // 選択に応じて分岐
  setIsProcessing(true);
  
  if (currentTask) {
    // 既存タスクを更新
    updateTask(currentTask.id, {
      title: itemName,
      description: itemDescription,
      status: 'todo', // カレンダーとnext-actionはstatusではなく別の属性で管理
      // GTD属性を設定
      isProject: false,
      nextAction: true,
      energy: 'medium' as EnergyLevel,
      time: 'medium' as TimeEstimate,
      dueDate: hasSpecificDate === 'yes' ? dueDate : undefined
    })
      .then(() => {
        setIsProcessing(false);
        if (hasSpecificDate === 'yes') {
          setCompletionMessage('タスクをカレンダーに登録しました。');
          setRedirectUrl('/calendar');
        } else {
          setCompletionMessage('タスクをタスクリストに追加しました。');
          setRedirectUrl('/tasks');
        }
        setCompletionStatus('success');
        setIsTerminal(true); // 終了状態をセット
      })
      .catch(err => {
        console.error('タスク更新エラー:', err);
        setCompletionMessage('タスクの更新中にエラーが発生しました。');
        setCompletionStatus('error');
        setIsProcessing(false);
      });
  } else {
    // 新規タスクを追加
    addTask({
      title: itemName,
      description: itemDescription,
      status: 'todo', // カレンダーとnext-actionはstatusではなく別の属性で管理
      priority: 'medium', // デフォルト優先度
      // GTD属性を設定
      isProject: false,
      nextAction: true,
      energy: 'medium' as EnergyLevel,
      time: 'medium' as TimeEstimate,
      dueDate: hasSpecificDate === 'yes' ? dueDate : undefined
    })
      .then(() => {
        setIsProcessing(false);
        if (hasSpecificDate === 'yes') {
          setCompletionMessage('タスクをカレンダーに登録しました。');
          setRedirectUrl('/calendar');
        } else {
          setCompletionMessage('タスクをタスクリストに追加しました。');
          setRedirectUrl('/tasks');
        }
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
};
