# Cloudscape タスク管理アプリケーション

AWS Cloudscapeデザインシステムを使用したタスク管理アプリケーションです。

## 機能

- タスクの作成、編集、削除
- タスクのステータス管理（未着手、進行中、完了）
- タスクの優先度設定（低、中、高）
- タスクの期限設定
- タスクのフィルタリングと検索
- ローカルストレージを使用したデータ保存
- **GTDフロー機能**（Getting Things Done）
  - タスクの整理・分類支援
  - 改善されたエラーハンドリング
  - デバッグ機能付き

## 最新の更新（v1.1.0）

### GTDフローエラー修正
- タスクが見つからない場合のエラーハンドリング改善
- ローディング状態の適切な表示
- デバッグ情報の追加
- より詳細なエラーメッセージ

詳細な修正内容については [GTD_FLOW_ERROR_FIX.md](./GTD_FLOW_ERROR_FIX.md) をご確認ください。

## 使用技術

- React
- TypeScript
- AWS Cloudscape Design System
- LocalStorage API

## 始め方

### 必要条件

- Node.js (v14以上)
- npm (v6以上)

### インストール

```bash
# プロジェクトディレクトリに移動
cd task-manager

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、アプリケーションが表示されます。

## 使い方

1. 「新しいタスク」ボタンをクリックして、タスクを作成します。
2. タスクカードの編集アイコンをクリックして、タスクを編集します。
3. タスクカードの削除アイコンをクリックして、タスクを削除します。
4. タスクカードのステータスボタンをクリックして、タスクのステータスを変更します。
5. フィルターを使用して、特定のタスクを検索します。
6. **GTDフロー**：タスクを選択してGTDフローを開始し、タスクを適切に整理・分類します。

## トラブルシューティング

### GTDフローでエラーが発生する場合

1. ブラウザの開発者ツールを開く
2. コンソールタブで以下を実行：
```javascript
// デバッグツールを実行
gtdFlowDebug.runConsoleTests();

// 利用可能なタスクIDを確認
gtdFlowDebug.debugUtils.showAvailableTaskIds();

// テスト用タスクを作成
gtdFlowDebug.debugUtils.createTestTask();
```

3. 詳細な情報については [GTD_FLOW_ERROR_FIX.md](./GTD_FLOW_ERROR_FIX.md) を参照

## プロジェクト構造

```
src/
  ├── components/             # UIコンポーネント
  │   ├── TaskCard.tsx        # タスクカードコンポーネント
  │   ├── TaskForm.tsx        # タスク作成・編集フォーム
  │   ├── TaskList.tsx        # タスク一覧表示
  │   ├── TaskModal.tsx       # タスク作成・編集モーダル
  │   └── GtdFlow/            # GTDフロー関連コンポーネント
  │       ├── GtdFlowModal.tsx
  │       ├── components/
  │       ├── hooks/
  │       ├── types/
  │       └── utils/
  ├── hooks/                  # カスタムフック
  │   └── useTasks.ts         # タスク管理ロジック
  ├── models/                 # データモデル
  │   └── Task.ts             # タスクのインターフェース定義
  ├── utils/                  # ユーティリティ
  │   └── gtdFlowDebug.ts     # GTDフローデバッグツール
  ├── App.tsx                 # メインアプリケーション
  └── index.tsx               # エントリーポイント
```

## テストとデバッグ

### GTDフローのテスト
- 手動テスト用のデバッグツールが `src/utils/gtdFlowDebug.ts` に含まれています
- ブラウザのコンソールで `gtdFlowDebug` オブジェクトを使用してテストを実行できます

### 自動テスト
```bash
# テストの実行
npm test

# Playwrightテストの実行（E2Eテスト）
npm run test:e2e
```

## 貢献

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で配布されています。詳細は `LICENSE` ファイルを参照してください。

## バージョン履歴

- **v1.1.0** (2025-05-22): GTDフローエラーハンドリング改善
  - タスク検証機能の追加
  - ローディング状態の改善
  - デバッグツールの追加
- **v1.0.0**: 初期リリース
