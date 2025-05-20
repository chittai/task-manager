# GTDフローモジュール

このモジュールは、GTD（Getting Things Done）の処理フローに従ってタスクを整理するためのコンポーネントとフックを提供します。

## 構成

```
src/
  components/
    GtdFlow/                              # GTDフローモジュール
      components/                         # UIコンポーネント
        CompletionMessage.tsx             # 完了メッセージ表示
        GtdFlowFooter.tsx                 # モーダルフッター
        Step1.tsx                         # ステップ1：入力フォーム
        Step2.tsx                         # ステップ2：行動可否判断
        Step2A.tsx                        # ステップ2A：行動不要処理
        Step3.tsx                         # ステップ3：アクション数判断
        Step4.tsx                         # ステップ4：2分ルール判断
        Step4A.tsx                        # ステップ4A：タスク完了確認
        Step5.tsx                         # ステップ5：委任判断
        Step6.tsx                         # ステップ6：日時指定
        StepContent.tsx                   # ステップコンテンツ表示
      hooks/                              # カスタムフック
        useGtdFlowState.ts                # フローの状態管理
        useGtdFlowNavigation.ts           # ステップ間のナビゲーション
        useGtdFlowActions.ts              # アクション実行ロジック
      utils/                              # ユーティリティ
        gtdFlowHelpers.ts                 # ヘルパー関数
      types/                              # 型定義
        gtdFlowTypes.ts                   # 型定義ファイル
      index.ts                            # エクスポート用
      GtdFlowModal.tsx                    # メインコンポーネント
```

## 使用方法

```tsx
import { GtdFlowModal } from './components/GtdFlow';

// コンポーネントの使用例
const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>GTDフローを開く</Button>
      <GtdFlowModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        memoId={/* オプション: 既存のメモID */} 
      />
    </>
  );
};
```

## GTDフローのステップ

1. **ステップ1**: それは何か？
   - アイテム名と説明を入力

2. **ステップ2**: 行動を起こす必要があるか？
   - はい/いいえを選択

3. **ステップ2A**: 行動不要な場合、どうするか？
   - ゴミ箱/いつか実行/参考資料を選択

4. **ステップ3**: 次のアクションは1つか複数か？
   - 1つ/複数を選択

5. **ステップ4**: そのアクションは2分以内でできるか？
   - はい/いいえを選択

6. **ステップ4A**: 2分タスク完了確認
   - 完了したかどうかを確認

7. **ステップ5**: 自分でやるべきか、誰かに任せるか？
   - 自分でやる/誰かに任せるを選択

8. **ステップ6**: 特定の日時が決まっているか？
   - はい/いいえを選択し、日付を指定

## カスタムフック

### useGtdFlowState

GTDフローの状態を管理するフック。

```tsx
const [state, actions] = useGtdFlowState();
```

### useGtdFlowNavigation

ステップ間のナビゲーションを管理するフック。

```tsx
const navigation = useGtdFlowNavigation(state, actions, onClose, stepActions);
```

### useGtdFlowActions

アクション実行ロジックを提供するフック。

```tsx
const stepActions = useGtdFlowActions(state, actions, taskActions);
```

## 型定義

主な型定義は `gtdFlowTypes.ts` に含まれています。

- `GtdFlowStep`: フローのステップを表す文字列リテラル型
- `GtdFlowState`: フローの状態を表すインターフェース
- `GtdFlowActions`: フローのアクションを表すインターフェース
- `GtdFlowNavigation`: ナビゲーション関数を表すインターフェース
- `GtdFlowModalProps`: モーダルのプロパティを表すインターフェース
