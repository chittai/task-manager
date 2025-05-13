import React, { useState, useEffect } from 'react';
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
} from '@cloudscape-design/components';

interface GtdFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoId: string | null;
}

const GtdFlowModal: React.FC<GtdFlowModalProps> = ({ isOpen, onClose, memoId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [isActionable, setIsActionable] = useState<'yes' | 'no' | ''>('');
  const [nonActionableOutcome, setNonActionableOutcome] = useState<'trash' | 'someday' | 'reference' | ''>('');
  const [numActions, setNumActions] = useState<'single' | 'multiple' | ''>('');
  const [isTwoMinuteTask, setIsTwoMinuteTask] = useState<'yes' | 'no' | ''>('');
  const [delegationChoice, setDelegationChoice] = useState<'do_it' | 'delegate_it' | ''>('');
  const [hasSpecificDate, setHasSpecificDate] = useState<'yes' | 'no' | ''>('');
  const [dueDate, setDueDate] = useState('');

  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState<AlertProps['type'] | null>(null);

  /**
   * モーダルが開かれたときの初期化処理を行います。
   * memoIdが渡された場合は、将来的にそのメモの情報を読み込む処理を追加できます。
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
      setDelegationChoice('');
      setHasSpecificDate('');
      setDueDate('');
      
      // メッセージ状態を初期化
      setCompletionMessage(null);
      setCompletionStatus(null);
      
      // ここでmemoIdが存在する場合、そのメモの情報を読み込む処理を将来的に追加できる
      if (memoId) {
        // 将来的に実装予定: memoIdを使用してメモ情報を取得し、フォームに初期値を設定する
        console.log(`メモID: ${memoId} の情報を読み込み予定`);
      }
    } else {
      // モーダルが閉じられたときの処理
      if (!completionMessage) {
        // 完了メッセージが表示されていない場合はモーダルを閉じる
        onClose();
      }
    }
  }, [isOpen, memoId, onClose, completionMessage]);

  /**
   * 次のステップに進むための処理を行います。
   * ユーザーの選択に基づいて適切なステップに遷移し、
   * 必要に応じてエラーメッセージや完了メッセージを表示します。
   */
  const handleNextStep = () => {
    // エラーメッセージや完了メッセージをリセット
    setCompletionMessage(null);
    setCompletionStatus(null);

    switch (currentStep) {
      case 1: // ステップ1: それは何か？
        if (!itemName.trim()) {
          setCompletionMessage('アイテム名を入力してください。');
          setCompletionStatus('error');
          return;
        }
        // 入力が有効なら次のステップへ
        setCurrentStep(2);
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
        // 選択に応じたメッセージを表示
        switch (nonActionableOutcome) {
          case 'trash':
            setCompletionMessage('アイテムはゴミ箱に移動しました。');
            break;
          case 'someday':
            setCompletionMessage('アイテムは「いつかやる」リストに追加しました。');
            break;
          case 'reference':
            setCompletionMessage('アイテムは参考資料として保存しました。');
            break;
        }
        // このステップでフローは完了
        setCompletionStatus('success');
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
          setCompletionMessage('これはプロジェクトです。プロジェクトリストに追加します。');
          setCompletionStatus('success');
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
          // 「はい」なら2分ルールを適用し、フロー完了
          setCompletionMessage('2分ルール！今すぐ実行しましょう。');
          setCompletionStatus('success');
        } else {
          // 「いいえ」なら次のステップへ
          setCurrentStep(5);
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
          setCompletionMessage('タスクを委任します。待機リストに追加しました。');
          setCompletionStatus('success');
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
          setCompletionMessage(`タスクを ${formattedDate} にスケジュールしました。カレンダーに追加しました。`);
        } else {
          // 「いいえ」なら次のアクションリストに追加し、フロー完了
          setCompletionMessage('タスクを「次のアクション」リストに追加しました。');
        }
        // このステップでフローは完了
        setCompletionStatus('success');
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
          <FormField label="そのアクションは2分以内でできますか？" description="2分で終わるタスクはすぐに実行しましょう。">
            <RadioGroup
              onChange={({ detail }) => setIsTwoMinuteTask(detail.value as 'yes' | 'no')}
              value={isTwoMinuteTask}
              items={[
                { value: 'yes', label: 'はい、2分以内で完了します' },
                { value: 'no', label: 'いいえ、2分以上かかります' },
              ]}
            />
          </FormField>
        );
      case 5:
        return (
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
      case 5: return !delegationChoice;
      case 6: return !hasSpecificDate || (hasSpecificDate === 'yes' && !dueDate);
      default: return true;
    }
  };

  const nextButtonText = () => {
    if (completionMessage) return "閉じる";
    if (currentStep === 6 || 
        (currentStep === 2.1 && nonActionableOutcome) ||
        (currentStep === 3 && numActions === 'multiple') ||
        (currentStep === 4 && isTwoMinuteTask === 'yes') ||
        (currentStep === 5 && delegationChoice === 'delegate_it')
       ) return "完了";
    return "次へ";
  };

  /**
   * モーダルを閉じる処理を行います。
   * 完了メッセージが表示されている場合は確認を求めずに閉じます。
   * それ以外の場合は、ユーザーが進行中の作業を失うことを防ぐために確認が必要です。
   */
  const handleModalClose = () => {
    // 完了メッセージが表示されている場合はそのまま閉じる
    if (completionMessage && completionStatus === 'success') {
      onClose();
      return;
    }
    
    // ここでは確認なしで閉じるが、実際の実装では確認ダイアログを表示することも検討できる
    onClose();
  };

  return (
    <Modal
      onDismiss={handleModalClose}
      visible={isOpen}
      header={getModalTitle()}
      footer={(
        <SpaceBetween direction="horizontal" size="xs">
          <Button 
            variant="link" 
            onClick={handlePreviousStep} 
            disabled={currentStep === 1 || !!completionMessage}
          >
            戻る
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              if (completionMessage) {
                onClose();
              } else {
                handleNextStep();
              }
            }}
            disabled={isNextButtonDisabled()}
          >
            {nextButtonText()}
          </Button>
        </SpaceBetween>
      )}
    >
      <Form>
        {completionMessage && (
          <Alert type={completionStatus || undefined} header={completionStatus === 'success' ? '成功' : '注意'}>
            {completionMessage}
          </Alert>
        )}
        {!completionMessage && renderStepContent()}
        {completionMessage && !renderStepContent() && <div style={{minHeight: '100px'}}></div>}
      </Form>
    </Modal>
  );
};

export default GtdFlowModal;
