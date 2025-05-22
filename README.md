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

## 最新の更新（v1.2.0）

### GTDフロー包括的テストスイート
- **8つの主要パターン**を網羅したPlaywrightテスト
- **自動スクリーンショット取得**機能
- **HTMLレポート生成**機能
- **エラーハンドリング**テスト
- **CI/CD対応**

詳細な修正内容については [GTD_FLOW_ERROR_FIX.md](./GTD_FLOW_ERROR_FIX.md) をご確認ください。

## 使用技術

- React
- TypeScript
- AWS Cloudscape Design System
- LocalStorage API
- **Playwright**（E2Eテスト）

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

# Playwrightのインストール（テスト実行時）
npx playwright install

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

## テストとデバッグ

### 🧪 GTDフローテスト

包括的なPlaywrightテストスイートが実装されています：

```bash
# GTDフローの全パターンテスト
npm run test:gtd-flow

# ブラウザ表示モードでテスト
npm run test:gtd-flow:headed

# テスト実行 + HTMLレポート生成
npm run test:gtd-flow:full

# レポートのみ生成
npm run generate:test-report
```

#### 📊 テスト対象パターン

1. **🗑️ パターン1**: 非実行項目をゴミ箱に移動
2. **⏰ パターン2**: いつかやるリストに移動
3. **📚 パターン3**: 参照資料に分類
4. **🎯 パターン4**: プロジェクト化
5. **⚡ パターン5**: 2分以内で即実行
6. **📅 パターン6**: カレンダーに登録
7. **📝 パターン7**: 次のアクションリストに追加
8. **👥 パターン8**: 他者に委任

#### 📸 スクリーンショット機能

- 各テストパターンで**全ステップ**のスクリーンショットを自動取得
- **HTMLレポート**でビジュアル確認可能
- **モーダル表示**での拡大確認
- **タイムスタンプ付き**ファイル名で整理

詳細は [GTDフローテストガイド](./tests/GTD_FLOW_TESTING_GUIDE.md) を参照してください。

### その他のテスト

```bash
# 全E2Eテストを実行
npm run test:e2e

# Playwright UIモードで実行
npm run test:e2e:ui

# ユニットテストの実行
npm test

# テスト結果のクリーンアップ
npm run clean:test-results
```

### デバッグツール

#### GTDフローのデバッグ
ブラウザのコンソールで以下を実行してください：
```javascript
// デバッグツールを実行
gtdFlowDebug.runConsoleTests();

// 利用可能なタスクIDを確認
gtdFlowDebug.debugUtils.showAvailableTaskIds();

// テスト用タスクを作成
gtdFlowDebug.debugUtils.createTestTask();
```

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

### テストエラーの場合

1. アプリケーションが起動していることを確認
```bash
curl http://localhost:3000
```

2. ブラウザ表示モードでデバッグ
```bash
npm run test:gtd-flow:headed
```

3. 詳細なテストガイドを参照: [GTDフローテストガイド](./tests/GTD_FLOW_TESTING_GUIDE.md)

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
  │       ├── components/     # ステップコンポーネント
  │       ├── hooks/          # カスタムフック
  │       ├── types/          # 型定義
  │       └── utils/          # ユーティリティ
  ├── hooks/                  # カスタムフック
  │   └── useTasks.ts         # タスク管理ロジック
  ├── models/                 # データモデル
  │   └── Task.ts             # タスクのインターフェース定義
  ├── utils/                  # ユーティリティ
  │   └── gtdFlowDebug.ts     # GTDフローデバッグツール
  ├── App.tsx                 # メインアプリケーション
  └── index.tsx               # エントリーポイント

tests/
  ├── gtd-flow-comprehensive.test.ts  # GTDフロー包括テスト
  ├── utils/
  │   └── gtd-flow-test-reporter.ts   # HTMLレポート生成
  └── GTD_FLOW_TESTING_GUIDE.md       # テストガイド

test-results/
  ├── gtd-flow-screenshots/           # スクリーンショット
  └── gtd-flow-reports/               # HTMLレポート
```

## CI/CD

### GitHub Actions

自動テストとレポート生成がGitHub Actionsで実行されます：

```yaml
# .github/workflows/gtd-flow-tests.yml
- name: Run GTD Flow tests
  run: npm run test:gtd-flow:full

- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: gtd-flow-test-results
    path: test-results/
```

## 貢献

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. **テストを追加・実行**してください:
   ```bash
   npm run test:gtd-flow:full
   ```
4. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
5. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
6. プルリクエストを作成

### テスト要件

- 新機能には対応するE2Eテストを追加
- GTDフロー関連の変更にはスクリーンショット付きテストを含める
- テストレポートで動作確認を行う

## ライセンス

このプロジェクトはMITライセンスの下で配布されています。詳細は `LICENSE` ファイルを参照してください。

## バージョン履歴

- **v1.2.0** (2025-05-22): GTDフロー包括的テストスイート追加
  - 8パターンの完全テストカバレッジ
  - 自動スクリーンショット取得
  - HTMLレポート生成機能
  - CI/CD対応
- **v1.1.0** (2025-05-22): GTDフローエラーハンドリング改善
  - タスク検証機能の追加
  - ローディング状態の改善
  - デバッグツールの追加
- **v1.0.0**: 初期リリース

---

## 📞 サポート

- 🐛 **バグレポート**: [GitHub Issues](https://github.com/chittai/task-manager/issues)
- 📖 **ドキュメント**: [テストガイド](./tests/GTD_FLOW_TESTING_GUIDE.md)
- 🔧 **デバッグ**: コンソールで`gtdFlowDebug`オブジェクトを使用

🎉 **Happy Productivity with GTD!**
