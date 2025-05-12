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

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setItemName('');
      setItemDescription('');
      setIsActionable('');
      setNonActionableOutcome('');
      setNumActions('');
      setIsTwoMinuteTask('');
      setDelegationChoice('');
      setHasSpecificDate('');
      setDueDate('');
      setCompletionMessage(null);
      setCompletionStatus(null);
    } else {
      if (!completionMessage) {
        onClose();
      }
    }
  }, [isOpen]);

  const handleNextStep = () => {
    setCompletionMessage(null);
    setCompletionStatus(null);

    switch (currentStep) {
      case 1:
        if (!itemName.trim()) {
          setCompletionMessage('アイテム名を入力してください。');
          setCompletionStatus('error');
          return;
        }
        setCurrentStep(2);
        break;
      case 2:
        if (!isActionable) {
          setCompletionMessage('「行動を起こす必要があるか？」を選択してください。');
          setCompletionStatus('error');
          return;
        }
        if (isActionable === 'yes') {
          setCurrentStep(3);
        } else {
          setCurrentStep(2.1);
        }
        break;
      case 2.1:
        if (!nonActionableOutcome) {
          setCompletionMessage('「行動不要な場合、どうしますか？」を選択してください。');
          setCompletionStatus('error');
          return;
        }
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
        setCompletionStatus('success');
        break;
      case 3:
        if (!numActions) {
          setCompletionMessage('「次のアクションは1つか複数か？」を選択してください。');
          setCompletionStatus('error');
          return;
        }
        if (numActions === 'single') {
          setCurrentStep(4);
        } else {
          setCompletionMessage('これはプロジェクトです。プロジェクトリストに追加します。');
          setCompletionStatus('success');
        }
        break;
      case 4:
        if (!isTwoMinuteTask) {
          setCompletionMessage('「そのアクションは2分以内でできますか？」を選択してください。');
          setCompletionStatus('error');
          return;
        }
        if (isTwoMinuteTask === 'yes') {
          setCompletionMessage('2分ルール！今すぐ実行しましょう。');
          setCompletionStatus('success');
        } else {
          setCurrentStep(5);
        }
        break;
      case 5:
        if (!delegationChoice) {
          setCompletionMessage('「自分でやるべきか、誰かに任せるか？」を選択してください。');
          setCompletionStatus('error');
          return;
        }
        if (delegationChoice === 'do_it') {
          setCurrentStep(6);
        } else {
          setCompletionMessage('タスクを委任します。');
          setCompletionStatus('success');
        }
        break;
      case 6:
        if (!hasSpecificDate) {
          setCompletionMessage('「特定の日時が決まっているか？」を選択してください。');
          setCompletionStatus('error');
          return;
        }
        if (hasSpecificDate === 'yes') {
          if (!dueDate) {
            setCompletionMessage('日付を入力してください。');
            setCompletionStatus('error');
            return;
          }
          const formattedDate = new Date(dueDate).toLocaleDateString('ja-JP');
          setCompletionMessage(`タスクを ${formattedDate} にスケジュールしました。`);
        } else {
          setCompletionMessage('タスクを「次のアクション」リストに追加しました。');
        }
        setCompletionStatus('success');
        break;
      default:
        break;
    }
  };

  const handlePreviousStep = () => {
    setCompletionMessage(null);
    setCompletionStatus(null);

    if (currentStep === 2.1) {
      setCurrentStep(2);
    } else if (currentStep > 1) {
      setCurrentStep(prev => Math.max(1, Math.floor(prev - 1)));
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

  const handleModalClose = () => {
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
