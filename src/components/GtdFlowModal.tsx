import React, { useState } from 'react';
import Modal from '@cloudscape-design/components/modal';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Textarea from '@cloudscape-design/components/textarea';
import RadioGroup from '@cloudscape-design/components/radio-group';
import DateInput from '@cloudscape-design/components/date-input';
import Alert from '@cloudscape-design/components/alert';

interface GtdFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoId: string | null; // 対象のメモID
}

const GtdFlowModal: React.FC<GtdFlowModalProps> = ({ isOpen, onClose, memoId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [isActionable, setIsActionable] = useState<string | undefined>(undefined); // 'yes' or 'no'
  const [nonActionableOutcome, setNonActionableOutcome] = useState<string | undefined>(undefined); // 'trash', 'someday', 'reference'
  const [numActions, setNumActions] = useState<string | undefined>(undefined); // 'single', 'multiple'
  const [isTwoMinuteTask, setIsTwoMinuteTask] = useState<string | undefined>(undefined); // 'yes' or 'no'
  const [delegationChoice, setDelegationChoice] = useState<string | undefined>(undefined); // 'do_it', 'delegate_it'
  const [hasSpecificDate, setHasSpecificDate] = useState<string | undefined>(undefined); // 'yes' or 'no'
  const [dueDate, setDueDate] = useState('');

  // 本来は memoId を使って初期データを取得する
  // useEffect(() => {
  //   if (memoId && isOpen) {
  //     // APIからメモデータを取得し、itemName, itemDescription をセットする想定
  //     console.log(`Opening GTD Flow for memo: ${memoId}`);
  //     // setItemName(fetchedMemo.title);
  //     // setItemDescription(fetchedMemo.description);
  //   }
  // }, [memoId, isOpen]);

  const handleNextStep = () => {
    // ここでバリデーションや次のステップへの処理を行う (Issue #49 のスコープ外)
    // 現時点ではUI確認のため、単純に次のステップに進むか、特定の条件で分岐する
    if (currentStep === 2 && isActionable === 'no') {
      setCurrentStep(2.1); // ステップ2Aへ
    } else if (currentStep === 2 && isActionable === 'yes') {
      setCurrentStep(3);
    } else if (currentStep === 2.1) {
      // ステップ2Aからの遷移 (例: ゴミ箱なら終了、他なら別の処理へ)
      // このタスクではUI実装のみなので、単純に閉じるか、先に進むボタンは非活性
      if (nonActionableOutcome === 'trash') {
        console.log('Item to trash');
        onClose(); // 仮に閉じる
      } else {
        // "いつかやる" "資料" の場合は、このモーダルでは一旦ここまでとする (UIのみ)
        // handleNextStep() は次のステップがないため、何もしないか非活性
      }
    } else if (currentStep === 3 && numActions === 'multiple') {
      // プロジェクト化する場合の処理 (このモーダルではここまで)
       console.log('Convert to project');
       // 通常はプロジェクト作成画面や、タスクをプロジェクトに紐付けるUIへ遷移
       onClose(); // 仮に閉じる
    } else if (currentStep === 4 && isTwoMinuteTask === 'yes'){
      // 2分でできるなら即実行 (このモーダルではここまで)
      console.log('Do it now');
      onClose(); // 仮に閉じる
    } else if (currentStep === 6 && hasSpecificDate === 'no') {
      // 日時未定なら「いつかやる」に近い扱い (このモーダルではここまで)
      console.log('Schedule for someday/next actions list');
      onClose(); // 仮に閉じる
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    // ステップ2A(2.1)からステップ2に戻るなどの制御
    if (currentStep === 2.1) {
      setCurrentStep(2);
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Form
            header={<h2>ステップ1: それは何ですか？</h2>}
            actions=(
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={onClose}>キャンセル</Button>
                <Button variant="primary" onClick={handleNextStep} disabled={!itemName.trim()}>
                  次へ
                </Button>
              </SpaceBetween>
            )
          >
            <FormField
              label="収集したもの (タスク名、アイデアなど)"
              description="処理したいこと、頭の中にあることを具体的に記述してください。"
              errorText={!itemName.trim() ? "この項目は必須です。" : undefined}
            >
              <Input 
                value={itemName} 
                onChange={({ detail }) => setItemName(detail.value)} 
                placeholder="例: 新しいプロジェクトの企画書を作成する"
              />
            </FormField>
            <FormField
              label="詳細 (任意)"
              description="必要に応じて、背景、目的、関連情報などを追記してください。"
            >
              <Textarea 
                value={itemDescription} 
                onChange={({ detail }) => setItemDescription(detail.value)} 
                rows={4}
                placeholder="例: 来週の会議で提案するための資料。現状の課題と解決策をまとめる。"
              />
            </FormField>
          </Form>
        );
      case 2:
        return (
          <Form
            header={<h2>ステップ2: 行動を起こす必要があるか？</h2>}
            actions=(
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={handlePreviousStep}>戻る</Button>
                <Button variant="primary" onClick={handleNextStep} disabled={!isActionable}>
                  次へ
                </Button>
              </SpaceBetween>
            )
          >
            <FormField label="このアイテムに対して、具体的な行動を起こす必要がありますか？">
              <RadioGroup
                onChange={({ detail }) => setIsActionable(detail.value)}
                value={isActionable}
                items={[
                  { value: "yes", label: "はい、行動が必要です" },
                  { value: "no", label: "いいえ、今は行動不要です" },
                ]}
              />
            </FormField>
          </Form>
        );
      case 2.1: // ステップ2A (便宜上 2.1 とする)
        return (
          <Form
            header={<h2>ステップ2A: 行動不要な場合、どうしますか？</h2>}
            actions=(
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={handlePreviousStep}>戻る</Button>
                <Button 
                  variant="primary" 
                  onClick={handleNextStep} 
                  disabled={!nonActionableOutcome || (nonActionableOutcome !== 'trash' && currentStep === 2.1 ) } // ゴミ箱以外はここで終了
                >
                  {nonActionableOutcome === 'trash' ? '完了 (ゴミ箱へ)' : '決定'}
                </Button>
              </SpaceBetween>
            )
          >
            <FormField label="このアイテムの扱いはどうしますか？">
              <RadioGroup
                onChange={({ detail }) => setNonActionableOutcome(detail.value)}
                value={nonActionableOutcome}
                items={[
                  { value: "trash", label: "ゴミ箱へ (不要なもの)" },
                  { value: "someday", label: "いつかやる/たぶんやるリストへ (今はできない・やらない)" },
                  { value: "reference", label: "資料として保存 (行動は不要だが、後で参照する可能性あり)" },
                ]}
              />
            </FormField>
            {nonActionableOutcome && nonActionableOutcome !== 'trash' && (
              <Alert type="info">「いつかやる」または「資料」としてマークされます。このフローはここで完了します。</Alert>
            )}
          </Form>
        );
      case 3:
        return (
          <Form
            header={<h2>ステップ3: 次のアクションは1つですか、複数ですか？ (プロジェクト化の判断)</h2>}
            actions=(
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={handlePreviousStep}>戻る</Button>
                <Button variant="primary" onClick={handleNextStep} disabled={!numActions}>
                  次へ
                </Button>
              </SpaceBetween>
            )
          >
            <FormField label="このアイテムを完了するために必要な具体的な次のアクションは、1つで終わりますか？それとも複数のアクションが必要ですか？">
              <RadioGroup
                onChange={({ detail }) => setNumActions(detail.value)}
                value={numActions}
                items={[
                  { value: "single", label: "はい、次のアクションは1つです" },
                  { value: "multiple", label: "いいえ、複数のアクションが必要です (＝プロジェクト)" },
                ]}
              />
            </FormField>
            {numActions === 'multiple' && (
              <Alert type="info">これはプロジェクトとして扱われます。このフローはここで完了し、プロジェクト作成・タスク分解のステップに移ります。</Alert>
            )}
          </Form>
        );
      case 4:
        return (
          <Form
            header={<h2>ステップ4: そのアクションは2分以内でできますか？</h2>}
            actions=(
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={handlePreviousStep}>戻る</Button>
                <Button variant="primary" onClick={handleNextStep} disabled={!isTwoMinuteTask}>
                  次へ
                </Button>
              </SpaceBetween>
            )
          >
            <FormField label="その具体的な次のアクションは、およそ2分以内に完了できますか？">
              <RadioGroup
                onChange={({ detail }) => setIsTwoMinuteTask(detail.value)}
                value={isTwoMinuteTask}
                items={[
                  { value: "yes", label: "はい、2分以内でできます (今すぐやる)" },
                  { value: "no", label: "いいえ、2分以上かかります" },
                ]}
              />
            </FormField>
            {isTwoMinuteTask === 'yes' && (
              <Alert type="info">2分ルール！今すぐ実行しましょう。このフローはここで完了します。</Alert>
            )}
          </Form>
        );
      case 5:
        return (
          <Form
            header={<h2>ステップ5: 自分でやるべきか、誰かに任せるか？</h2>}
            actions=(
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={handlePreviousStep}>戻る</Button>
                <Button variant="primary" onClick={handleNextStep} disabled={!delegationChoice}>
                  次へ
                </Button>
              </SpaceBetween>
            )
          >
            <FormField label="そのアクションは、あなたが自分でやるべきタスクですか？ それとも他の誰かに任せることができますか？">
              <RadioGroup
                onChange={({ detail }) => setDelegationChoice(detail.value)}
                value={delegationChoice}
                items={[
                  { value: "do_it", label: "自分でやる" },
                  { value: "delegate_it", label: "誰かに任せる (連絡待ちリストへ)" },
                ]}
              />
            </FormField>
             {delegationChoice === 'delegate_it' && (
              <Alert type="info">誰かに任せる場合は、「連絡待ちリスト」に追加します。このフローはここで完了します。</Alert>
            )}
          </Form>
        );
      case 6:
        return (
          <Form
            header={<h2>ステップ6: 特定の日時が決まっているか？ (カレンダーへ)</h2>}
            actions=(
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="link" onClick={handlePreviousStep}>戻る</Button>
                <Button variant="primary" onClick={handleNextStep} disabled={!hasSpecificDate || (hasSpecificDate === 'yes' && !dueDate.trim())}>
                  {hasSpecificDate === 'yes' ? '完了 (カレンダーへ登録)' : '完了 (次の行動リストへ)'}
                </Button>
              </SpaceBetween>
            )
          >
            <FormField label="そのアクションを行うべき特定の日時、または期限がありますか？">
              <RadioGroup
                onChange={({ detail }) => {
                  setHasSpecificDate(detail.value);
                  if (detail.value === 'no') setDueDate(''); // 「いいえ」なら日付入力クリア
                }}
                value={hasSpecificDate}
                items={[
                  { value: "yes", label: "はい、特定の日時/期限があります" },
                  { value: "no", label: "いいえ、すぐには決まっていません (次の行動リストへ)" },
                ]}
              />
            </FormField>
            {hasSpecificDate === 'yes' && (
              <FormField
                label="期限日または実施日"
                description="このタスクを行う日付、または完了すべき日付を入力してください。"
                errorText={hasSpecificDate === 'yes' && !dueDate.trim() ? "日付の入力は必須です。" : undefined}
              >
                <DateInput
                  onChange={({ detail }) => setDueDate(detail.value)}
                  value={dueDate}
                  placeholder="YYYY/MM/DD"
                  openCalendarAriaLabel={(selectedDate) =>
                    "カレンダーを開く" + (selectedDate ? ", 現在の日付 " + selectedDate : "")
                  }
                />
              </FormField>
            )}
            {hasSpecificDate === 'yes' && dueDate.trim() && (
                <Alert type="success">カレンダーに登録するタスクとしてマークされます。このフローはここで完了します。</Alert>
            )}
            {hasSpecificDate === 'no' && (
                <Alert type="info">「次の行動リスト」に追加するタスクとしてマークされます。このフローはここで完了します。</Alert>
            )}
          </Form>
        );
      default:
        return <div>不明なステップです。</div>;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      onDismiss={onClose}
      visible={isOpen}
      closeAriaLabel="閉じる"
      header="GTDフロー: 頭の中を整理する"
      size="large"
    >
      {renderStepContent()}
    </Modal>
  );
};

export default GtdFlowModal;
